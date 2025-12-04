import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/assimetria_blog"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  ADMIN_TOKEN: z.string().optional(),
  FRONTEND_ORIGIN: z.string().optional(),
  ARTICLE_CRON_SCHEDULE: z.string().default("0 6 * * *"),
  ARTICLE_MINIMUM: z.coerce.number().default(3),
  MOCK_AI: z
    .union([
      z.enum(["true", "false"]),
      z.coerce.boolean(),
    ])
    .default("false" as const)
    .transform((value) => value === true || value === "true"),
});

export const env = envSchema.parse(process.env);
