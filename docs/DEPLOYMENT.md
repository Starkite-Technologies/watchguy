# Deployment and service compatibility

## Supported starting point: a Node.js server/container

Use the included Dockerfile with Node 24, Next.js standalone output and server-side secrets. A typical AWS deployment uses ECS/Fargate behind an HTTPS load balancer, PostgreSQL on RDS (or Supabase PostgreSQL), S3 and a CloudFront asset domain. Authentication uses the configured Supabase project. Transactional notifications use Resend through its HTTPS API.

No AWS resources are automatically provisioned by this repository. Docker/cloud deployment could not be exercised without the client's infrastructure configuration.

`npm run build` generates Prisma before building Next.js. The container is built on Linux rather than copying Windows node_modules; this matters for Sharp native binaries. Runtime runs as the non-root node user and exposes port 3000. For local container viewing, map host 3002 to container 3000.

Pass NEXT_PUBLIC variables at build time: Supabase URL/publishable key, Turnstile site key, WhatsApp number and optional social URLs. These values are intentionally public. Server secrets (database URL, S3 credentials, Resend key, rate-limit salt and Turnstile secret) belong in the runtime secret store, never build arguments or browser bundles. APP_ORIGIN must be the exact HTTPS production origin. Use one origin consistently.

Apply `npm run db:migrate` as a controlled release step using the migration/database owner, not from every web instance. Seed homepage defaults once. Configure the trusted runtime database role with access only to the app's tables; browser roles have no grants or RLS policies. Verify those restrictions with the actual PostgreSQL instance before exposing the site.

## S3-compatible object storage

Server variables:

- S3_REGION; S3_ENDPOINT when not using the standard AWS endpoint.
- S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY, or an AWS task/web-identity role.
- S3_PRIVATE_BUCKET for pending seller photographs.
- S3_PUBLIC_BUCKET for approved inventory photographs.
- PUBLIC_ASSET_BASE_URL for stable product delivery URLs.
- S3_FORCE_PATH_STYLE=true where required by MinIO or the provider.

The private bucket must block anonymous access. Use least-privilege server credentials for GetObject, PutObject and DeleteObject in the app's buckets. Product delivery can use CloudFront Origin Access Control while the S3 product bucket also remains private. With R2, use a separate product bucket/custom domain and never expose the private submissions bucket through a public domain. Supabase Storage's S3-compatible endpoint can also be configured; use its S3 access credentials and the appropriate public bucket delivery base URL, not the browser publishable key.

Uploads travel through the bounded Next.js endpoint for progress and validation. The server verifies signatures, decodes the image, caps input pixels, rotates orientation, strips metadata and re-encodes WebP before storage. Client filenames never become object keys. Admins receive private signed GET links valid for 15 minutes. Approval copies only selected photos into the product bucket. Database transactions reject concurrent or repeated review; failed approval copies are removed.

Test upload, signed preview, approval, publication, rejection and archive with the actual bucket policy/CDN before launch. Configure backup and retention for the database and private bucket deliberately.

## Auth, rate limiting and bots

Create administrators through Supabase Auth and grant their identity a database role through the trusted CLI. Disable public sign-ups. Auth.getUser validates identity before the app looks up AdminUser. All protected actions repeat role checks on the server. Session cookies are HttpOnly, SameSite and Secure in production. Mutating endpoints validate Origin.

Rate-limit records persist in PostgreSQL and store salted hashes, not raw IP addresses. The default uses the **last** x-forwarded-for entry, suitable for one trusted proxy that appends the real connection IP. Restrict the Node origin to the trusted load balancer; do not allow users to connect directly or trust arbitrary incoming forwarding chains. If adding more proxies, intentionally adapt the trusted-IP extraction strategy for that topology.

Configure Turnstile for the production hostname. Server verification checks token, action and hostname. Missing production bot configuration prevents public submissions/enquiries. Rate limits and CAPTCHA complement the deployment's request/body/time limits.

## Transactional email

Set RESEND_API_KEY, a verified EMAIL_FROM and one or more ADMIN_EMAIL addresses. Schedule mail:flush regularly; it claims due jobs and retries failed delivery. Monitor failed/exhausted jobs. Resend idempotency windows are finite, so provider/network failure can still require operational review; this system does not promise exactly-once delivery indefinitely.

Do not infer successful delivery from a saved submission or a queued notification. Outbox failures do not delete or lose valid submissions.

## Cloudflare compatibility

Cloudflare may provide DNS/CDN/WAF in front of the Node deployment. A Workers deployment is **not** a drop-in substitute for this Node build: native Sharp processing, database driver/pooling and the installed Next version require compatibility review. Evaluate the current OpenNext Cloudflare support matrix, Node compatibility flags, an image-processing service and a compatible database connection strategy before choosing an adapter. No Cloudflare Worker artifact is included or tested.

References: [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [OpenNext Cloudflare](https://opennext.js.org/cloudflare), [AWS S3 SDK v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Resend API](https://resend.com/docs/api-reference/emails/send-email).
