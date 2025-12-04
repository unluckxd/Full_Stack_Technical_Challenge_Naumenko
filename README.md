# Assimetria Auto-Blog

An end-to-end AI generated blog built for the Assimetria full-stack/DevOps challenge. The system ships daily monochrome editorials authored by OpenAI (or mock data) and deploys to AWS using CodeBuild + ECR + Docker on EC2.

## Tech stack
- **Frontend**: Next.js 14 (App Router, TypeScript), React Markdown renderer, custom grayscale UI.
- **Backend**: Express 4 + TypeScript, Prisma ORM, OpenAI SDK, node-cron scheduler, Vitest.
- **Database**: PostgreSQL 15 (local via Docker volume, EC2 via Compose or RDS).
- **Infrastructure**: Dockerfiles per app, `docker-compose` for local + EC2, CodeBuild `buildspec` for CI/CD, ECR for images.

## Getting started locally
1. Copy environment templates:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp infra/backend.env.example infra/backend.env
   ```
   Fill in `OPENAI_API_KEY` (or set `MOCK_AI=true`).
2. Start the stack:
   ```bash
   cd infra
   docker compose up --build
   ```
   - Frontend → http://localhost:3000
   - Backend API → http://localhost:4000/api
3. Run tests:
   ```bash
   cd backend && npm test
   cd frontend && npm run lint && npm run type-check
   ```

## Daily article automation
- `node-cron` triggers `ensureDailyArticle` at 06:00 UTC.
- On boot, `startupSeeder` guarantees at least 3 stored posts.
- Manual regeneration: `npm run article:generate` (requires `ADMIN_TOKEN` header for HTTP endpoint).
 - Manual regeneration: `npm run article:generate` (requires `ADMIN_TOKEN` header for HTTP endpoint).
 - To verify cron output inside Docker, run:
    ```bash
    docker compose exec backend \
       node -e "const svc=require('./dist/services/articleService');svc.generateAndStoreArticle(undefined,new Date('2025-12-05')).then(a=>console.log('created',a.slug)).catch(console.error)"
    ```

## AWS deployment flow
1. Push to GitHub → CodeBuild runs `infra/buildspec.yml` (when AWS lifts the default 0-build quota in the selected region):
   - Installs dependencies, builds Docker images.
   - Tags with commit SHA + `latest` and pushes to ECR repos (`$ECR_REPO_BACKEND`, `$ECR_REPO_FRONTEND`).
   - _Current status: CodeBuild is configured but blocked by the regional “Cannot have more than 0 builds in queue” limit. Limit-increase request submitted to AWS Support._
2. SSH/SSM into EC2 (Amazon Linux 2023) prepared via `infra/scripts/init-ec2.sh`.
3. On EC2, run `infra/scripts/deploy.sh <backend-image> <frontend-image>`:
   - Requires `backend.env` with database + OpenAI secrets.
   - Uses `infra/docker-compose.ec2.yml` to run Postgres, backend, frontend containers and binds port 80 → frontend.
4. Optional: schedule the deploy script via cron or Systems Manager for pull-based deploys.

## Repository map
```
backend/   # Node.js API (Prisma, cron, OpenAI, Vitest)
frontend/  # Next.js UI (dark minimalist theme)
infra/     # docker-compose, buildspec, EC2 scripts
  scripts/
  docker-compose.yml        # local dev
  docker-compose.ec2.yml    # remote stack referencing ECR images
  backend.env.example
  buildspec.yml
  scripts/init-ec2.sh
  scripts/deploy.sh
  docs/ARCHITECTURE.md      # deep dive into design decisions
```

## Notes & improvements
- Swap local Postgres for RDS in production and update `DATABASE_URL` in `backend.env`.
- Add authentication to the frontend for manual article curation.
- Integrate health/metrics endpoints with CloudWatch alarms and dashboards.
- Monitor AWS CodeBuild quota requests; once concurrency >0, trigger the first pipeline run and update this README with the exact ECR tags used in production.

## Submission checklist
- **Deployed app**: `http://51.20.126.123` (EC2 public IP running the Docker Compose stack – frontend + backend + cron jobs).
- **Repository**: `https://github.com/unluckxd/Full_Stack_Technical_Challenge_Naumenko`.
- **Video demo**: _link placeholder_ – record a 30–120 sec walkthrough (UI + API + AWS console) and paste the URL here once ready.
- **CodeBuild status**: project `assimetria-autoblog` configured with GitHub source and ECR targets; build currently blocked by AWS limit `L-2DC20C30` (“0 concurrent builds”). Limit-increase request submitted on 2025‑12‑04.
