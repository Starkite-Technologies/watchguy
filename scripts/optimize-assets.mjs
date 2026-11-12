import sharp from "sharp";
import { mkdir } from "node:fs/promises";
let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const inputs = JSON.parse(raw);
await mkdir("public/images", { recursive: true });
for (const [name, path] of Object.entries(inputs)) {
  await sharp(path)
    .resize({ width: name === "hero" ? 1920 : 900, withoutEnlargement: true })
    .webp({ quality: name === "hero" ? 90 : 87 })
    .toFile("public/images/" + name + ".webp");
  console.log(name + " optimized");
}
