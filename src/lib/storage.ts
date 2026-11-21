import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpError } from "./errors";
import { validImage } from "./validation";
import { reencodeAsWebp } from "./image-processing";
export const privateBucket = () => process.env.S3_PRIVATE_BUCKET!;
export const publicBucket = () => process.env.S3_PUBLIC_BUCKET!;
let client: S3Client | undefined;
export function s3() {
  return (client ??= new S3Client({
    region: process.env.S3_REGION || "af-south-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: process.env.S3_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        }
      : undefined,
  }));
}
export const publicImage = (key: string) =>
  process.env.PUBLIC_ASSET_BASE_URL!.replace(/\/$/, "") +
  "/" +
  key.split("/").map(encodeURIComponent).join("/");
export const validPublicImage = (url: string) =>
  !!process.env.PUBLIC_ASSET_BASE_URL &&
  url.startsWith(process.env.PUBLIC_ASSET_BASE_URL.replace(/\/$/, "") + "/");
export async function removeObjects(bucket: string, keys: string[]) {
  if (keys.length)
    await s3().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
}
export async function uploadFiles(
  files: File[],
  bucket: string,
  prefix: string,
) {
  if (files.length < 1 || files.length > 8)
    throw new HttpError(400, "Choose 1–8 photographs.");
  const keys: string[] = [];
  try {
    for (const file of files) {
      if (!file.size || file.size > 4 * 1024 * 1024)
        throw new HttpError(400, "Each photograph must be under 4 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!validImage(bytes, file.type))
        throw new HttpError(400, "Use valid JPG, PNG or WebP photographs.");
      const output = await reencodeAsWebp(bytes);
      const key = prefix + "/" + crypto.randomUUID() + ".webp";
      await s3().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: output,
          ContentType: "image/webp",
          CacheControl:
            bucket === privateBucket()
              ? "private, no-store"
              : "public, max-age=31536000, immutable",
        }),
      );
      keys.push(key);
    }
    return keys;
  } catch (error) {
    await removeObjects(bucket, keys).catch(() => {});
    throw error;
  }
}
export async function signedPhoto(key: string) {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: privateBucket(),
      Key: key,
      ResponseContentType: "image/webp",
      ResponseCacheControl: "private, no-store",
    }),
    { expiresIn: 900 },
  );
}
export async function publishPhoto(key: string) {
  const source = await s3().send(
    new GetObjectCommand({ Bucket: privateBucket(), Key: key }),
  );
  if (!source.Body)
    throw new HttpError(502, "A submitted photograph is unavailable.");
  const bytes = await source.Body.transformToByteArray();
  const target = "approved/" + crypto.randomUUID() + ".webp";
  await s3().send(
    new PutObjectCommand({
      Bucket: publicBucket(),
      Key: target,
      Body: bytes,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return target;
}
