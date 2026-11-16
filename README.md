# MIRSAAD TODO

MIRSAAD TODO is a production-ready task manager built as one deployable React + Express application. Express serves the Vite production bundle and the REST API on port `3000`; Prisma connects directly to an existing self-hosted Supabase PostgreSQL service using the isolated `mirsaad_todo` schema.

The project does **not** create a database container, use Supabase's public API URL as a database URL, or require Vercel, Netlify, Redis, or any external hosting dependency.

## Architecture

```text
Browser ──HTTPS──> Coolify / Traefik ──> MIRSAAD container :3000
                                         ├─ /          React SPA
                                         ├─ /api/*     Express REST API
                                         └─ Prisma ──> existing Supabase PostgreSQL
                                                        schema: mirsaad_todo
```

Security includes an HttpOnly JWT cookie, double-submit CSRF protection, bcrypt password hashing, Zod validation, Helmet headers, API and authentication rate limits, Prisma parameterization, per-user task ownership checks, generic production errors, and a non-root container user.

## Requirements

- Node.js 20.19+ or 22 LTS
- npm 10+
- PostgreSQL 14+ (the existing Supabase PostgreSQL instance)
- Docker for production image testing

## Local development

1. Copy `.env.example` to `.env` and use a development database/schema that is safe to modify.
2. Set `NODE_ENV=development`, `APP_URL=http://localhost:5173`, `COOKIE_SECURE=false`, and a random JWT secret of at least 32 characters.
3. Prepare the schema and apply migrations:

   ```bash
   npm install
   npm run prisma:generate
   npm run migrate:deploy
   npm run dev
   ```

Vite runs on `http://localhost:5173` and proxies `/api` to Express on `http://localhost:3000`.

Generate a secure JWT secret with:

```bash
openssl rand -base64 48
```

Never commit `.env`.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NODE_ENV` | yes | Use `production` in Coolify. |
| `PORT` | yes | Application port; use `3000`. |
| `DATABASE_URL` | yes | Direct PostgreSQL URL. Must target the verified database host and include `?schema=mirsaad_todo`. |
| `JWT_SECRET` | yes | Random secret, at least 32 characters. |
| `APP_URL` | yes | `https://todo.redsom.so` in production. |
| `COOKIE_SECURE` | yes | `true` behind production HTTPS. |
| `COOKIE_SAMESITE` | yes | `lax` is correct for this same-origin design. |
| `TRUST_PROXY` | yes | `1` for the single Coolify/Traefik proxy hop. |

If the database password contains characters such as `@`, `:`, `/`, `?`, or `#`, percent-encode it in `DATABASE_URL`.

## Safely obtain the existing Supabase database details

`https://supabase.redsom.so` is an HTTP API endpoint and cannot be used by Prisma. Do not guess the connection values.

1. In Coolify, open the existing Supabase resource/service.
2. Inspect its Compose configuration and environment variables. Record the PostgreSQL service name/container alias, internal port (normally `5432`), database name, and the administrator credential used by that deployment. Common variable names may include `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`, but use the values actually present in this installation.
3. In Coolify's terminal for the PostgreSQL container, confirm the database and roles without changing them:

   ```bash
   psql -U postgres -d postgres -c "SELECT current_database(), current_user;"
   psql -U postgres -d postgres -c "SELECT rolname FROM pg_roles ORDER BY rolname;"
   ```

4. Determine networking from the actual Docker configuration. On the host, an administrator can inspect network membership with `docker inspect <postgres-container>` and `docker network inspect <network-name>`. Do not publish port `5432` publicly.
5. Verify the chosen hostname from a temporary shell attached to the same network or from the deployed application terminal. A hostname working on the Docker host does not prove it works inside the application container.

Do not expose or paste the discovered administrator password into source control, build logs, browser code, or support tickets.

## Create the isolated schema and role

Run this once as the PostgreSQL/Supabase database administrator. Replace both placeholders first. Use a unique, generated password and quote it safely. This touches only the new role and `mirsaad_todo` schema; it does not change Supabase-managed schemas.

