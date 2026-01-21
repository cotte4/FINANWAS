import { NextRequest, NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";
import { createClient } from "@/lib/db/supabase";
import type { UserProfile } from "@/types/database";

/**
 * GET /api/profile
 * Returns the user profile for the authenticated user
 * Creates one if it doesn't exist
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

    const supabase = createClient();

    // Try to get existing profile
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", payload.userId)
      .maybeSingle() as { data: UserProfile | null; error: any };

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Error al obtener perfil" },
        { status: 500 }
      );
    }

    // If profile doesn't exist, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: payload.userId,
        })
        .select()
        .single();

      if (createError || !newProfile) {
        console.error("Error creating profile:", createError);
        return NextResponse.json(
          { error: "Error al crear perfil" },
          { status: 500 }
        );
      }

      return NextResponse.json(newProfile);
    }

    // Return existing profile
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in GET /api/profile:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Updates the user profile for the authenticated user
 */
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();

    // Build update object with allowed fields
    const updateData: Partial<UserProfile> = {
      updated_at: new Date().toISOString(),
    };

    // Add fields if present in request
    if (body.country !== undefined) updateData.country = body.country;
    if (body.knowledge_level !== undefined) updateData.knowledge_level = body.knowledge_level;
    if (body.main_goal !== undefined) updateData.main_goal = body.main_goal;
    if (body.risk_tolerance !== undefined) updateData.risk_tolerance = body.risk_tolerance;
    if (body.has_debt !== undefined) updateData.has_debt = body.has_debt;
    if (body.has_emergency_fund !== undefined) updateData.has_emergency_fund = body.has_emergency_fund;
    if (body.has_investments !== undefined) updateData.has_investments = body.has_investments;
    if (body.income_range !== undefined) updateData.income_range = body.income_range;
    if (body.expense_range !== undefined) updateData.expense_range = body.expense_range;
    if (body.investment_horizon !== undefined) updateData.investment_horizon = body.investment_horizon;
    if (body.questionnaire_completed !== undefined) {
      updateData.questionnaire_completed = body.questionnaire_completed;
      if (body.questionnaire_completed) {
        updateData.questionnaire_completed_at = new Date().toISOString();
      }
    }

    const supabase = createClient();

    // Update the profile
    const { data: updatedProfile, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", payload.userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { error: "Error al actualizar perfil" },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Return updated profile
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error in PUT /api/profile:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
