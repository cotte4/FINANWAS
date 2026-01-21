/**
 * Metadata Configuration Utilities for Finanwas
 *
 * This module provides reusable functions for generating metadata across the app.
 * It ensures consistent SEO metadata for all pages and dynamic routes.
 */

import type { Metadata } from 'next';

// Site configuration (should match layout.tsx)
export const siteConfig = {
  name: 'Finanwas - Tu Plataforma de Educación Financiera',
  shortName: 'Finanwas',
  description: 'Aprende a invertir y gestionar tus finanzas personales con Finanwas. Cursos interactivos, herramientas de análisis, seguimiento de portfolio y metas de ahorro. Educación financiera accesible para todos en Argentina.',
  url: 'https://finanwas.com',
  ogImage: 'https://finanwas.com/og-image.png',
  twitterHandle: '@finanwas',
  locale: 'es_AR',
  keywords: [
    'educación financiera',
    'inversiones',
    'finanzas personales',
    'cursos de finanzas',
    'portfolio de inversiones',
    'ahorro',
    'metas financieras',
    'Argentina',
    'aprender a invertir',
    'mercado de valores',
    'análisis financiero',
    'gestión de dinero',
    'planificación financiera',
    'inversión para principiantes'
  ]
} as const;

// Page-specific metadata configurations
export const pageMetadata = {
  dashboard: {
    title: 'Dashboard',
    description: 'Tu panel de control financiero. Visualiza tu portfolio, progreso en cursos, metas de ahorro y obtén insights personalizados para mejorar tu salud financiera.',
    keywords: ['dashboard financiero', 'panel de control', 'resumen de inversiones', 'progreso financiero']
  },
  aprender: {
    title: 'Cursos de Finanzas - Aprende a Invertir',
    description: 'Explora nuestra biblioteca de cursos de educación financiera. Desde conceptos básicos hasta estrategias avanzadas de inversión. Aprende a tu ritmo con contenido interactivo.',
    keywords: ['cursos de finanzas', 'educación financiera', 'aprender a invertir', 'lecciones de inversión', 'formación financiera']
  },
  investigar: {
    title: 'Herramientas de Investigación Financiera',
    description: 'Accede a herramientas profesionales de análisis financiero. Investiga acciones, analiza mercados, compara activos y toma decisiones informadas de inversión.',
    keywords: ['investigación financiera', 'análisis de acciones', 'herramientas de inversión', 'research financiero', 'análisis de mercado']
  },
  portfolio: {
    title: 'Mi Portfolio de Inversiones',
    description: 'Gestiona y da seguimiento a tus inversiones. Visualiza el rendimiento de tu portfolio, analiza la distribución de activos y recibe recomendaciones de optimización.',
    keywords: ['portfolio de inversiones', 'seguimiento de inversiones', 'gestión de cartera', 'rendimiento de portfolio', 'tracking de activos']
  },
  metas: {
    title: 'Mis Metas de Ahorro',
    description: 'Define y alcanza tus objetivos financieros. Establece metas de ahorro, da seguimiento a tu progreso y recibe consejos personalizados para lograr tus sueños.',
    keywords: ['metas de ahorro', 'objetivos financieros', 'planificación de ahorro', 'metas financieras', 'ahorro personal']
  },
  notas: {
    title: 'Mis Notas Financieras',
    description: 'Organiza tus aprendizajes y estrategias financieras. Toma notas de lecciones, guarda ideas de inversión y construye tu base de conocimiento personal.',
    keywords: ['notas financieras', 'apuntes de inversión', 'diario financiero', 'organización financiera']
  },
  login: {
    title: 'Iniciar Sesión',
    description: 'Accede a tu cuenta de Finanwas. Continúa tu camino hacia la libertad financiera.',
    keywords: ['login', 'iniciar sesión', 'acceder']
  },
  register: {
    title: 'Crear Cuenta',
    description: 'Únete a Finanwas gratis. Comienza a aprender sobre finanzas personales e inversiones hoy mismo.',
    keywords: ['registro', 'crear cuenta', 'sign up', 'unirse']
  }
} as const;

/**
 * Generate metadata for a static page
 * @param page - The page key from pageMetadata
 * @param customMetadata - Optional custom metadata to override defaults
 */
