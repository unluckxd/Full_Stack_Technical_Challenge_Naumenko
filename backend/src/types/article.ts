export interface GeneratedArticlePayload {
  title: string;
  excerpt: string;
  content: string;
  heroImageUrl: string;
  tags: string[];
}

export interface ArticleFilters {
  search?: string;
  tag?: string;
  limit?: number;
  cursor?: string;
}
