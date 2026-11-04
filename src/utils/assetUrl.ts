/** Resolve public files under Vite's deployment base, preserving remote URLs. */
export function assetUrl(url: string): string {
  if (!url.startsWith('/')) return url;
  return `${import.meta.env.BASE_URL}${url.slice(1)}`;
}
