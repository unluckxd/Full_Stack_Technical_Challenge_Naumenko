# Assimetria Tech Challenge Architecture

## Solution overview
- **Frontend**: Next.js 14 (App Router, TypeScript). Minimal monochrome theme, server actions for data fetch, ISR disabled for correctness. Deployed as Docker container served behind Nginx inside container for static assets.
- **Backend**: Express 5 + TypeScript, orchestrates OpenAI GPT-4o-mini to craft long-form posts. Prisma handles Postgres schema + migrations. Node-cron schedules daily generation and enforces ">=3 posts" invariant at boot.
- **Database**: PostgreSQL 15 storing articles + metadata (slug, summary, hero image, word count, generated_for date). Prisma migrations committed for reproducibility.
- **AI pipeline**: Structured JSON output prompt -> validated with Zod -> persisted. Errors bubble to Sentry hook placeholder + logged.
- **Automation**: CodeBuild builds backend/frontend Docker images, pushes to ECR. EC2 pulls latest tags via helper script and restarts docker-compose stack. Cron inside backend ensures 1 article/day.

## Component responsibilities
1. **API service**
   - `/api/articles` (paginated list, search by tag, filter by date)
   - `/api/articles/:slug` (full body)
   - `/api/articles/generate` (protected manual trigger with admin token)
   - Health + metrics endpoints.
   - Article generator service abstracts OpenAI and fallback stub (for local dev without API key).
2. **Scheduler**
   - On boot: ensure minimum seed count (3) by generating missing articles sequentially.
   - Daily cron (default 06:00 UTC) checks if article exists for current date before generating.
3. **Frontend**
   - Landing page shows hero + article cards, infinite scroll, shimmering loading state.
   - Article detail route renders Markdown body via `react-markdown` with custom typography.
   - Shared API client module handles base URL + retries + fallback data when offline.
4. **Infrastructure**
   - `infra/docker-compose.yml` spins up postgres + services locally.
   - `infra/buildspec.yml` instructs CodeBuild to login to ECR, build/push images tagged with commit SHA + `latest` alias.
   - `infra/scripts/init-ec2.sh` bootstraps Docker, Compose v2, CloudWatch agent, and systemd unit for stack.
   - `infra/scripts/deploy.sh` logs into ECR, pulls tagged images, and issues `docker compose up` on EC2.

## Data model (Prisma)
```
model Article {
  id           String   @id @default(cuid())
  slug         String   @unique
  title        String
  excerpt      String
  content      String
  heroImageUrl String
  tags         String[]
  readingTime  Int
  generatedFor DateTime @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```
- `generatedFor` enforces at most one AI post per UTC date.
- Derived fields (reading time) calculated in service layer.

## Deployment flow
1. Developer pushes to `main` (or PR merged).
2. CodeBuild kicks off with environment vars for ECR registry + repo names and Postgres migration secrets.
3. Build phase: lint/test => `docker build` for both images => `docker push` with `COMMIT_SHA` tag and `latest`.
4. Post-build: CodeBuild publishes image URIs as artifacts (optional) and triggers SNS/Slack.
5. EC2 (t3.small, Amazon Linux 2023) runs `deploy.sh <sha>` (manually or via SSM/CodePipeline) to pull new images and restart stack via compose.
6. Backend container runs migrations before starting server; scheduler is part of same process.

## Security & ops notes
- API key + DB creds stored in AWS Systems Manager Parameter Store; CodeBuild injects at build time for migrations/tests, EC2 injects at runtime via `.env` file.
- Admin endpoint secured via `X-ADMIN-TOKEN` header.
- Healthcheck endpoints for both frontend (Next.js) and backend for ALB/monitoring.
- Logging via pino -> stdout -> CloudWatch Logs.

## Next steps
- Add CDN/front door if load increases.
- Expand to multi-region Postgres / RDS.
