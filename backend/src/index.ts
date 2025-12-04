import { createApp } from "./app";
import { env } from "./config/env";
import { bootstrapScheduler } from "./jobs/articleScheduler";
import { runStartupSeeder } from "./jobs/startupSeeder";
import { prisma } from "./lib/prisma";
import { logger } from "./utils/logger";

const start = async () => {
  try {
    await prisma.$connect();
    logger.info("Connected to database");
    await runStartupSeeder();

    const app = createApp();

    app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, "API listening");
    });

    bootstrapScheduler();
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

void start();