```sql
-- Run while connected to the verified target database (commonly "postgres").
CREATE ROLE mirsaad_todo_app
  LOGIN
  PASSWORD 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;

CREATE SCHEMA IF NOT EXISTS mirsaad_todo AUTHORIZATION mirsaad_todo_app;
REVOKE ALL ON SCHEMA mirsaad_todo FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA mirsaad_todo TO mirsaad_todo_app;
GRANT CONNECT ON DATABASE VERIFIED_DATABASE_NAME TO mirsaad_todo_app;

ALTER ROLE mirsaad_todo_app IN DATABASE VERIFIED_DATABASE_NAME
  SET search_path = mirsaad_todo, public;
```

If the role already exists, do not rerun `CREATE ROLE`; rotate its password with `ALTER ROLE ... PASSWORD ...` if needed. Confirm ownership before migration:

```sql
SELECT nspname, pg_get_userbyid(nspowner) AS owner
FROM pg_namespace
WHERE nspname = 'mirsaad_todo';
```

The application's `DATABASE_URL` should then resemble:

```text
postgresql://mirsaad_todo_app:ENCODED_PASSWORD@VERIFIED_INTERNAL_HOST:5432/VERIFIED_DATABASE_NAME?schema=mirsaad_todo
```

Prisma migration tables and application tables stay inside `mirsaad_todo`. Never run `prisma migrate reset`, `prisma db push --force-reset`, or any command that targets Supabase's `auth`, `storage`, `realtime`, or other managed schemas.

For stricter operational separation, create a second migration role that owns the schema and grant the runtime role only `USAGE` plus CRUD/sequence privileges. The supplied single-role setup is isolated and intentionally retains `CREATE` so the controlled `prisma migrate deploy` command can apply future versioned migrations.

## Coolify deployment

### 1. Source and application

1. Push this repository to GitHub.
2. In the existing Coolify dashboard, create a new **Application** from that repository.
3. Select **Dockerfile** as the build pack and `Dockerfile` as the file.
4. Set the exposed/container port to `3000`.
5. Add the domain `https://todo.redsom.so`. Enable Coolify-managed HTTPS and redirect HTTP to HTTPS.
6. Add every variable from `.env.example` using Coolify's secret/environment UI. Do not make `DATABASE_URL` or `JWT_SECRET` build variables and do not expose them to the client.

### 2. Connect the private database network

Docker service discovery works only when containers share a network.

- If both resources are in the same Coolify project/environment and network, attach the MIRSAAD application to that existing private network and use the verified PostgreSQL service alias as the host.
- If they are isolated, create or select a dedicated **external Docker network**, then attach both the existing Supabase PostgreSQL service and the MIRSAAD application to it through Coolify's network/service configuration. Preserve all existing Supabase networks—add the shared network; do not replace its current networks.
- Give PostgreSQL a stable, unique alias on that shared network (for example `supabase-db-mirsaad-internal`) and use that exact alias in `DATABASE_URL`.
- Do not attach the MIRSAAD app to more Supabase services than needed. Do not publish or firewall-open PostgreSQL port `5432` to the internet.

After a Coolify or Compose update, verify that both containers remain attached to the shared network; manually attached networks can be lost when a container is recreated unless declared in the managed configuration.

### 3. Apply migrations deliberately

Deploy/build the image, then use the application terminal or a one-off Coolify command against the same image and environment:

```bash
npm run migrate:deploy
```

Run this once per release before shifting traffic to code that depends on a new migration. The container start command intentionally does **not** run migrations, preventing multiple replicas from racing.

### 4. Health check and restart behavior

Set Coolify's health-check path to `/api/health`, port `3000`, protocol HTTP. The Dockerfile also contains an internal health check. Configure the application restart policy to `unless-stopped` (or Coolify's equivalent). Traefik terminates HTTPS; Express listens on `0.0.0.0:3000`.

Deploy and verify:

```bash
curl -fsS https://todo.redsom.so/api/health
curl -fsS https://todo.redsom.so/api/health/db
```

Expected responses are `{"status":"ok"}` and `{"status":"ok","database":"reachable"}`. Neither endpoint reveals credentials or internal hostnames.

