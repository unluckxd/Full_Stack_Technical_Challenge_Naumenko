import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env";
import { GeneratedArticlePayload } from "../types/article";
import { logger } from "../utils/logger";

const ArticleResponseSchema = z.object({
  title: z.string().min(10),
  excerpt: z.string().min(40),
  content: z.string().min(200),
  heroImageUrl: z.string().url().or(z.string().min(10)),
  tags: z.array(z.string().min(2)).min(3).max(6),
});

const FALLBACK_ARTICLES: GeneratedArticlePayload[] = [
  {
    title: "Designing Calm Interfaces for High-Signal Teams",
    excerpt:
      "A practical field guide to crafting neutral, information-dense interfaces that reduce noise while keeping mission-critical cues visible.",
    content:
      "### Why calm UI matters\n\nInformation workers drown in notifications. Neutral palettes paired with intentional contrast help teams spot signal instantly.\n\n1. **Start in grayscale.** Lock in hierarchy using tone before considering accent colors.\n2. **Reserve saturation.** Allow a single accent color for primary actions or status alerts.\n3. **Balance typography.** Mix a confident display font for headlines with a highly readable text family.\n\n### Implementation checklist\n- Audit every color token; remove anything that lacks semantic meaning.\n- Create a spacing scale and stick to it across cards, grids, and modals.\n- Combine micro animations (opacity fades, scale) with longer page-load reveals to set rhythm.\n\nCalm interfaces are not boring—they are confident. They give teams mental space to think.",
    heroImageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
    tags: ["design", "ux", "systems"],
  },
  {
    title: "Automating Editorial Pipelines with TypeScript",
    excerpt:
      "How a lightweight Node.js service plus cron can publish a daily opinion piece without human intervention.",
    content:
      "### Architecture recap\n- Prisma maintains a normalized article catalog.\n- node-cron schedules a job at 06:00 UTC.\n- An AI client requests structured markdown from GPT-4o.\n\n### Hardening tips\n1. **Validate everything.** Parse the AI payload with Zod before persisting.\n2. **Store generation context.** Keep timestamps and prompt IDs for audits.\n3. **Throttle output.** Enforce one article per day via a `generatedFor` column.\n\n### Result\nWith under 400 lines of TypeScript you can operate an always-on editorial feed, freeing designers to focus on the front-of-house experience.",
    heroImageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    tags: ["node", "automation", "ai"],
  },
  {
    title: "Monochrome Branding That Still Feels Premium",
    excerpt:
      "Minimal palettes thrive when contrast, material, and motion are choreographed with intent.",
    content:
      "### Palette\nStick to charcoal (#0C0C0C), graphite (#2B2B2B), fog (#8A8A8A), and paper (#F5F5F5). Introduce white sparingly for breathing room.\n\n### Motion grammar\n- Stage content with staggered 60ms reveals.\n- Use scale + blur on hover to hint at depth.\n- Favor bezier timing (0.16, 1, 0.3, 1) for assertive ease.\n\n### Typography\nBlend a geometric sans for headings with a sober grotesk for body copy. The contrast reinforces hierarchy without shouting.\n\nMinimalism is a choice, not an absence. Curate every pixel.",
    heroImageUrl: "https://images.unsplash.com/photo-1469478713490-0c41f0683acf",
    tags: ["branding", "ui", "motion"],
  },
];

export class AiClient {
  private client: OpenAI | null;

  constructor() {
    this.client = env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
      : null;
  }

  async generateArticle(topic?: string): Promise<GeneratedArticlePayload> {
    if (!this.client || env.MOCK_AI) {
      logger.warn("AI client running in MOCK mode; returning fallback article");
      const random = FALLBACK_ARTICLES[Math.floor(Math.random() * FALLBACK_ARTICLES.length)];
      return random;
    }

    const completion = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an editorial AI that writes modern, opinionated product and design articles. Output strict JSON with keys title, excerpt, content, heroImageUrl, tags.",
        },
        {
          role: "user",
          content: `Create an original long-form blog post about ${topic ?? "a forward-looking product development insight"}. Respond with JSON containing title, excerpt, content (markdown), heroImageUrl, tags (array of lowercase slugs).`,
        },
      ],
    });

    const jsonText = completion.choices[0]?.message?.content;

    if (!jsonText) {
      logger.error({ completion }, "OpenAI response missing text payload");
      throw new Error("Failed to generate article");
    }

    const parsed = ArticleResponseSchema.parse(JSON.parse(jsonText));
    return parsed;
  }
}

export const aiClient = new AiClient();
