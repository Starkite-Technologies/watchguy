import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import type { Watch } from "../../src/lib/types";
const sample = JSON.parse(
  readFileSync("prisma/demo-watches.json", "utf8"),
) as Watch[];
test("premium homepage uses local imagery and direct collection navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero h1")).toContainText("TIME IS");
  await page.screenshot({ path: "artifacts/home-desktop.png" });
  await expect(page.locator(".featured-grid .watch-card")).toHaveCount(3);
  await page
    .locator(".hero")
    .getByRole("link", { name: "Explore collection" })
    .click();
  await expect(page.locator(".page-heading h1")).toContainText("Find the one");
  await expect(page.locator(".watch-card")).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "Admin access", exact: true }),
  ).toHaveCount(0);
});
test("server catalogue combines search, brand, condition, availability and NAD price filters", async ({
  page,
  request,
}) => {
  await page.goto("/collection");
  await page.getByRole("button", { name: "Northline", exact: true }).click();
  await expect(page.locator(".watch-card")).toHaveCount(1);
  await page.getByLabel("Filter by availability").selectOption("AVAILABLE");
  await expect(page.getByText("No timepieces found.")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".watch-card")).toHaveCount(4);
  await page.getByLabel("Maximum price").fill("50000");
  await expect(page.locator(".watch-card")).toHaveCount(1);
  await expect(page.locator(".watch-card")).toContainText(
    "Classic Small Seconds",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Sort watches").selectOption("price-high");
  await expect(page.locator(".watch-card").first()).toContainText(
    "Midnight Chronograph",
  );
  const response = await request.get("/api/watches?availability=SOLD");
  expect(response.status()).toBe(400);
  const rows = await (await request.get("/api/watches?maxPrice=50000")).json();
  expect(rows.total).toBe(1);
  expect(rows.watches[0]).not.toHaveProperty("sellerId");
});
test("watch details prepare the right enquiry and support keyboard dismissal", async ({
  page,
}) => {
  await page.goto("/watches/atelier-panda-chronograph-demo");
  await expect(page.locator(".detail-copy h1")).toHaveText("Panda Chronograph");
  await expect(page.locator(".detail-price")).toContainText("N$");
  await page.getByRole("button", { name: "Contact about this watch" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("textarea[name=message]")).toHaveValue(
    /Panda Chronograph/,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("seller wizard validates photos and never falsely reports a disconnected submission", async ({
  page,
}) => {
  await page.goto("/sell");
  await page.getByLabel("Full name").fill("Example Seller");
  await page.getByLabel("Email address").fill("seller@example.com");
  await page.getByLabel("Phone number").fill("0812345678");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Watch brand").fill("Atelier");
  await page.getByLabel("Model", { exact: true }).fill("Chronograph");
  await page.getByLabel("Watch condition").selectOption("Excellent");
  await page.getByLabel("Asking price (N$)").fill("65000.50");
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "A clear and accurate sample description for this development submission.",
    );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".sell-form .form-error")).toContainText(
    "at least three",
  );
  const buffer = readFileSync("public/images/dress.webp");
  await page
    .getByLabel("Upload watch photographs")
    .setInputFiles(
      Array.from({ length: 3 }, (_, i) => ({
        name: "sample-" + i + ".webp",
        mimeType: "image/webp",
        buffer,
      })),
    );
  await expect(page.locator(".photo-preview-grid img")).toHaveCount(3);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".review-summary")).toContainText("65");
  await page
    .getByRole("checkbox", { name: /I have the right to sell/ })
    .check();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.locator(".sell-form .form-error")).toContainText(
    "not connected",
  );
  await expect(
    page.getByText("PRIVATELY RECEIVED", { exact: true }),
  ).toHaveCount(0);
});
test("administration remains protected in demo mode and mutations enforce origin", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeDisabled();
  const response = await request.get("/api/admin");
  expect([401, 503]).toContain(response.status());
  expect(await response.json()).not.toHaveProperty("submissions");
  for (const method of ["post", "patch", "delete"] as const) {
    const forbidden = await request[method]("/api/admin/watches", {
      headers: { Origin: "https://untrusted.example" },
      data: {},
    });
    expect(forbidden.status()).toBe(403);
  }
  await page.screenshot({ path: "artifacts/admin-login.png", fullPage: true });
});
test("contact enquiries explain the disconnected state without claiming delivery", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Example Buyer");
  await page.getByLabel("Email address").fill("buyer@example.com");
  await page
    .getByLabel("Your message")
    .fill("Please let me know more about your collection.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator(".enquiry-form .form-error")).toContainText(
    "not connected",
  );
  await expect(page.getByText("A conversation has begun.")).toHaveCount(0);
});
test("mobile navigation, collection, seller form and galleries fit the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".hero h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/home-mobile.png" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "The collection" })
    .click();
  await expect(page.locator(".watch-card")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/collection-mobile.png",
    fullPage: true,
  });
  await page.goto("/sell");
  await expect(page.getByLabel("Full name")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("reduced motion leaves shopping and static imagery immediately usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero h1")).toBeVisible();
  await expect(page.locator(".hero-image img")).toBeVisible();
  await expect(
    page.locator(".hero").getByRole("link", { name: "Explore collection" }),
  ).toBeVisible();
});
test("isolated admin UI confirms price and images before approval and supports archiving", async ({
  page,
}) => {
  const fixture = {
    admin: { name: "Example administrator", role: "OWNER" },
    watches: [{ ...sample[0], id: "00000000-0000-4000-8000-000000000001" }],
    submissions: [
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Example seller",
        email: "seller@example.com",
        phone: "Example phone",
        preferredContactMethod: "Email",
        brand: "Atelier",
        model: "Chronograph Submission",
        reference: null,
        year: 2023,
        condition: "Excellent",
        price: 64000,
        currency: "NAD",
        description: "A private sample description for UI verification.",
        defects: "Minor marks",
        images: ["/images/dress.webp", "/images/diver.webp"],
        box: true,
        papers: false,
        status: "PENDING_REVIEW",
        createdAt: "2026-11-12T08:00:00Z",
        reviewedAt: null,
        reviewNote: null,
      },
    ],
    enquiries: [],
    content: {
      heroTitle: "TIME IS EVERYTHING.",
      heroSubtitle: "Exceptional watches. Timeless stories.",
      aboutTitle: "MORE THAN A WATCH. A LEGACY.",
      aboutText: "A sample story.",
      contactEmail: "hello@example.com",
      contactPhone: "Example phone",
      location: "Namibia",
    },
    activity: [],
    email: { configured: false, queued: 1 },
  };
  let approval: any;
  await page.route("**/api/admin**", async (route) => {
    const req = route.request();
    if (req.method() === "POST" && req.url().includes("/submissions/")) {
      approval = req.postDataJSON();
      fixture.submissions[0].status = "APPROVED";
    }
    if (req.method() === "DELETE") fixture.watches[0].availability = "ARCHIVED";
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        req.method() === "GET"
          ? fixture
          : { success: true, emailConfigured: false },
      ),
    });
  });
  const css = readdirSync(".next/static/css")
    .filter((f) => f.endsWith(".css"))
    .map(
      (name) => '<link rel="stylesheet" href="/_next/static/css/' + name + '">',
    )
    .join("");
  const js = readFileSync("artifacts/studio-fixture.js", "utf8").replaceAll(
    "</script",
    "<\\/script",
  );
  await page.route("**/__ui-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body:
        "<!doctype html><html><head>" +
        css +
        '</head><body><div id="root"></div><script>' +
        js +
        "</script></body></html>",
    }),
  );
  await page.goto("/__ui-fixture");
  await expect(page.getByText("Welcome to your watch house.")).toBeVisible();
  await page.screenshot({
    path: "artifacts/admin-overview.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Pending submissions" }).click();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve & publish" }),
  ).toBeDisabled();
  await page.getByLabel("Public selling price (N$)").fill("70500.50");
  await page.getByRole("checkbox", { name: "Publish photograph 2" }).uncheck();
  await page
    .getByRole("checkbox", { name: /I confirm the public price/ })
    .check();
  await page.getByRole("button", { name: "Approve & publish" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(approval.listing.price).toBe(70500.5);
  expect(approval.selectedImages).toEqual([0]);
  expect(approval.confirmPublication).toBe(true);
  expect(approval.listing).not.toHaveProperty("email");
  await page.getByRole("button", { name: "Watch inventory" }).click();
  await page
    .getByRole("button", { name: "Archive " + sample[0].model })
    .click();
  await page
    .getByRole("button", { name: "Archive listing", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".admin-table")).toContainText("archived");
});
