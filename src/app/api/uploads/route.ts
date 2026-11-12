import { apiError, checkOrigin, HttpError, requireAdmin } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/services";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    await requireAdmin(["OWNER", "EDITOR"]);

    const formData = await req.formData();
    const files = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      throw new HttpError(400, "No valid photograph files provided.");
    }

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await saveUploadedFile(file, "watches");
      uploadedUrls.push(url);
    }

    return Response.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error) {
    return apiError(error);
  }
}
