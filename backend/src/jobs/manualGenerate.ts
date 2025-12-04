import { generateAndStoreArticle } from "../services/articleService";
import { logger } from "../utils/logger";

(async () => {
  try {
    const article = await generateAndStoreArticle();
    logger.info({ slug: article.slug }, "Manually generated article");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Manual generation failed");
    process.exit(1);
  }
})();
