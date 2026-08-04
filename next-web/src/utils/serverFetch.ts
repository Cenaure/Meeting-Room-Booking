import {API_URL} from "@/utils/http";

interface ServerFetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

// Fetch data and cache it
export default async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: {
      revalidate: options.revalidate ?? 3600,
      tags: options.tags,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${path}`);
  }

  return res.json();
}