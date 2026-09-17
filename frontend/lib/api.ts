export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  return base.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
}

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const pathWithoutPrefix = cleanPath.replace(/^\/api\/v1/, '');
  return getApiBaseUrl() + '/api/v1' + pathWithoutPrefix;
}
