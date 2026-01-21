import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Metadata for a course
 */
export interface CourseMetadata {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  lessons_count: number;
  estimated_duration_minutes: number;
  tags: string[];
}

/**
 * Course with slug
 */
export interface Course extends CourseMetadata {
  slug: string;
}

/**
 * Metadata for a lesson
 */
export interface LessonMetadata {
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  prerequisites: string[];
  tags: string[];
}

/**
 * Lesson with slug and content
 */
export interface Lesson extends LessonMetadata {
  slug: string;
  courseSlug: string;
  content: string;
}

/**
 * Lesson summary (without full content)
 */
export interface LessonSummary extends LessonMetadata {
  slug: string;
  courseSlug: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'courses');

/**
 * Get all available courses
 * @returns Array of courses sorted by order
 * @throws Error if the courses directory doesn't exist
 */
export function getCourses(): Course[] {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      throw new Error('El directorio de cursos no existe');
    }

    const courseSlugs = fs.readdirSync(CONTENT_DIR).filter((file) => {
      const stat = fs.statSync(path.join(CONTENT_DIR, file));
      return stat.isDirectory();
    });

    const courses: Course[] = courseSlugs
      .map((slug) => {
        const metadataPath = path.join(CONTENT_DIR, slug, 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
          console.warn(`Advertencia: No se encontró metadata.json para el curso ${slug}`);
          return null;
        }

        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
          const metadata: CourseMetadata = JSON.parse(metadataContent);

          return {
            ...metadata,
            slug,
          };
        } catch (error) {
          console.error(`Error al leer metadata para el curso ${slug}:`, error);
          return null;
        }
      })
      .filter((course): course is Course => course !== null)
      .sort((a, b) => a.order - b.order);

    return courses;
  } catch (error) {
    throw new Error(
      `Error al obtener los cursos: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Get a single course by slug
 * @param slug - The course slug (e.g., "basics", "renta-variable")
 * @returns The course metadata or null if not found
 * @throws Error if there's an issue reading the course
 */
export function getCourse(slug: string): Course | null {
  try {
    const metadataPath = path.join(CONTENT_DIR, slug, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: CourseMetadata = JSON.parse(metadataContent);

    return {
      ...metadata,
      slug,
    };
  } catch (error) {
    throw new Error(
      `Error al obtener el curso ${slug}: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Get a single lesson with full content
 * @param courseSlug - The course slug (e.g., "basics")
 * @param lessonSlug - The lesson slug (e.g., "01-interes-compuesto")
 * @returns The lesson with content or null if not found
 * @throws Error if there's an issue reading the lesson
 */
export function getLesson(courseSlug: string, lessonSlug: string): Lesson | null {
  try {
    const lessonDir = path.join(CONTENT_DIR, courseSlug, lessonSlug);
    const metadataPath = path.join(lessonDir, 'metadata.json');
    const lessonPath = path.join(lessonDir, 'lesson.md');

    if (!fs.existsSync(metadataPath) || !fs.existsSync(lessonPath)) {
      return null;
    }

    // Read metadata
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata: LessonMetadata = JSON.parse(metadataContent);

    // Read lesson content
    const lessonContent = fs.readFileSync(lessonPath, 'utf-8');

    // Parse with gray-matter (in case frontmatter is added in the future)
    const { content, data } = matter(lessonContent);

    // Merge frontmatter data with metadata (metadata takes precedence)
    const finalMetadata: LessonMetadata = {
      ...data,
      ...metadata,
    } as LessonMetadata;

    return {
      ...finalMetadata,
      slug: lessonSlug,
      courseSlug,
      content,
    };
  } catch (error) {
    throw new Error(
      `Error al obtener la lección ${lessonSlug} del curso ${courseSlug}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
}

/**
 * Get all lessons in a course (without full content)
 * @param courseSlug - The course slug (e.g., "basics")
 * @returns Array of lesson summaries sorted by order
 * @throws Error if the course doesn't exist or there's an issue reading lessons
 */
export function getLessonList(courseSlug: string): LessonSummary[] {
  try {
    const courseDir = path.join(CONTENT_DIR, courseSlug);

    if (!fs.existsSync(courseDir)) {
      throw new Error(`El curso ${courseSlug} no existe`);
    }

    const lessonSlugs = fs.readdirSync(courseDir).filter((file) => {
      const stat = fs.statSync(path.join(courseDir, file));
      // Ignore metadata.json and other files, only get directories
      return stat.isDirectory();
    });

    const lessons: LessonSummary[] = lessonSlugs
      .map((slug) => {
        const metadataPath = path.join(courseDir, slug, 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
          console.warn(`Advertencia: No se encontró metadata.json para la lección ${slug}`);
          return null;
        }

        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
          const metadata: LessonMetadata = JSON.parse(metadataContent);

          return {
            ...metadata,
            slug,
            courseSlug,
          };
        } catch (error) {
          console.error(`Error al leer metadata para la lección ${slug}:`, error);
          return null;
        }
      })
      .filter((lesson): lesson is LessonSummary => lesson !== null)
      .sort((a, b) => a.order - b.order);

    return lessons;
  } catch (error) {
    throw new Error(
      `Error al obtener las lecciones del curso ${courseSlug}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
}
