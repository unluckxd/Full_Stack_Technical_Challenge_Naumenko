import crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { aiClient } from "./aiClient";
import { calculateReadingTime } from "../utils/readingTime";
import { slugify } from "../utils/slugify";
import { logger } from "../utils/logger";
import { ArticleFilters, GeneratedArticlePayload } from "../types/article";

const DEFAULT_LIMIT = 10;

export const listArticles = async (filters: ArticleFilters) => {
  const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, 25);
  const { search, tag } = filters;

  const where = search || tag
    ? {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { excerpt: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(tag && { tags: { has: tag.toLowerCase() } }),
      }
    : undefined;

  const articles = await prisma.article.findMany({
    where,
    orderBy: { generatedFor: "desc" },
    take: limit + 1,
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : 0,
  });

  const hasNext = articles.length > limit;
  const items = hasNext ? articles.slice(0, -1) : articles;

  return {
    items,
    nextCursor: hasNext ? items[items.length - 1]?.id : null,
  };
};

export const getArticleBySlug = async (slug: string) => {
  return prisma.article.findUnique({ where: { slug } });
};

const persistArticle = async (
  payload: GeneratedArticlePayload,
  generatedFor: Date,
) => {
  const readingTime = calculateReadingTime(payload.content);
  const normalizedTags = payload.tags.map((tag) => slugify(tag));
  const baseSlug = slugify(payload.title);
  const finalSlug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;

  return prisma.article.create({
    data: {
      title: payload.title,
      excerpt: payload.excerpt,
      content: payload.content,
      heroImageUrl:
        payload.heroImageUrl.startsWith("http")
          ? payload.heroImageUrl
          : "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      tags: normalizedTags,
      readingTime,
      slug: finalSlug,
      generatedFor,
    },
  });
};

export const generateAndStoreArticle = async (topic?: string, forDate?: Date) => {
  const generatedFor = forDate ?? new Date();
  const today = new Date(generatedFor);
  today.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.article.findUnique({
    where: { generatedFor: today },
  });

  if (existing) {
    logger.info({ date: today.toISOString() }, "Article already exists for date");
    return existing;
  }

  const payload = await aiClient.generateArticle(topic);
  const article = await persistArticle(payload, today);
  logger.info({ id: article.id }, "Generated new AI article");
  return article;
};

export const ensureMinimumArticles = async () => {
  const count = await prisma.article.count();

  const shortfall = Math.max(0, env.ARTICLE_MINIMUM - count);
  if (shortfall === 0) {
    return;
  }

  logger.warn({ shortfall }, "Generating seed articles to satisfy minimum threshold");

  for (let i = 0; i < shortfall; i += 1) {
    const offsetDate = new Date();
    offsetDate.setUTCHours(0, 0, 0, 0);
    offsetDate.setUTCDate(offsetDate.getUTCDate() - (i + 1));
    await generateAndStoreArticle(undefined, offsetDate);
  }
};

export const ensureDailyArticle = async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const exists = await prisma.article.findUnique({ where: { generatedFor: today } });
  if (exists) {
    return exists;
  }

  return generateAndStoreArticle();
};
