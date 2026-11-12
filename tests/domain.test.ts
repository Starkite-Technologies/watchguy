import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { filterWatches, money } from "../src/lib/demo";
import type { Watch } from "../src/lib/types";
import {
  submissionSchema,
  approvalSchema,
  validImage,
} from "../src/lib/validation";
import { limitedForm, limitedJson } from "../src/lib/http";
import { HttpError } from "../src/lib/errors";
const watches = JSON.parse(
  readFileSync("prisma/demo-watches.json", "utf8"),
) as Watch[];
test("public filters exclude sold, archived and unpublished records", () => {
  const list = [
    ...watches,
    { ...watches[0], id: "sold", availability: "SOLD" as const },
    { ...watches[0], id: "archived", availability: "ARCHIVED" as const },
    { ...watches[0], id: "draft", published: false },
  ];
  assert.equal(filterWatches(list).length, 4);
});
test("brand, condition, price and availability filters combine", () => {
  assert.equal(
    filterWatches(watches, {
      brand: "Northline",
      availability: "RESERVED",
      maxPrice: 70000,
    }).length,
    1,
  );
  assert.equal(
    filterWatches(watches, { brand: "Northline", availability: "AVAILABLE" })
      .length,
    0,
  );
  assert.equal(
    filterWatches(watches, {
      search: "PANDA",
      condition: "Excellent",
      minPrice: 80000,
    })[0].brand,
    "Atelier",
  );
});
test("sorting is stable and leaves the source unchanged", () => {
  const ids = watches.map((w) => w.id);
  assert.equal(filterWatches(watches, { sort: "price-low" })[0].price, 42500);
  assert.equal(filterWatches(watches, { sort: "price-high" })[0].price, 93500);
  assert.deepEqual(
    watches.map((w) => w.id),
    ids,
  );
});
test("NAD display preserves cents and the Namibian currency marker", () => {
  assert.ok(money(123.45).startsWith("N$ "));
  assert.ok(money(123.45).includes("123.45"));
});
const submission = {
  name: "Example Seller",
  email: "seller@example.com",
  phone: "0812345678",
  preferredContactMethod: "Email",
  brand: "Example",
  model: "Chronograph",
  reference: "",
  year: "",
  condition: "Excellent",
  price: "12345.67",
  description: "A development submission with clear watch details.",
  defects: "None known",
  box: true,
  papers: true,
  consent: true,
  website: "",
};
test("submission validation preserves decimal prices and accepts optional year/reference", () => {
  const parsed = submissionSchema.parse(submission);
  assert.equal(parsed.price, "12345.67");
  assert.equal(parsed.year, null);
  assert.equal(parsed.condition, "Excellent");
});
test("submissions require consent and reject spam, invalid prices and unsupported conditions", () => {
  for (const update of [
    { consent: false },
    { website: "spam.example" },
    { price: "0" },
    { price: "1.234" },
    { condition: "Unknown" },
  ])
    assert.equal(
      submissionSchema.safeParse({ ...submission, ...update }).success,
      false,
    );
});
test("approval requires selected photos, explicit publication confirmation and edited listing details", () => {
  assert.equal(
    approvalSchema.safeParse({ action: "APPROVE", selectedImages: [0] })
      .success,
    false,
  );
  const listing = {
    brand: "Example",
    model: "Chronograph",
    reference: null,
    year: null,
    condition: "Excellent",
    price: "24000.50",
    description: "The administrator-confirmed public description.",
    defects: "Some wear",
    box: true,
    papers: false,
    diameter: "40 mm",
    movement: "Automatic",
  };
  assert.ok(
    approvalSchema.safeParse({
      action: "APPROVE",
      confirmPublication: true,
      selectedImages: [0],
      listing,
    }).success,
  );
  assert.equal(
    approvalSchema.safeParse({
      action: "APPROVE",
      confirmPublication: false,
      selectedImages: [0],
      listing,
    }).success,
    false,
  );
});
test("information requests require a message and never require a public listing", () => {
  assert.equal(
    approvalSchema.safeParse({ action: "REQUEST_INFO", note: "" }).success,
    false,
  );
  assert.ok(
    approvalSchema.safeParse({
      action: "REQUEST_INFO",
      note: "Please provide a clear case-back photograph.",
    }).success,
  );
  assert.ok(approvalSchema.safeParse({ action: "REJECT" }).success);
});
test("image validation rejects SVG and mismatched file signatures", () => {
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(validImage(png, "image/png"));
  assert.equal(validImage(png, "image/jpeg"), false);
  assert.equal(
    validImage(new TextEncoder().encode("<svg/>"), "image/svg+xml"),
    false,
  );
});
test("JSON and multipart parsers reject oversized bodies before persistence", async () => {
  await assert.rejects(
    limitedJson(
      new Request("http://localhost/", {
        method: "POST",
        body: "x".repeat(50),
      }),
      20,
    ),
    (e: unknown) => e instanceof HttpError && e.status === 413,
  );
  const raw =
    "--boundary\r\nContent-Disposition: form-data; name=field\r\n\r\n" +
    "x".repeat(100) +
    "\r\n--boundary--";
  await assert.rejects(
    limitedForm(
      new Request("http://localhost/", {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data; boundary=boundary" },
        body: raw,
      }),
      40,
    ),
    (e: unknown) => e instanceof HttpError && e.status === 413,
  );
});
