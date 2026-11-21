# Atelier Timepieces

The ivory Atelier Timepieces marketplace is the main application at this repository root. The previous dark design remains available in Git history.

## Run locally

```powershell
git clone https://github.com/Starkite-Technologies/watchguy.git
cd watchguy
npm.cmd ci
npm.cmd run db:generate
npm.cmd run dev
```

Open **http://localhost:3002**. Admin: **http://localhost:3002/admin**.

For a local production preview, run `npm.cmd run build` followed by `npm.cmd start`. The start script stages public/static assets into Next's standalone output and listens on port 3002. Stop any development server first. `PORT` and `APP_BIND_HOST` can override the local binding.

Use Node 24 LTS. Copy `.env.example` to `.env.local` for your local configuration; set `DEMO_MODE=true` to preview the fictional catalogue without connecting services.

An ignored `.env.local` with `DEMO_MODE=true` enables a local design preview with fictional records from `prisma/demo-watches.json`. Sample cards are marked DEMO PIECE. Images are original unbranded generated concepts, not actual products. A configured production catalogue reads PostgreSQL, and does not fall back to sample records on a database error.

**Admin is always protected.** Without authentication and database configuration, `/admin` redirects to a setup-aware sign-in page; there is no unlocked demo admin session. Submissions and enquiries report that they are disconnected rather than pretending to save or send anything.

## Included

- Obsidian/ivory storefront, responsive navigation, original editorial imagery and reduced-motion support.
- Database-backed catalogue with brand, search, condition, availability and NAD price filters, stable sorting, server pagination and incremental loading.
- Individual watch URLs, touch-sized gallery controls, company/approved-third-party ownership labels, WhatsApp message preparation and website enquiries.
- Four-step anonymous seller form: seller details, watch details, photographs, review/consent. File validation, previews and upload progress.
- Server-authorized administration: inventory CRUD through archiving, publication/availability, featured selection, private submission review with editable public price/details and selected photos, customer enquiries, homepage content and audit history.
- PostgreSQL/Prisma, Supabase Auth, S3-compatible storage, Turnstile verification and durable Resend notification jobs.

## Brand and content

Edit **`src/config/brand.ts`** for the temporary name, logo URLs, contact defaults, location, social URLs and WhatsApp number. Palette variables are at the top of `src/app/globals.css`. Homepage and contact text can also be edited through the authorized studio. Replace the draft privacy/terms pages and placeholder business information before commercial launch.

Imagery source, exact prompts and saved files are documented in [docs/ASSETS.md](docs/ASSETS.md).

## Connect the backend

Use a **fresh database/separate Supabase project** for this experiment. Its normalized tables overlap the earlier experiment's table names but have different structures; do not apply these migrations blindly to an existing project.

1. Copy `.env.example` values into `.env.local`. Set `DEMO_MODE=false` when connecting real inventory.
2. Set `DATABASE_URL` to your server-only PostgreSQL URL. A Supabase session pooler connection (usually port 5432) works with the Prisma pg adapter. Require TLS in production. Never expose this value in a `NEXT_PUBLIC_` variable.
3. Set Supabase URL and publishable key. Create administrator identities through Supabase Auth; disable public sign-ups. The app has no registration endpoint. No service-role Auth key is needed by this app.
4. Set the exact `APP_ORIGIN` and a random `RATE_LIMIT_SECRET`.
5. Configure private and public image storage as described in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Keep the submissions bucket private. Product delivery can use a CDN with a private S3 origin.
6. Apply the tracked migrations:

```powershell
npm.cmd run db:migrate
npm.cmd run db:seed
```

The migration creates the related Seller, Watch, WatchImage, WatchSubmission, SubmissionImage, AdminUser, Enquiry and AdminActivityLog models, plus an email outbox and rate-limit records. It adds monetary/publication constraints, enables RLS and revokes browser-role table access. Use the appropriate trusted server database role; the initial setup expects the table owner/server role, not Supabase's anonymous role.

7. Assign the existing Auth UUID as an administrator through trusted configuration:

```powershell
$env:ADMIN_USER_ID = "EXISTING_SUPABASE_AUTH_UUID"
$env:ADMIN_USER_EMAIL = "owner@your-domain.example"
$env:ADMIN_USER_NAME = "Store owner"
npm.cmd run db:admin
```

That command grants OWNER to the configured identity; it does not create a password or a public registration flow. OWNER/EDITOR manage inventory/content. OWNER/EDITOR/REVIEWER can review seller submissions and manage enquiries. Database role checks protect every private API action.

8. Configure Turnstile keys for production public forms. Tokens are verified server-side against the action and expected hostname. Production submissions fail closed if bot verification is missing. Configure Resend and `ADMIN_EMAIL` (comma-separated recipient list) for email delivery.
9. Restart/rebuild the application. Add real watches through the admin area. Sample inventory is not automatically inserted. Optional `npm.cmd run db:seed:demo` is development-only and marks records as demos; production queries exclude those records when demo mode is off.

## Emails and operations

Submissions, seller acknowledgements, review decisions, information requests and customer enquiries create durable email jobs. Creation of a submission and its jobs is transactional. Sending happens after the response; provider failure does not roll back the saved submission. Seller contact details stay private.

Run the worker regularly (for example once per minute in a scheduled Node task), or run `npm run mail:worker`, which stays running and flushes every minute (the production Docker setup does this):

```powershell
npm.cmd run mail:flush
```

Jobs are claimed atomically, retry with backoff up to five attempts and use stable provider idempotency keys. The admin activity page shows the queue and supports retries. An accepted provider response is not proof of inbox delivery. Monitor failed jobs and provider logs; notification queues must be serviced for reliable delivery.

The retention tool is dry-run by default:

```powershell
npm.cmd run retention:check
# Only after the client approves a retention policy:
npm.cmd run retention:apply
```

It removes private images/contact records for sufficiently old rejected submissions, scrubs associated review-note detail, removes associated mail jobs, and cleans expired rate-limit counters. Approved listings, consignment obligations and enquiry retention need the client's separate policy. Old detached public inventory images are not automatically removed; review before object-lifecycle cleanup.

## Checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:browser
```

Browser tests use installed Microsoft Edge and the production build. They cover public browsing/filtering, details/enquiries, seller validation, private-route protection, mobile navigation, reduced motion and an **isolated admin UI fixture** with mocked requests. The fixture is intercepted by tests and is not an application auth-bypass route. Unit tests exercise approval validation, exact money handling, image signatures, actual Sharp re-encoding/metadata removal, failed-upload cleanup, and request body limits. Screenshots are in ignored `artifacts/`.

Real cloud authentication, PostgreSQL migration execution, S3 permissions and mail delivery require the configured services and must be acceptance-tested before launch. No cloud credentials were supplied for this build.

## Deployment

Production runbook: [deploy/README.md](deploy/README.md) (one server with Docker Compose, Caddy HTTPS and Supabase). Background and service details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). A Node standalone Docker deployment for AWS is included. This is a full server application, not a static export. Cloudflare Workers requires a specifically verified adapter and replacements for native processing/connection requirements; no Workers adapter has been selected or claimed as tested.
