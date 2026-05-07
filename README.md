# Task Calendar

A daily task calendar with full CRUD, week/month filters, and Excel export. Built with Next.js 14, Prisma, and PostgreSQL — designed to deploy on Vercel.

## Features

- **CRUD on every entry** — add, edit, and delete tasks with date, task, and post type
- **Server-side persistence** — data stored in a real Postgres database
- **Filters** — view all tasks, this week, or this month (any reference date)
- **Excel export** — download a properly-formatted `.xlsx` of the current view (header styling, alternating rows, frozen header, autofilter)
- **Vercel-ready** — zero-config deploy

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- ExcelJS for formatted Excel exports
- Tailwind CSS + custom design tokens

---

## 1. Setup locally

```bash
# Install
npm install

# Copy env file and add your DATABASE_URL
cp .env.example .env
# edit .env

# Push schema to your database
npx prisma db push

# Run dev server
npm run dev
```

Open http://localhost:3000.

## 2. Get a free Postgres database

You need a Postgres `DATABASE_URL`. Pick one:

- **Neon** (https://neon.tech) — free tier, easiest, recommended
- **Supabase** (https://supabase.com) — free tier
- **Vercel Postgres** — auto-attaches when deploying to Vercel
- **Railway / Render** — free trials available

Paste the connection string into `.env` as `DATABASE_URL`.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: task calendar"
git branch -M main
git remote add origin https://github.com/<your-username>/task-calendar.git
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. **Add Environment Variable**: `DATABASE_URL` = your Postgres URL
4. Click **Deploy**

Vercel will run `prisma generate && next build` automatically (configured in `package.json`).

After first deploy, run schema push once against your prod DB — the easiest way is locally:

```bash
DATABASE_URL="<your-prod-url>" npx prisma db push
```

That's it. Your app is live.

---

## Project structure

```
.
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts          # GET (list/filter), POST (create)
│   │   │   └── [id]/route.ts     # PATCH (update), DELETE
│   │   └── export/route.ts       # GET → formatted .xlsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # main UI (CRUD + filters + export)
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   └── dates.ts                  # week/month range helpers
├── prisma/
│   └── schema.prisma             # Task model
├── .env.example
├── package.json
└── README.md
```

## API reference

| Method | Endpoint            | Body / Query                                              | Description                  |
| ------ | ------------------- | --------------------------------------------------------- | ---------------------------- |
| GET    | `/api/tasks`        | `?filter=all\|week\|month&refDate=YYYY-MM-DD`             | List tasks (with filter)     |
| POST   | `/api/tasks`        | `{ date, task, postType }`                                | Create task                  |
| PATCH  | `/api/tasks/:id`    | `{ date?, task?, postType? }`                             | Update fields                |
| DELETE | `/api/tasks/:id`    | —                                                         | Delete task                  |
| GET    | `/api/export`       | `?filter=all\|week\|month&refDate=YYYY-MM-DD`             | Download styled `.xlsx`      |

## Customizing post types

Open `app/page.tsx` and edit the `POST_TYPES` array near the top.

## License

MIT
