import cron from "node-cron";
import { env } from "../config/env";
import { ensureDailyArticle } from "../services/articleService";
import { logger } from "../utils/logger";

export const bootstrapScheduler = () => {
  if (env.NODE_ENV === "test") {
    return;
  }

  cron.schedule(env.ARTICLE_CRON_SCHEDULE, async () => {
    try {
      logger.info("Running scheduled article generation job");
      await ensureDailyArticle();
      logger.info("Daily article ensured");
    } catch (error) {
      logger.error({ error }, "Scheduler failed to generate article");
    }
  });

  logger.info({ cron: env.ARTICLE_CRON_SCHEDULE }, "Article scheduler initialized");
};
