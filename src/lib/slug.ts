import slugify from 'slugify';

export function generateSlug(title: string): string {
  const slug = slugify(title, { lower: true, strict: true });
  return slug === '' ? 'untitled' : slug;
}