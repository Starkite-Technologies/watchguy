/**
 * Resolve the visitor IP used for rate limiting.
 *
 * TRUSTED_CLIENT_IP_HEADER names a header set by the outermost trusted proxy
 * (for example `cf-connecting-ip` when Cloudflare proxies the domain). Only set
 * it when the origin accepts traffic exclusively from that proxy; otherwise a
 * visitor could forge the header. Without it, the last X-Forwarded-For entry is
 * used, which is correct for exactly one trusted proxy (Caddy or a load
 * balancer) that appends the connecting address.
 */
export function clientIp(req: Request) {
  const trusted = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  if (trusted) {
    const value = req.headers.get(trusted)?.split(",")[0]?.trim();
    if (value) return value;
  }
  return (
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "local"
  );
}
