import Link from "next/link";
import { Article } from "../types/article";
import { formatDate } from "../lib/formatDate";

interface Props {
  article: Article;
}

export const ArticleCard = ({ article }: Props) => {
  return (
    <Link href={`/articles/${article.slug}`}>
      <article>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {article.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.3rem" }}>{article.title}</h3>
        <p style={{ color: "var(--fog)", marginBottom: "1rem" }}>{article.excerpt}</p>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ash)", fontSize: "0.9rem" }}>
          <span>{formatDate(article.generatedFor)}</span>
          <span>{article.readingTime} min read</span>
        </div>
      </article>
    </Link>
  );
};
