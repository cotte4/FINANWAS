import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ErrorTrackingProvider } from "@/components/providers/ErrorTrackingProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "Finanwas - Tu Plataforma de Educación Financiera",
  description: "Aprende a invertir y gestionar tus finanzas personales con Finanwas. Cursos interactivos, herramientas de análisis, seguimiento de portfolio y metas de ahorro. Educación financiera accesible para todos en Argentina.",
  url: "https://finanwas.com",
  ogImage: "https://finanwas.com/og-image.png",
  keywords: [
    "educación financiera",
    "inversiones",
    "finanzas personales",
    "cursos de finanzas",
    "portfolio de inversiones",
    "ahorro",
    "metas financieras",
    "Argentina",
    "aprender a invertir",
    "mercado de valores",
    "análisis financiero",
    "gestión de dinero",
    "planificación financiera",
    "inversión para principiantes"
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | Finanwas`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Finanwas",
      url: siteConfig.url,
    }
  ],
  creator: "Finanwas",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Finanwas - Educación Financiera"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@finanwas"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/manifest.json",
  verification: {
    google: "google-site-verification-code-placeholder",
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href={siteConfig.url} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>
            <ErrorTrackingProvider />
            {children}
            <Toaster />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
