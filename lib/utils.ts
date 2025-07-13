/**
 * Joins URL segments and ensures there are no double slashes
 * @param base - Base URL (e.g., 'https://example.com/' or 'https://example.com')
 * @param path - Path to append (e.g., 'blog/post' or '/blog/post')
 * @returns Properly formatted URL without double slashes
 */
export function joinUrl(base: string, path: string): string {
  // Remove trailing slash from base
  const cleanBase = base.replace(/\/$/, '')

  // Remove leading slash from path if present
  const cleanPath = path.replace(/^\//, '')

  // Join with single slash
  return `${cleanBase}/${cleanPath}`
}
