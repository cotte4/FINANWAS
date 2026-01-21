import { NextRequest, NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";
import { createClient } from "@/lib/db/supabase";
import type { User } from "@/types/database";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's information
 */
export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookie
    const token = await getAuthCookie();

    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Fetch user from database to ensure they still exist and get latest data
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("id", payload.userId)
      .maybeSingle() as { data: User | null; error: any };

    if (error || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in GET /api/auth/me:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
