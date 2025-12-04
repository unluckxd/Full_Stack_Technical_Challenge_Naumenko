export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  heroImageUrl: string;
  tags: string[];
  readingTime: number;
  generatedFor: string;
  createdAt: string;
}

export interface PaginatedArticles {
  items: Article[];
  nextCursor: string | null;
}
