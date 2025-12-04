import Link from "next/link";
import Image from "next/image";
import { Article } from "../types/article";
import { formatDate } from "../lib/formatDate";

interface Props {
  article: Article;
}

export const HeroArticle = ({ article }: Props) => {
  return (
    <Link href={`/articles/${article.slug}`}>
      <section className="hero-card">
        <div>
          <p className="tag-chip">Latest Essay</p>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", color: "var(--fog)" }}>
            <span>{formatDate(article.generatedFor)}</span>
            <span>·</span>
            <span>{article.readingTime} min read</span>
          </div>
        </div>
        <Image
          src={`${article.heroImageUrl}?auto=format&fit=crop&w=900&q=80`}
          alt={article.title}
          width={900}
          height={600}
          priority
        />
      </section>
    </Link>
  );
};
