import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { generateAndStoreArticle, getArticleBySlug, listArticles } from "../services/articleService";

const querySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().min(1).max(25).optional(),
  cursor: z.string().optional(),
});

const bodySchema = z.object({
  topic: z.string().optional(),
});

export const articleRouter = Router();

articleRouter.get("/articles", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = querySchema.parse(req.query);
    const data = await listArticles(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

articleRouter.get("/articles/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await getArticleBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    return res.json(article);
  } catch (error) {
    return next(error);
  }
});

articleRouter.post("/articles/generate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (env.ADMIN_TOKEN && req.get("x-admin-token") !== env.ADMIN_TOKEN) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { topic } = bodySchema.parse(req.body);
    const article = await generateAndStoreArticle(topic);
    return res.status(201).json(article);
  } catch (error) {
    return next(error);
  }
});