export function generatePageMetadata(
  page: keyof typeof pageMetadata,
  customMetadata?: Partial<Metadata>
): Metadata {
  const config = pageMetadata[page];

  return {
    title: config.title,
    description: config.description,
    keywords: [...siteConfig.keywords, ...config.keywords],
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${siteConfig.url}/${page === 'dashboard' ? page : page}`,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${config.title} - ${siteConfig.shortName}`
        }
      ],
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    alternates: {
      canonical: `${siteConfig.url}/${page}`,
    },
    ...customMetadata,
  };
}

/**
 * Generate metadata for a course page
 * @param courseId - Unique course identifier
 * @param courseName - Display name of the course
 * @param courseDescription - Course description
 * @param courseCategory - Course category (e.g., 'inversiones', 'ahorro')
 */
export function generateCourseMetadata(
  courseId: string,
  courseName: string,
  courseDescription: string,
  courseCategory?: string
): Metadata {
  const courseUrl = `${siteConfig.url}/aprender/${courseId}`;

  return {
    title: `${courseName} - Curso de Finanzas`,
    description: courseDescription,
    keywords: [
      ...siteConfig.keywords,
      courseName,
      'curso online',
      'educación financiera online',
      courseCategory || 'finanzas'
    ],
    openGraph: {
      title: courseName,
      description: courseDescription,
      url: courseUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/courses/${courseId}/og-image.png`,
          width: 1200,
          height: 630,
          alt: courseName
        }
      ],
      locale: siteConfig.locale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: courseName,
      description: courseDescription,
      images: [`${siteConfig.url}/courses/${courseId}/og-image.png`],
      creator: siteConfig.twitterHandle,
    },
    alternates: {
      canonical: courseUrl,
    },
  };
}

/**
 * Generate metadata for a lesson page
 * @param courseId - Parent course identifier
 * @param courseName - Parent course name
 * @param lessonId - Unique lesson identifier
 * @param lessonName - Display name of the lesson
 * @param lessonDescription - Lesson description
 */
export function generateLessonMetadata(
  courseId: string,
  courseName: string,
  lessonId: string,
  lessonName: string,
  lessonDescription?: string
): Metadata {
  const lessonUrl = `${siteConfig.url}/aprender/${courseId}/${lessonId}`;
  const description = lessonDescription || `Aprende ${lessonName} en el curso ${courseName}. Educación financiera práctica y accesible.`;

  return {
    title: `${lessonName} - ${courseName}`,
    description,
    keywords: [
      ...siteConfig.keywords,
      lessonName,
      courseName,
      'lección',
      'tutorial financiero'
    ],
    openGraph: {
      title: `${lessonName} - ${courseName}`,
      description,
      url: lessonUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: lessonName
        }
      ],
      locale: siteConfig.locale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${lessonName} - ${courseName}`,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    alternates: {
      canonical: lessonUrl,
    },
  };
}

/**
 * Generate JSON-LD structured data for a course
 * This helps search engines understand the educational content
 */
export function generateCourseStructuredData(
  courseId: string,
  courseName: string,
  courseDescription: string,
  courseCategory?: string,
  provider?: { name: string; url: string }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseName,
    description: courseDescription,
    provider: provider || {
      '@type': 'Organization',
      name: siteConfig.shortName,
      url: siteConfig.url,
    },
    educationalLevel: 'Beginner to Advanced',
    inLanguage: 'es-AR',
    courseCode: courseId,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT4H', // Approximate, adjust per course
    },
    about: {
      '@type': 'Thing',
      name: courseCategory || 'Finanzas Personales',
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
    isAccessibleForFree: true,
    url: `${siteConfig.url}/aprender/${courseId}`,
  };
}

/**
 * Generate JSON-LD structured data for the organization
 * Use this on the homepage
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteConfig.shortName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
    },
    sameAs: [
      `https://twitter.com/${siteConfig.twitterHandle.replace('@', '')}`,
    ],
  };
}

/**
 * Generate JSON-LD breadcrumb structured data
 * @param items - Array of breadcrumb items
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Helper to inject structured data into a page
 * @param structuredData - The JSON-LD data object
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
