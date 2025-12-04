import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { articleRouter } from "./routes/articleRoutes";
import { healthRouter } from "./routes/healthRoutes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN ?? "*",
    }),
  );
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", articleRouter);
  app.use(healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
