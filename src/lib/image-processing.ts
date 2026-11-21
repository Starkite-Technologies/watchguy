import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HttpError } from "./errors";

/** Longest side of a stored photograph, in pixels. */
export const MAX_DIMENSION = 2200;
const QUALITY = 86;

type ImagesBinding = {
  input(stream: ReadableStream<Uint8Array>): {
    transform(options: Record<string, unknown>): {
      output(options: {
        format: string;
        quality?: number;
        anim?: boolean;
      }): Promise<{
        response(): Response;
      }>;
    };
  };
};

function imagesBinding(): ImagesBinding | undefined {
  try {
    return (getCloudflareContext().env as { IMAGES?: ImagesBinding }).IMAGES;
  } catch {
    return undefined; // Not running on Cloudflare Workers.
  }
}

const undecodable = () =>
  new HttpError(
    400,
    "This photograph could not be decoded. Try a smaller, standard image.",
  );

/**
 * Decode a validated upload, apply EXIF orientation, cap it at MAX_DIMENSION and
 * re-encode it as still WebP. Re-encoding discards EXIF/GPS and other metadata.
 *
 * On Cloudflare Workers this uses the Images binding (native sharp cannot run
 * there). On a Node server it uses sharp.
 */
export async function reencodeAsWebp(bytes: Uint8Array): Promise<Uint8Array> {
  const images = imagesBinding();
  if (images) {
    try {
      const stream = new Blob([bytes as BlobPart]).stream();
      const result = await images
        .input(stream)
        .transform({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "scale-down",
          metadata: "none",
        })
        .output({ format: "image/webp", quality: QUALITY, anim: false });
      const response = result.response();
      if (!response.ok) throw new Error("Images returned " + response.status);
      return new Uint8Array(await response.arrayBuffer());
    } catch {
      throw undecodable();
    }
  }
  const { default: sharp } = await import("sharp");
  try {
    return await sharp(bytes, { limitInputPixels: 20000000, animated: false })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();
  } catch {
    throw undecodable();
  }
}
