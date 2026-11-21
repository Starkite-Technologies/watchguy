# Hosting on Cloudflare (production)

Watchguy runs on **Cloudflare Workers**, built and deployed by **Workers Builds** on
every push to `main`, the same way as the Starkite website. Everything else is free
tier:

| Piece | Service | Notes |
|-------|---------|-------|
| Web app | Cloudflare Worker `watchguy` (OpenNext) | Bundle about 2.8 MiB gzipped |
| Database | Supabase Postgres, project `watchguy` (eu-west-1) | Reached through Cloudflare **Hyperdrive** |
| Admin sign-in | Supabase Auth (same project) | Public sign-ups disabled |
| Photos | Supabase Storage (S3 API): `atelier-submissions` (private), `atelier-watches` (public) | |
| Photo processing | Cloudflare **Images** binding | Replaces sharp on Workers |
| Email queue | Cron Trigger every minute → `/api/internal/mail-flush` | Sends through Resend |
| Bot checks | Cloudflare Turnstile | |

## Plan limits to watch

Workers Free allows a 3 MiB bundle (this app is about 2.8 MiB) and **10 ms of CPU per
request**. Server-rendered pages can exceed 10 ms; if the dashboard shows
"Exceeded CPU Time Limits" (error 1102), switch the account to **Workers Paid
(US$5/month)**, which allows 10 MiB and up to 5 minutes of CPU.

## Build settings (Workers Builds)

- Repository: `Starkite-Technologies/watchguy`, branch `main`
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`
- Build variables (public, baked into the browser bundle):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
  `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`

## Worker settings

Plain variables are in `wrangler.jsonc`. Add these in the dashboard
(Workers → watchguy → Settings → Variables and Secrets):

| Name | Type | Value |
|------|------|-------|
| `APP_ORIGIN` | Text | The site's exact https origin, e.g. `https://watchguy.<account>.workers.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | Text | Same as the build variable |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Text | Same as the build variable |
| `RATE_LIMIT_SECRET` | Secret | Random, 32+ characters |
| `S3_REGION` | Text | `eu-west-1` |
| `S3_ENDPOINT` | Text | `https://sdcxmjqxyvikdathhluq.storage.supabase.co/storage/v1/s3` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Secret | Supabase → Storage → S3 access keys |
| `PUBLIC_ASSET_BASE_URL` | Text | `https://sdcxmjqxyvikdathhluq.supabase.co/storage/v1/object/public/atelier-watches` |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile widget secret |
| `RESEND_API_KEY` | Secret | Optional until email is wanted |
| `EMAIL_FROM`, `ADMIN_EMAIL` | Text | Verified Resend sender; admin recipients |

The Hyperdrive id goes in `wrangler.jsonc` (`hyperdrive[0].id`). Create it under
Storage & databases → Hyperdrive with the Supabase **direct** connection
(`db.sdcxmjqxyvikdathhluq.supabase.co`, port 5432, database `postgres`, user
`postgres`).

No `CRON_SECRET` is needed on Cloudflare: the Cron Trigger authenticates to the
email route with a random token created inside the Worker.

## Database changes

`prisma/migrations` is the source of truth. The initial migration was applied
through the Supabase SQL editor, including the `_prisma_migrations` record, so a
later `npx prisma migrate deploy` (with the direct `DATABASE_URL`) only applies newer
migrations.

## Admins

1. Supabase → Authentication → Users → add the owner (email + password).
2. Grant the role, in the SQL editor:
   ```sql
   INSERT INTO "AdminUser" (id, email, name, role)
   VALUES ('<auth user uuid>', 'owner@example.com', 'Store owner', 'OWNER');
   ```

## Local preview of the Worker

```sh
npm run cf:build
npx wrangler dev   # needs .dev.vars and a localConnectionString for Hyperdrive
```
