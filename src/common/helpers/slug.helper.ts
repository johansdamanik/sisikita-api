import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a URL-friendly slug from post data.
 * Format: {kategori}-{judul-singkat}-{sisi}-{ukuran}-{kota}-{uuid-short}
 */
export function generateSlug(
  categorySlug: string,
  title: string,
  side: string,
  size: string,
  city: string,
): string {
  const shortUuid = uuidv4().split('-')[0];

  const slugParts = [
    categorySlug,
    slugify(title),
    side.toLowerCase(),
    slugify(size),
    slugify(city),
    shortUuid,
  ];

  return slugParts.filter(Boolean).join('-');
}

/**
 * Convert text to URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/[\s_]+/g, '-') // spaces/underscores to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
    .substring(0, 40); // limit length
}