## Docker commands

```bash
docker build -t mirsaad-todo:local .
docker run --rm -p 3000:3000 --env-file .env mirsaad-todo:local
```

Run migrations as a controlled one-off command:

```bash
docker run --rm --env-file .env mirsaad-todo:local npm run migrate:deploy
```

The runtime process uses a non-root user and `dumb-init` for correct signal handling. Express closes the HTTP server and Prisma pool on `SIGTERM`/`SIGINT`.

## API

All request and response bodies are JSON. Authentication is cookie-based; browser mutation requests also send the `X-CSRF-Token` header matching the non-HttpOnly CSRF cookie. The frontend initializes it with `GET /api/auth/csrf`.

| Method | Route | Authentication | Description |
|---|---|---:|---|
| `GET` | `/api/health` | no | Process health. |
| `GET` | `/api/health/db` | no | Lightweight `SELECT 1` database check. |
| `GET` | `/api/auth/csrf` | no | Initialize/return CSRF token. |
| `POST` | `/api/auth/register` | no | Create account and session. |
| `POST` | `/api/auth/login` | no | Create session. |
| `POST` | `/api/auth/logout` | yes | Clear session. |
| `GET` | `/api/auth/me` | yes | Current user profile. |
| `GET` | `/api/tasks` | yes | List tasks; accepts `search`, `status`, and `priority`. |
| `POST` | `/api/tasks` | yes | Create task. |
| `GET` | `/api/tasks/:id` | yes | Get an owned task. |
| `PUT` | `/api/tasks/:id` | yes | Edit an owned task. |
| `PATCH` | `/api/tasks/:id/status` | yes | Complete or reopen an owned task. |
| `DELETE` | `/api/tasks/:id` | yes | Delete an owned task. |
| `GET` | `/api/dashboard/stats` | yes | Counts and completion percentage. |

Valid priorities are `LOW`, `MEDIUM`, and `HIGH`. Valid statuses are `PENDING` and `COMPLETED`. Due dates use ISO 8601 date-time strings.

## Verification checklist

- [ ] `https://todo.redsom.so` loads the React application over a valid HTTPS certificate.
- [ ] `/api/health` returns HTTP 200.
- [ ] `/api/health/db` returns HTTP 200 after private networking is configured.
- [ ] Registration, logout, and login work with Secure/HttpOnly authentication cookies.
- [ ] Create, view, search, filter, edit, complete, reopen, and delete all work.
- [ ] Dashboard total, completed, pending, overdue, and completion percentage are correct.
- [ ] A second user cannot read or mutate the first user's task IDs.
- [ ] Data remains after restarting/redeploying the application container.
- [ ] `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'mirsaad_todo';` shows only MIRSAAD tables and Prisma migration metadata.
- [ ] No existing Supabase schema, service, or health check changed.
- [ ] PostgreSQL port `5432` is not publicly published.

## Troubleshooting

**`P1001: Can't reach database server`** — Confirm both containers share the declared network, use the network alias rather than `localhost`, and test DNS/port reachability inside the app container. The Supabase public API domain is not a PostgreSQL endpoint.

**`permission denied for schema mirsaad_todo`** — Confirm the role owns the schema or has `USAGE, CREATE` and that `DATABASE_URL` uses that role. Do not solve this by granting access to all schemas.

**TLS errors on an internal Docker connection** — Use the TLS mode actually configured by the existing PostgreSQL deployment. Do not blindly disable TLS on a routed/private endpoint. Prisma supports explicit URL parameters such as `sslmode=require` when the server requires them.

**Authentication works locally but not in production** — Confirm the public site is HTTPS, `COOKIE_SECURE=true`, the browser is accessing the exact configured domain, and Traefik sends the forwarded protocol headers.

**Health passes but the UI shows 404 on refresh** — Confirm traffic reaches this container on port `3000`; Express provides the React Router SPA fallback for every non-API GET route in production.

**Migration fails because an object exists** — Stop. Inspect the `mirsaad_todo` schema and `_prisma_migrations` history before changing anything. Never reset the shared database.
