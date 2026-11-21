# Production deployment: one server + Supabase

This folder runs the whole site on a single Linux server (AWS Lightsail, Hetzner,
DigitalOcean or similar, 2 GB RAM minimum) with Docker. Database, admin auth and
image storage live in one Supabase project.

| Container | Image target | Purpose |
|-----------|--------------|---------|
| `caddy`   | `caddy:2`    | HTTPS (automatic Let's Encrypt), compression, forwards to `web` |
| `web`     | `runtime`    | Next.js server, not reachable from the internet directly |
| `worker`  | `tools`      | Sends queued emails every `MAIL_FLUSH_INTERVAL_SECONDS` |
| `tools`   | `tools`      | One-off: migrations, seeding, admin setup, retention |

## 1. Supabase (new project; do not reuse the earlier experiment's)

1. Create a project in the region closest to Namibia that Supabase offers.
2. **Auth → Providers → Email:** disable public sign-ups. Create the owner's admin
   user under **Auth → Users** and copy its UUID.
3. **Storage:** create buckets `atelier-submissions` (**private**) and
   `atelier-watches` (public). Under **Storage → Settings → S3**, create an access
   key and note the endpoint and region.
4. **Connect → Session pooler** gives `DATABASE_URL` (port 5432). Keep `sslmode=require`.
5. Copy the project URL and publishable key.

## 2. Resend and Turnstile

- Resend: verify the sending domain, create an API key, set `EMAIL_FROM` to an
  address on that domain.
- Cloudflare Turnstile: create a widget for the production hostname; copy the site
  key and secret key.

## 3. Server

```bash
# Ubuntu 24.04
curl -fsSL https://get.docker.com | sh
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw allow 443/udp && sudo ufw enable

git clone https://github.com/Starkite-Technologies/watchguy.git
cd watchguy/deploy
cp .env.production.example .env.production && chmod 600 .env.production
nano .env.production            # fill every value
```

Point the domain's A record at the server. Leave it **DNS only** (grey cloud) if
Cloudflare manages DNS; see "Cloudflare proxy" below for the alternative.

## 4. First deploy

```bash
docker compose --env-file .env.production build
docker compose --env-file .env.production run --rm tools npm run db:migrate
docker compose --env-file .env.production run --rm tools npm run db:seed
docker compose --env-file .env.production run --rm \
  -e ADMIN_USER_ID=SUPABASE_AUTH_UUID \
  -e ADMIN_USER_EMAIL=owner@example.com \
  -e ADMIN_USER_NAME="Store owner" \
  tools npm run db:admin
docker compose --env-file .env.production up -d
docker compose --env-file .env.production logs -f
```

Then run the acceptance test: browse and filter the catalogue, send an enquiry, submit
a watch with photos, sign in at `/admin`, approve the submission, confirm the listing
and its photos appear publicly, and confirm the admin and seller emails arrive.

## 5. Updates

```bash
cd watchguy && git pull
cd deploy
docker compose --env-file .env.production build
docker compose --env-file .env.production run --rm tools npm run db:migrate
docker compose --env-file .env.production up -d
```

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so changing any of them
needs the `build` step. Server secrets only need `up -d`.

## Operations

- **Email queue:** `docker compose ... logs worker`. Failed jobs also show in the
  admin activity page.
- **Retention:** `docker compose ... run --rm tools npm run retention:check`
  (dry run). Use `retention:apply` only after the client approves a policy.
- **Backups:** enable Supabase backups (or point-in-time recovery) and decide how
  long private seller photos are kept before launch.

## Cloudflare proxy (orange cloud), optional

The rate limiter needs each visitor's real IP. With Caddy alone, the default works.
If Cloudflare proxies the domain, every request reaches Caddy from a Cloudflare
address, so:

1. Set `TRUSTED_CLIENT_IP_HEADER=cf-connecting-ip` in `.env.production`.
2. Restrict ports 80/443 to Cloudflare's published IP ranges
   (https://www.cloudflare.com/ips/) in the server firewall. Without this, anyone
   could hit the server directly and forge the header.
3. Set the Cloudflare SSL mode to **Full (strict)**.

## Other hosts

The same two images work on Railway, Render or Fly.io: deploy the `runtime` target as
the web service (port 3000, `NEXT_PUBLIC_*` as build args), the `tools` target as a
worker running `npm run mail:worker`, and run `npm run db:migrate` from the tools
image as the release command. Those platforms sit behind their own proxy, so check
which header carries the client IP and set `TRUSTED_CLIENT_IP_HEADER` accordingly.
