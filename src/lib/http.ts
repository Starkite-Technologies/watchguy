import { HttpError } from "./errors";
export async function limitedForm(req: Request, max = 27 * 1024 * 1024) {
  if (Number(req.headers.get("content-length") || 0) > max)
    throw new HttpError(413, "The upload exceeds the size limit.");
  if (!req.body) throw new HttpError(400, "A form is required.");
  const reader = req.body.getReader();
  let size = 0;
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new HttpError(413, "The upload exceeds the size limit.");
      }
      chunks.push(new Uint8Array(value));
    }
  } finally {
    reader.releaseLock();
  }
  return new Response(new Blob(chunks), {
    headers: { "Content-Type": req.headers.get("content-type") || "" },
  }).formData();
}
export async function limitedJson(req: Request, max = 30000) {
  if (Number(req.headers.get("content-length") || 0) > max)
    throw new HttpError(413, "The request is too large.");
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "A request body is required.");
  let size = 0,
    text = "";
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, "The request is too large.");
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid request data.");
  }
}
