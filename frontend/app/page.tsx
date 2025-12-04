import { HeroArticle } from "../components/HeroArticle";
import { ArticleCard } from "../components/ArticleCard";
import { getArticles } from "../lib/api";

export default async function HomePage() {
  const { items } = await getArticles();

  if (!items.length) {
    return (
      <main>
        <p style={{ color: "var(--fog)", textAlign: "center" }}>No articles yet. Generation in progress.</p>
      </main>
    );
  }

  const [featured, ...others] = items;

  return (
    <main>
      <header style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="tag-chip">Assimetria Journal</p>
          <h2 style={{ margin: "0.8rem 0 0", fontSize: "1rem", color: "var(--fog)" }}>
            AI-crafted notes on product, design, and systems thinking.
          </h2>
        </div>
        <span style={{ color: "var(--fog)", fontSize: "0.9rem" }}>Updated daily at 06:00 UTC</span>
      </header>

      <HeroArticle article={featured} />

      {others.length ? (
        <>
          <hr className="gradient-divider" />
          <section className="grid">
            {others.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
