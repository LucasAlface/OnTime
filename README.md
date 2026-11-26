# OnTime

OnTime is a public transport platform for finding stops and routes and following journeys. It is a pnpm monorepo with a Next.js web app, a NestJS API, and PostgreSQL with PostGIS, accessed through Prisma 8.

## Run locally

### Requirements

- Git
- Node.js and pnpm (the repository pins pnpm in `package.json`)
- Docker with Docker Compose

### 1. Clone and install

```bash
git clone <repository-url>
cd OnTime
pnpm install
```

### 2. Start the local database

From the repository root:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

The Compose file starts PostgreSQL 17 with PostGIS on port `5433` and persists data in the `OnTime_data` Docker volume.

### 3. Configure the API

Create the API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Set the local values in `apps/api/.env`:

```env
PORT=3001
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://OnTime:OnTime_dev_password@localhost:5433/OnTime?schema=public
JWT_SECRET=replace-with-a-long-random-local-secret
NODE_ENV=development
```

Keep `.env` files private; do not commit credentials.

### 4. Prepare the database with Prisma 8

Prisma commands run in the API workspace, where `prisma.config.ts` and the contract are located. The contract source is `apps/api/src/prisma/contract.prisma`; generated `contract.json` and `contract.d.ts` should be refreshed after editing it.

For a new local database, apply the current contract:

```bash
pnpm --filter @ontime/api exec prisma contract emit
pnpm --filter @ontime/api exec prisma db init
```

For a database with the repository's migration history, apply the existing migrations instead:

```bash
pnpm --filter @ontime/api exec prisma db migrate
```

To make and apply a new migration after changing the contract:

```bash
pnpm --filter @ontime/api exec prisma contract emit
pnpm --filter @ontime/api exec prisma migration plan --name <short_name>
pnpm --filter @ontime/api exec prisma migration show migrations/app/<migration-directory>
pnpm --filter @ontime/api exec prisma db migrate
```

Review the generated migration before applying it. Use `db update` for a disposable local database when migration history does not need to be preserved; use `migration plan` and `db migrate` when keeping migration history matters.

### 5. Start the applications

Open two terminals from the repository root:

```bash
pnpm dev:api
```

```bash
pnpm dev:web
```

The web app runs at `http://localhost:3000`, the API at `http://localhost:3001`, and Swagger docs at `http://localhost:3001/api/docs`.

## Apply migrations to Supabase

Use a Supabase Postgres connection string as `SUPABASE_DATABASE_URL`. Prefer the direct database connection for migration commands; use the connection details shown in the Supabase project settings. Keep it secret and do not place it in the web app environment.

First generate and review a migration locally against the contract:

```bash
pnpm --filter @ontime/api exec prisma contract emit
pnpm --filter @ontime/api exec prisma migration plan --name <short_name>
pnpm --filter @ontime/api exec prisma migration show migrations/app/<migration-directory>
```

Then apply the reviewed migration to Supabase by passing its connection URL explicitly:

```bash
pnpm --filter @ontime/api exec prisma db migrate --db "$SUPABASE_DATABASE_URL"
```

`db migrate` applies the checked-in migration graph. Do not use `db update` for a database whose schema changes are managed through migrations. Supabase projects may require enabling PostGIS; this project also includes Prisma-managed PostGIS migration packages.

## Useful commands

```bash
pnpm build:api
pnpm build:web
pnpm --filter @ontime/api contract:emit
pnpm --filter @ontime/api exec prisma migration status
```
