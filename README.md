AI Website Assistant – MVP

Stack: Next.js App Router (TS), Tailwind, next-intl (fi/en), Prisma (SQLite), OpenAI, Resend (optional).

Quick start

1) Requirements: Node 20+

2) Install:

```bash
npm ci
```

3) Configure env (`.env`):

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY= # optional; falls back to stub
RESEND_API_KEY= # optional
BASIC_AUTH_USER= # for /admin
BASIC_AUTH_PASS=
PAGESPEED_API_KEY= # optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4) DB migrate:

```bash
npx prisma migrate dev --name init
```

5) Dev:

```bash
npm run dev
```

Build & run:

```bash
npm run build
npm start -p 3000
```

Docker:

```bash
docker build -t ai-website-assistant .
docker run -p 3000:3000 --env-file .env ai-website-assistant
```

Endpoints

- POST `/api/analyze` { url, email?, lang: 'fi'|'en' } → { scanId }
- GET `/api/report?id=...` → Scan JSON
- Pages: `/`, `/[locale]`, `/[locale]/report/[id]`, `/[locale]/admin`

Notes

- If OPENAI_API_KEY is not set, AI summary uses a concise stub.
- Admin requires BASIC_AUTH_USER/BASIC_AUTH_PASS; middleware guards `/admin`.
