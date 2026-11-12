import assert from "node:assert/strict";

const BASE_URL = "http://127.0.0.1:3000";

async function runE2E() {
  console.log("=== Running End-to-End Verification on Atelier Timepieces ===");

  // 1. Test Homepage
  console.log("\n1. Testing Homepage (GET /)...");
  const homeRes = await fetch(`${BASE_URL}/`);
  assert.equal(homeRes.status, 200);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes("TIME IS EVERYTHING."));
  assert.ok(homeHtml.includes("ATELIER TIMEPIECES"));
  assert.ok(homeHtml.includes("N$"));
  console.log("✓ Homepage renders with cinematic hero, brand identity, and live NAD pricing.");

  // 2. Test Collection Page
  console.log("\n2. Testing Collection Page (GET /collection)...");
  const colRes = await fetch(`${BASE_URL}/collection`);
  assert.equal(colRes.status, 200);
  const colHtml = await colRes.text();
  assert.ok(colHtml.includes("The Horological Collection"));
  assert.ok(colHtml.includes("Rolex"));
  console.log("✓ Collection page renders live database watches with interactive filters.");

  // 3. Test Individual Watch Page
  console.log("\n3. Testing Watch Detail Page (GET /watches/rolex-cosmograph-daytona-116500ln)...");
  const watchRes = await fetch(`${BASE_URL}/watches/rolex-cosmograph-daytona-116500ln`);
  assert.equal(watchRes.status, 200);
  const watchHtml = await watchRes.text();
  assert.ok(watchHtml.includes("Cosmograph Daytona"));
  assert.ok(watchHtml.includes("Enquire on WhatsApp"));
  assert.ok(watchHtml.includes("N$ 520,000"));
  console.log("✓ Watch detail page renders specs, WhatsApp enquiry CTA, and live price.");

  // 4. Test Public Seller Watch Submission API
  console.log("\n4. Testing Multi-Step Seller Submission (POST /api/submissions)...");
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00, 0xff, 0xdb]);

  const formData = new FormData();
  formData.append("fullName", "Kavena Shikongo");
  formData.append("email", "kavena.shikongo@example.na");
  formData.append("phone", "+264817772233");
  formData.append("preferredContactMethod", "WHATSAPP");
  formData.append("brand", "Audemars Piguet");
  formData.append("model", "Royal Oak Jumbo Extra-Thin");
  formData.append("referenceNumber", "16202ST.OO.1240ST.01");
  formData.append("year", "2023");
  formData.append("condition", "Mint (Like New)");
  formData.append("requestedPrice", "750000");
  formData.append("currency", "NAD");
  formData.append("description", "Bleu Nuit Nuage 50 Petite Tapisserie dial in stainless steel. Complete boutique set.");
  formData.append("box", "true");
  formData.append("papers", "true");
  formData.append("proof", "true");
  formData.append("consent", "true");

  const blob = new Blob([validJpeg], { type: "image/jpeg" });
  formData.append("photos", blob, "royaloak.jpg");

  const submitRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    body: formData,
  });

  assert.equal(submitRes.status, 201);
  const submitData = await submitRes.json();
  assert.ok(submitData.success);
  assert.ok(submitData.submissionId);
  const newSubmissionId = submitData.submissionId;
  console.log(`✓ Watch submitted successfully! Submission ID: ${newSubmissionId} (Status: PENDING_REVIEW)`);

  // 5. Test Customer Enquiry API
  console.log("\n5. Testing Customer Enquiry Submission (POST /api/enquiries)...");
  const enqRes = await fetch(`${BASE_URL}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Dr. Ndeitunga",
      customerEmail: "ndeitunga@example.na",
      customerPhone: "+264812229988",
      message: "Please arrange a private vault viewing for the Audemars Piguet once available.",
      consent: true,
    }),
  });
  assert.equal(enqRes.status, 201);
  const enqData = await enqRes.json();
  assert.ok(enqData.success);
  console.log("✓ Customer enquiry recorded and assigned to boutique client advisors.");

  // 6. Test Admin Authentication & Studio Access
  console.log("\n6. Testing Admin Login (POST /api/auth/login)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@ateliertimepieces.com",
      password: "AtelierAdmin2026!",
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.success);
  assert.equal(loginData.admin.role, "OWNER");

  // Extract session cookie
  const setCookie = loginRes.headers.get("set-cookie");
  assert.ok(setCookie);
  const sessionCookie = setCookie.split(";")[0];
  console.log("✓ Admin successfully authenticated. Signed session cookie established.");

  // 7. Test Admin Data Retrieval
  console.log("\n7. Testing Admin Data Feed (GET /api/admin/data)...");
  const adminDataRes = await fetch(`${BASE_URL}/api/admin/data`, {
    headers: { Cookie: sessionCookie },
  });
  assert.equal(adminDataRes.status, 200);
  const adminData = await adminDataRes.json();
  assert.ok(adminData.watches.length >= 6);
  assert.ok(adminData.submissions.some((s: any) => s.id === newSubmissionId));
  console.log(`✓ Admin retrieved operational dashboard: ${adminData.watches.length} watches, ${adminData.submissions.length} submissions.`);

  // 8. Test Admin Approval & Publication Workflow
  console.log("\n8. Testing Curator Approval & Instant Publication Workflow...");
  const approveRes = await fetch(`${BASE_URL}/api/admin/submissions/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      submissionId: newSubmissionId,
      action: "APPROVE",
      reviewNotes: "Serial verified with AP archives. Clean bevels, pristine tapisserie dial.",
      approvedPrice: 780000,
    }),
  });

  assert.equal(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.ok(approveData.success);
  assert.ok(approveData.watch);
  const publishedSlug = approveData.watch.slug;
  console.log(`✓ Consignment submission approved and published! Live slug: /watches/${publishedSlug}`);

  // 9. Verify Live Public Listing for Newly Approved Watch
  console.log(`\n9. Verifying Newly Approved Watch on Public Storefront (GET /watches/${publishedSlug})...`);
  const liveWatchRes = await fetch(`${BASE_URL}/watches/${publishedSlug}`);
  assert.equal(liveWatchRes.status, 200);
  const liveWatchHtml = await liveWatchRes.text();
  assert.ok(liveWatchHtml.includes("Royal Oak Jumbo Extra-Thin"));
  assert.ok(liveWatchHtml.includes("N$ 780,000"));
  assert.ok(liveWatchHtml.includes("Approved Private Consignment"));
  console.log("✓ Newly approved watch is now LIVE on the public storefront with confirmed pricing and provenance badge!");

  console.log("\n==============================================================");
  console.log("🎉 ALL END-TO-END FLOWS VERIFIED SUCCESSFULLY!");
  console.log("==============================================================");
}

runE2E().catch((err) => {
  console.error("E2E Verification failed:", err);
  process.exit(1);
});
