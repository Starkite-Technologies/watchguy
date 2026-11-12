import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { uploadFiles, s3 } from "../src/lib/storage";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { HttpError } from "../src/lib/errors";
test("valid uploads are re-encoded as WebP with metadata removed", async (t) => {
  const calls: unknown[] = [];
  t.mock.method(s3(), "send", async (command: unknown) => {
    calls.push(command);
    return {};
  });
  const png = await sharp({
    create: { width: 8, height: 8, channels: 3, background: "#ddd" },
  })
    .png()
    .toBuffer();
  const keys = await uploadFiles(
    [new File([new Uint8Array(png)], "photo.png", { type: "image/png" })],
    "private-test",
    "submissions",
  );
  assert.equal(keys.length, 1);
  const command = calls[0] as PutObjectCommand;
  assert.ok(command instanceof PutObjectCommand);
  assert.equal(command.input.ContentType, "image/webp");
  const metadata = await sharp(command.input.Body as Buffer).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.width, 8);
});
test("a later invalid photograph removes earlier objects in the same failed upload", async (t) => {
  const calls: unknown[] = [];
  t.mock.method(s3(), "send", async (command: unknown) => {
    calls.push(command);
    return {};
  });
  const png = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await assert.rejects(
    uploadFiles(
      [
        new File([new Uint8Array(png)], "valid.png", { type: "image/png" }),
        new File(["<svg/>"], "bad.svg", { type: "image/svg+xml" }),
      ],
      "private-test",
      "submissions",
    ),
    (e: unknown) => e instanceof HttpError && e.status === 400,
  );
  assert.ok(calls.some((c) => c instanceof DeleteObjectsCommand));
});
