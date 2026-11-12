import test from "node:test";
import assert from "node:assert/strict";
import { formatNAD, BRAND } from "../src/config/brand";
import {
  submissionSchema,
  enquirySchema,
  watchManagementSchema,
  validImage,
} from "../src/lib/validation";
import {
  hashPassword,
  verifyPassword,
  signPayload,
  verifySessionToken,
} from "../src/lib/crypto";

test("formatNAD properly formats integer minor cents into Namibian Dollars", () => {
  assert.equal(formatNAD(15000000), "N$ 150,000");
  assert.equal(formatNAD(52000000), "N$ 520,000");
  assert.equal(formatNAD(0), "N$ 0");
  assert.equal(formatNAD(null), "N$ 0");
});

test("seller submission requires legal consent, positive asking price, and honeypot purity", () => {
  const validSubmission = {
    fullName: "Hendrik Steenkamp",
    email: "hendrik@example.na",
    phone: "+264812345678",
    preferredContactMethod: "WHATSAPP" as const,
    brand: "Rolex",
    model: "Submariner Date",
    referenceNumber: "126610LN",
    year: 2022,
    condition: "Mint (Like New)" as const,
    requestedPrice: 220000,
    currency: "NAD",
    description: "Complete full set with warranty card and green presentation box.",
    box: true,
    papers: true,
    proof: true,
    consent: true as const,
    website: "",
  };

  const res = submissionSchema.safeParse(validSubmission);
  assert.ok(res.success);

  // Missing consent
  assert.equal(
    submissionSchema.safeParse({ ...validSubmission, consent: false }).success,
    false,
  );

  // Zero or negative price
  assert.equal(
    submissionSchema.safeParse({ ...validSubmission, requestedPrice: 0 }).success,
    false,
  );

  // Invalid email
  assert.equal(
    submissionSchema.safeParse({ ...validSubmission, email: "invalid-email" }).success,
    false,
  );

  // Bot honeypot filled
  assert.equal(
    submissionSchema.safeParse({ ...validSubmission, website: "http://bot.com" }).success,
    false,
  );
});

test("customer enquiry requires name, valid email, minimum message length, and consent", () => {
  const validEnquiry = {
    customerName: "Maria Shilongo",
    customerEmail: "maria@example.na",
    customerPhone: "+264819991122",
    message: "I would like to enquire about acquiring the Rolex Submariner.",
    consent: true as const,
    website: "",
  };

  assert.ok(enquirySchema.safeParse(validEnquiry).success);

  // Short message
  assert.equal(
    enquirySchema.safeParse({ ...validEnquiry, message: "Too short" }).success,
    false,
  );

  // Missing consent
  assert.equal(
    enquirySchema.safeParse({ ...validEnquiry, consent: false }).success,
    false,
  );
});

test("watch management schema validates catalog listings", () => {
  const validWatch = {
    brand: "Omega",
    model: "Speedmaster Professional",
    referenceNumber: "310.30.42.50.01.002",
    year: 2023,
    condition: "Unworn / New",
    description: "Master Chronometer Co-Axial 3861 with sapphire exhibition back.",
    price: 155000,
    currency: "NAD",
    status: "AVAILABLE" as const,
    ownershipType: "COMPANY" as const,
    featured: true,
    published: true,
    images: ["/watches/speedmaster.webp"],
  };

  assert.ok(watchManagementSchema.safeParse(validWatch).success);

  // Missing brand
  assert.equal(
    watchManagementSchema.safeParse({ ...validWatch, brand: "" }).success,
    false,
  );
});

test("PBKDF2 password hashing and verification works with unique cryptographic salts", async () => {
  const password = "AtelierMasterKey2026!";
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);

  // Different salts
  assert.notEqual(hash1, hash2);

  // Both verify successfully
  assert.ok(await verifyPassword(password, hash1));
  assert.ok(await verifyPassword(password, hash2));

  // Wrong password fails
  assert.equal(await verifyPassword("WrongPassword", hash1), false);
});

test("HMAC-SHA256 session tokens sign, verify, and reject tampering", async () => {
  const payload = JSON.stringify({
    userId: "test-admin-uuid",
    email: "admin@ateliertimepieces.com",
    role: "OWNER",
    exp: Date.now() + 60000,
  });

  const token = await signPayload(payload);
  assert.ok(token.includes("."));

  const verified = await verifySessionToken(token);
  assert.ok(verified);
  assert.equal(verified?.email, "admin@ateliertimepieces.com");
  assert.equal(verified?.role, "OWNER");

  // Tampered token fails
  const tamperedToken = token.slice(0, -4) + "abcd";
  assert.equal(await verifySessionToken(tamperedToken), null);
});

test("photo signature validation correctly identifies JPEG, PNG, WebP and rejects unsupported/malicious types", () => {
  // JPEG: FF D8 FF
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert.ok(validImage(jpegHeader, "image/jpeg"));
  assert.equal(validImage(jpegHeader, "image/png"), false);

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert.ok(validImage(pngHeader, "image/png"));

  // WebP: RIFF ... WEBP
  const webpHeader = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  assert.ok(validImage(webpHeader, "image/webp"));

  // Unsupported SVG / Script
  const svgBytes = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
  assert.equal(validImage(svgBytes, "image/svg+xml"), false);
  assert.equal(validImage(new Uint8Array([]), "image/jpeg"), false);
});
