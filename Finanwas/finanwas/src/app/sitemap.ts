/**
 * Dynamic Sitemap Generator for Finanwas
 *
 * This file generates a sitemap dynamically including all static and dynamic routes.
 * Next.js will automatically serve this at /sitemap.xml
 */

import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/metadata';

// Static routes configuration
const staticRoutes = [
  {
    url: '',
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  },
  {
    url: '/dashboard',
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/aprender',
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: '/investigar',
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: '/portfolio',
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: '/metas',
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: '/notas',
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: '/login',
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/register',
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
];

/**
 * Fetch dynamic course routes
 * Replace this with actual database queries when ready
 */
async function getDynamicCourseRoutes(): Promise<
  Array<{
    url: string;
    changeFrequency: 'weekly' | 'monthly';
    priority: number;
  }>
> {
  // TODO: Replace with actual database query
  // Example:
  // const courses = await db.course.findMany({
  //   select: { slug: true, updatedAt: true }
  // });

  // For now, return empty array
  // When you have courses in the database, uncomment and modify:
  /*
  const courses = await getCourses(); // Your DB query here

  return courses.map(course => ({
    url: `/aprender/${course.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    lastModified: course.updatedAt,
  }));
  */

  return [];
}

/**
 * Fetch dynamic lesson routes
 * Replace this with actual database queries when ready
 */
async function getDynamicLessonRoutes(): Promise<
  Array<{
    url: string;
    changeFrequency: 'weekly' | 'monthly';
    priority: number;
  }>
> {
  // TODO: Replace with actual database query
  // Example:
  // const lessons = await db.lesson.findMany({
  //   include: { course: true },
  //   select: { slug: true, course: { slug: true }, updatedAt: true }
  // });

  // For now, return empty array
  // When you have lessons in the database, uncomment and modify:
  /*
  const lessons = await getLessons(); // Your DB query here

  return lessons.map(lesson => ({
    url: `/aprender/${lesson.course.slug}/${lesson.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    lastModified: lesson.updatedAt,
  }));
  */

  return [];
}

/**
 * Generate complete sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static routes
  const staticSitemapEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Dynamic routes (courses and lessons)
  const dynamicCourseRoutes = await getDynamicCourseRoutes();
  const dynamicLessonRoutes = await getDynamicLessonRoutes();

  const dynamicSitemapEntries = [
    ...dynamicCourseRoutes.map((route) => ({
      url: `${baseUrl}${route.url}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...dynamicLessonRoutes.map((route) => ({
      url: `${baseUrl}${route.url}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  ];

  return [...staticSitemapEntries, ...dynamicSitemapEntries];
}
