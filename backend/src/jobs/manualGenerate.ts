import { generateAndStoreArticle } from "../services/articleService";
import { logger } from "../utils/logger";

(async () => {
  try {
    const nextDay = new Date();
    nextDay.setUTCHours(0, 0, 0, 0);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const article = await generateAndStoreArticle(undefined, nextDay);
    logger.info({ slug: article.slug, date: nextDay.toISOString() }, "Manually generated article for future date");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Manual generation failed");
    process.exit(1);
  }
})();
