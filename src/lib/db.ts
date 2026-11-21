import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const fallbackUrl = "postgresql://postgres:preview@127.0.0.1:5432/preview";
const makeClient = (connectionString: string, max: number, maxUses?: number) =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString, max, maxUses }),
  });

type WorkerEnv = { HYPERDRIVE?: { connectionString: string } };

/**
 * On Cloudflare Workers, database sockets belong to the request that opened them,
 * so each request gets its own client, connected through Hyperdrive (which does
 * the pooling). Elsewhere (Node server, scripts) one pooled client is shared.
 */
function workerClient(): PrismaClient | undefined {
  let context;
  try {
    context = getCloudflareContext();
  } catch {
    return undefined;
  }
  const env = context.env as WorkerEnv;
  const url = env.HYPERDRIVE?.connectionString || process.env.DATABASE_URL;
  if (!url) return undefined;
  const perRequest = requestClients.get(context.ctx);
  if (perRequest) return perRequest;
  // maxUses: 1 so a socket is never reused by a later request.
  const client = makeClient(url, 1, 1);
  requestClients.set(context.ctx, client);
  return client;
}
const requestClients = new WeakMap<object, PrismaClient>();

const globalDb = globalThis as unknown as { prisma?: PrismaClient };
function nodeClient() {
  return (globalDb.prisma ??= makeClient(
    process.env.DATABASE_URL || fallbackUrl,
    5,
  ));
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = workerClient() ?? nodeClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

const workerHasDatabase = () => {
  try {
    return !!(getCloudflareContext().env as WorkerEnv).HYPERDRIVE;
  } catch {
    return false;
  }
};
export const databaseConfigured = () =>
  !!process.env.DATABASE_URL || workerHasDatabase();
export const authConfigured = () =>
  !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
export const storageConfigured = () =>
  !!(
    process.env.S3_PRIVATE_BUCKET &&
    process.env.S3_PUBLIC_BUCKET &&
    process.env.PUBLIC_ASSET_BASE_URL &&
    (process.env.S3_ACCESS_KEY_ID ||
      process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
      process.env.AWS_WEB_IDENTITY_TOKEN_FILE)
  );
export const backendConfigured = () =>
  databaseConfigured() && authConfigured() && storageConfigured();
