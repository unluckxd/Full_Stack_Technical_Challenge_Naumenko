import { ensureMinimumArticles } from "../services/articleService";
import { logger } from "../utils/logger";

export const runStartupSeeder = async () => {
  try {
    await ensureMinimumArticles();
  } catch (error) {
    logger.error({ error }, "Failed to seed minimum article count on startup");
  }
};
