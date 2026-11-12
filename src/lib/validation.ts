import { z } from "zod";

/**
 * Supported Luxury Conditions
 */
export const validConditions = [
  "Unworn / New",
  "Mint (Like New)",
  "Excellent",
  "Very Good",
  "Good",
] as const;

/**
 * Validate image buffer signatures (magic bytes)
 * Supports JPEG, PNG, and WebP
 */
export function validImage(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) return false;

  // JPEG: FF D8 FF
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mime === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  // WebP: RIFF ... WEBP
  if (mime === "image/webp") {
    const isRiff =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46;
    const isWebp =
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

/**
 * Public Multi-Step Seller Watch Submission Schema
 */
export const submissionSchema = z.object({
  // Step 1: Seller info
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full legal name.")
    .max(100, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Please provide a valid contact number with country code.")
    .max(30),
  preferredContactMethod: z.enum(["WHATSAPP", "EMAIL", "PHONE"]).default("WHATSAPP"),

  // Step 2: Watch info
  brand: z
    .string()
    .trim()
    .min(2, "Watch brand is required.")
    .max(60),
  model: z
    .string()
    .trim()
    .min(2, "Watch model is required.")
    .max(80),
  referenceNumber: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => val || null),
  year: z
    .coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable()
    .transform((val) => (val && val > 0 ? val : null)),
  condition: z.enum(validConditions, {
    message: "Please select a standard luxury condition grade.",
  }),
  requestedPrice: z
    .coerce
    .number()
    .positive("Please provide a realistic asking price in NAD.")
    .max(100000000, "Price exceeds allowable threshold."),
  currency: z.string().default("NAD"),
  description: z
    .string()
    .trim()
    .min(15, "Please provide a brief description (at least 15 characters).")
    .max(2000),
  defects: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .transform((val) => val || null),
  box: z.boolean().default(false),
  papers: z.boolean().default(false),
  proof: z.boolean().default(false),

  // Step 4: Legal & Consent
  consent: z.literal(true, {
    message: "You must confirm you have the legal right to sell and accept submission terms.",
  }),

  // Spam protection / honeypot
  website: z.string().max(0, "Bot detected.").optional(),
});

/**
 * Public Customer Enquiry Schema
 */
export const enquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100),
  customerEmail: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(120),
  customerPhone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform((val) => val || null),
  message: z
    .string()
    .trim()
    .min(10, "Please provide a message with at least 10 characters.")
    .max(2000),
  watchId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .transform((val) => val || null),
  consent: z.literal(true, {
    message: "Please confirm your consent for our team to contact you.",
  }),
  website: z.string().max(0, "Bot detected.").optional(),
});

/**
 * Admin Login Schema
 */
export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please provide a valid admin email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

/**
 * Admin Watch Management Schema (Create / Edit)
 */
export const watchManagementSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required."),
  model: z.string().trim().min(1, "Model is required."),
  referenceNumber: z.string().trim().max(50).optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2030).optional().nullable(),
  condition: z.string().trim().min(1, "Condition is required."),
  description: z.string().trim().min(5, "Description is required."),
  price: z.coerce.number().positive("Price in NAD must be positive."),
  currency: z.string().default("NAD"),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
  ownershipType: z.enum(["COMPANY", "THIRD_PARTY"]).default("COMPANY"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  diameter: z.string().trim().max(30).optional().nullable(),
  movement: z.string().trim().max(60).optional().nullable(),
  box: z.boolean().default(false),
  papers: z.boolean().default(false),
  images: z.array(z.string()).default([]),
});

/**
 * Admin Submission Review Schema
 */
export const submissionReviewSchema = z.object({
  submissionId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT", "INFO_REQUESTED"]),
  reviewNotes: z.string().trim().max(2000).optional().nullable(),
  // For approval
  approvedPrice: z.coerce.number().positive().optional().nullable(),
  approvedPhotos: z.array(z.string()).optional(),
  publicModel: z.string().trim().optional(),
  publicBrand: z.string().trim().optional(),
});
