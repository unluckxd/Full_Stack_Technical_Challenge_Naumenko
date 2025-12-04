import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/utils/slugify";
import { calculateReadingTime } from "../src/utils/readingTime";

const seedArticles = [
  {
    title: "Crafting Neutral Interfaces That Still Feel Premium",
    excerpt:
      "A blueprint for monochrome product experiences that feel intentional, calm, and editorial.",
    content:
      "## Build a tonal system\nStart in grayscale to cement hierarchy before layering motion or accent colors.\n\n## Let typography guide attention\nPair a sharp display face with a utilitarian grotesk for body content.\n\n## Code pointers\n- Define CSS variables for charcoal, graphite, fog, snow.\n- Use prefers-color-scheme media queries to add depth when needed.",
    heroImageUrl: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf",
    tags: ["design", "ui", "minimal"],
  },
  {
    title: "Daily Content Pipelines with Prisma and Cron",
    excerpt:
      "Tie Prisma, OpenAI, and node-cron together to guarantee a new opinion piece every morning.",
    content:
      "1. Model articles with a generatedFor date.\n2. Schedule a cron to run at 06:00 UTC.\n3. Short-circuit if an article already exists for the day.\n4. Persist and broadcast via SSE/webhooks if needed.",
    heroImageUrl: "https://images.unsplash.com/photo-1469478713490-0c41f0683acf",
    tags: ["node", "automation", "ai"],
  },
  {
    title: "Postgres Tips for Tiny Editorial Teams",
    excerpt:
      "Use a single table, a couple functional indexes, and a view for feeds—simplicity scales further than you expect.",
    content:
      "### Checklist\n- Index slug and generatedFor.\n- Store tags as text[].\n- Keep search simple with ILIKE before reaching for full text search.",
    heroImageUrl: "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea",
    tags: ["postgres", "data", "ops"],
  },
];

const run = async () => {
  for (const [index, item] of seedArticles.entries()) {
    const slug = `${slugify(item.title)}-${Math.random().toString(16).slice(2, 6)}`;
    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        ...item,
        slug,
        tags: item.tags.map((tag) => slugify(tag)),
        readingTime: calculateReadingTime(item.content),
        generatedFor: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      },
    });
  }
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
