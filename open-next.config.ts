import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page is force-dynamic and reads the database, so no incremental cache
// (R2/KV) is needed.
export default defineCloudflareConfig();
