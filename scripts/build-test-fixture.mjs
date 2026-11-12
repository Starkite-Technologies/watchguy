import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const result = await build({
  entryPoints: ["tests/fixtures/studio-entry.tsx"],
  absWorkingDir: process.cwd(),
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  tsconfig: "tsconfig.json",
  define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "isolated-next-ui",
      setup(b) {
        b.onResolve({ filter: /^next\/(link|navigation)$/ }, (args) => ({
          path: args.path,
          namespace: "ui-fixture",
        }));
        b.onLoad({ filter: /.*/, namespace: "ui-fixture" }, (args) => ({
          contents: args.path.endsWith("navigation")
            ? 'export function useRouter(){return {push:()=>{},refresh:()=>{}}} export function usePathname(){return "/admin"}'
            : 'import React from "react";export default function Link({children,...props}){return React.createElement("a",props,children)}',
          resolveDir: resolve("."),
        }));
      },
    },
  ],
});
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/studio-fixture.js", result.outputFiles[0].text);
console.log(
  "Built isolated administration UI fixture; no auth bypass route was added.",
);
