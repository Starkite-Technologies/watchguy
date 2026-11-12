import { z } from "zod";
const text = (max: number) =>
  z.string().trim().min(1, "Please complete this field.").max(max);
const money = z
  .union([z.string(), z.number()])
  .transform(String)
  .refine(
    (s) => /^\d{1,8}(\.\d{1,2})?$/.test(s) && Number(s) > 0,
    "Enter a positive NAD amount, with up to two decimal places.",
  );
const year = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v === null ? null : Number(v)),
  z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .nullable(),
);
export const submissionSchema = z.object({
  name: text(120),
  email: z.email().max(200),
  phone: text(40),
  preferredContactMethod: z.enum(["Email", "Phone", "WhatsApp"]),
  brand: text(80),
  model: text(120),
  reference: z.string().trim().max(120).optional(),
  year,
  condition: z.enum(["Unworn", "Excellent", "Very good", "Good", "Fair"]),
  price: money,
  description: text(3000),
  defects: z.string().trim().max(1500).default(""),
  box: z.boolean(),
  papers: z.boolean(),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
  botToken: z.string().optional(),
});
export const enquirySchema = z.object({
  name: text(120),
  email: z.email().max(200),
  phone: z.string().max(40).optional(),
  message: text(2000),
  watchId: z.uuid().optional(),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
  botToken: z.string().optional(),
});
export const watchSchema = z.object({
  brand: text(80),
  model: text(120),
  reference: z.string().max(120).nullable(),
  price: money,
  currency: z.literal("NAD").default("NAD"),
  condition: z.enum(["Unworn", "Excellent", "Very good", "Good", "Fair"]),
  year,
  diameter: z.string().max(60).nullable(),
  movement: z.string().max(100).nullable(),
  description: text(4000),
  defects: z.string().max(1500).default(""),
  images: z.array(z.url()).min(1).max(8),
  availability: z.enum(["AVAILABLE", "RESERVED", "SOLD", "ARCHIVED"]),
  sellerType: z.enum(["STORE", "THIRD_PARTY"]),
  featured: z.boolean(),
  published: z.boolean(),
  box: z.boolean(),
  papers: z.boolean(),
});
export const approvalSchema = z
  .object({
    action: z.enum(["APPROVE", "REJECT", "REQUEST_INFO"]),
    confirmPublication: z.boolean().optional(),
    note: z.string().max(2000).default(""),
    selectedImages: z.array(z.number().int().nonnegative()).max(6).default([]),
    listing: z
      .object({
        brand: text(80),
        model: text(120),
        reference: z.string().max(120).nullable(),
        year,
        condition: z.enum(["Unworn", "Excellent", "Very good", "Good", "Fair"]),
        price: money,
        description: text(4000),
        defects: z.string().max(1500).default(""),
        box: z.boolean(),
        papers: z.boolean(),
        diameter: z.string().max(60).nullable(),
        movement: z.string().max(100).nullable(),
      })
      .optional(),
  })
  .superRefine((v, c) => {
    if (
      v.action === "APPROVE" &&
      (!v.confirmPublication || !v.listing || !v.selectedImages.length)
    )
      c.addIssue({
        code: "custom",
        message:
          "Confirm the public listing and select photos before approval.",
      });
    if (v.action === "REQUEST_INFO" && !v.note.trim())
      c.addIssue({
        code: "custom",
        message: "Write a message explaining what information is needed.",
      });
  });
export const contentSchema = z.object({
  heroTitle: text(120),
  heroSubtitle: text(300),
  aboutTitle: text(150),
  aboutText: text(2000),
  contactEmail: z.union([z.email(), z.literal("")]),
  contactPhone: z.string().max(40),
  location: z.string().max(150),
});
export function validImage(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg")
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
  return (
    type === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}
