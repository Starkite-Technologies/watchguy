import { cp, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root, false);
const standalone = path.join(root, ".next", "standalone");
await access(path.join(standalone, "server.js"));
// Next's standalone output deliberately omits static assets. Stage local copies.
await cp(path.join(root, "public"), path.join(standalone, "public"), {
  recursive: true,
});
await cp(
  path.join(root, ".next", "static"),
  path.join(standalone, ".next", "static"),
  {
    recursive: true,
  },
);
process.env.PORT ||= "3002";
process.env.HOSTNAME = process.env.APP_BIND_HOST || "127.0.0.1";
await import(pathToFileURL(path.join(standalone, "server.js")).href);
