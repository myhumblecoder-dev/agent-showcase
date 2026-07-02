import slugify from 'slugify';

/**
 * Generates a URL-friendly slug from a given title.
 * 
 * @param title - The string to be slugified.
 * @returns The slugified string, or 'untitled' if the result is empty.
 */
export function generateSlug(title: string): string {
  const slug = slugify(title, { lower: true, strict: true });
  return slug === '' ? 'untitled' : slug;
}