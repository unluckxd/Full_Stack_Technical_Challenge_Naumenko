import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "../../../lib/api";
import { formatDate } from "../../../lib/formatDate";
import { ArticleBody } from "../../../components/ArticleBody";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticle(slug);
    return {
      title: `${article.title} | Assimetria Journal`,
      description: article.excerpt,
    };
  } catch {
    return {
      title: "Article | Assimetria Journal",
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const article = await getArticle(slug).catch(() => null);
  if (!article) {
    notFound();
  }

  return (
    <main style={{ maxWidth: "800px" }}>
      <Link href="/" style={{ color: "var(--fog)", display: "inline-flex", gap: "0.6rem", alignItems: "center" }}>
        ← Back to index
      </Link>

      <header style={{ margin: "2rem 0" }}>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {article.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>{article.title}</h1>
        <p style={{ color: "var(--fog)" }}>{article.excerpt}</p>
        <div style={{ color: "var(--ash)", marginTop: "1rem", display: "flex", gap: "0.8rem" }}>
          <span>{formatDate(article.generatedFor)}</span>
          <span>·</span>
          <span>{article.readingTime} min read</span>
        </div>
      </header>

      <Image
        src={`${article.heroImageUrl}?auto=format&fit=crop&w=1200&q=80`}
        alt={article.title}
        width={1200}
        height={640}
        style={{ borderRadius: 24, marginBottom: "2rem", filter: "grayscale(1)" }}
      />

      <ArticleBody markdown={article.content} />
    </main>
  );
}
