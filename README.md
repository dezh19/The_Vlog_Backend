# The Vlog Backend

This repository contains the **Strapi CMS backend** for The Vlog.

## What lives here

- Strapi 5 backend
- Content types for hero, about, booking, footer, testimonies, events, and content features
- Media uploads and CMS administration
- Helper scripts for admin/token setup

## Related repository

The frontend lives in a separate repository:

- Frontend repo: `dezh19/The_Vlog`

## Local development

1. Copy `.env.example` to `.env`
2. Fill in your secrets and local settings
3. Install dependencies:
   - `npm install`
4. Start Strapi:
   - `npm run develop`
5. Open the admin panel:
   - `http://localhost:1337/admin`

## Important Windows note

If this project lives in a OneDrive-synced directory, do **not** keep the SQLite database inside the repo.
Use a local path such as:

- `C:/dev/strapi-data/data.db`

That avoids SQLite write/sync issues that can make content disappear after restarts.

## Environment variables

Use `backend/.env.example` as your template.

Important values:

- `DATABASE_FILENAME` - SQLite file path
- `STRAPI_ADMIN_EMAIL` and `STRAPI_ADMIN_PASSWORD` - optional values used by `create-admin.js`
- `GITHUB_ACTIONS_DISPATCH_TOKEN` - optional token for triggering frontend rebuilds after CMS updates

## Creating the first admin user

Preferred option:

- Start Strapi and create the first admin through `http://localhost:1337/admin`

Optional script-based option:

1. Set `STRAPI_ADMIN_EMAIL` and `STRAPI_ADMIN_PASSWORD`
2. Run:
   - `node create-admin.js`

## Deployment checklist

Before deploying this backend:

- Use persistent storage for uploads
- Use a persistent database in production
- Set production secrets in `.env`
- Configure CORS and public/API-token permissions appropriately
- Point the frontend repo to the deployed backend URL

## Handy scripts

- `npm run develop` - local development
- `npm run build` - build admin panel
- `npm run start` - run built server

## Notes

- Do not commit real `.env` values
- Do not commit real admin passwords or API tokens
- If uploads matter in production, avoid ephemeral filesystems

## Deploy on Render (recommended)

This backend includes a Render blueprint file: `render.yaml`.

### Option A: Blueprint deploy

1. In Render, choose **New +** -> **Blueprint**
2. Select your backend repo: `dezh19/The_Vlog_Backend`
3. Render will detect `render.yaml` and provision:
   - a web service for Strapi
   - a PostgreSQL database
   - a persistent disk for uploads

### Option B: Manual deploy

If you create services manually, use:

- Build command: `npm ci && npm run build`
- Start command: `npm run start`
- Environment: Node 20
- Database: managed PostgreSQL

Required env vars (Render):

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=10000`
- `PUBLIC_URL=https://<your-render-service>.onrender.com`
- `DATABASE_CLIENT=postgres`
- `DATABASE_URL=<from-render-postgres>`
- `DATABASE_SSL=true`
- `DATABASE_SSL_SELF=true`
- `APP_KEYS` (comma-separated)
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `ENCRYPTION_KEY`
- `JWT_SECRET`

After first deploy:

1. Open `https://<your-render-service>.onrender.com/admin`
2. Create your first admin user
3. Generate a Strapi API token
4. Add that token to frontend repo env (`STRAPI_API_TOKEN`)
