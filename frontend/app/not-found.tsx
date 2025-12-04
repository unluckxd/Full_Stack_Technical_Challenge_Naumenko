import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ textAlign: "center", padding: "4rem 0" }}>
      <p className="tag-chip">404</p>
      <h1 style={{ fontSize: "3rem" }}>This article drifted away.</h1>
      <p style={{ color: "var(--fog)" }}>But there are fresh pieces waiting on the index.</p>
      <Link href="/" style={{ marginTop: "2rem", display: "inline-block" }}>
        Return home
      </Link>
    </main>
  );
}
