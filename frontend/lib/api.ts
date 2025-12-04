import { PaginatedArticles, Article } from "../types/article";

const API_BASE =
  process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with ${response.status}`);
  }

  return response.json();
};

export const getArticles = async (): Promise<PaginatedArticles> => {
  return fetchJson<PaginatedArticles>("/api/articles");
};

export const getArticle = async (slug: string): Promise<Article> => {
  return fetchJson<Article>(`/api/articles/${slug}`);
};
