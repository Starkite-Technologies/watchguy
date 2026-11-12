import { db as prisma } from "../src/lib/db";
import { hashPassword } from "../src/lib/crypto";

async function main() {
  console.log("Seeding Atelier Timepieces database...");

  // 1. Create or update Default Administrator
  const adminEmail = "admin@ateliertimepieces.com";
  const hashedPassword = await hashPassword("AtelierAdmin2026!");

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: "Managing Director",
      role: "OWNER",
    },
    create: {
      email: adminEmail,
      name: "Managing Director",
      password: hashedPassword,
      role: "OWNER",
    },
  });
  console.log(`✓ Admin user created: ${admin.email} (Role: ${admin.role})`);

  // 2. Default Site Content
  await prisma.siteContent.upsert({
    where: { id: "home" },
    update: {},
    create: {
      id: "home",
      content: JSON.stringify({
        heroTitle: "TIME IS EVERYTHING.",
        heroSubtitle: "Exceptional watches. Timeless stories.",
        storyHeadline: "MORE THAN A WATCH. A LEGACY.",
        storyBody:
          "In a world of fleeting seconds, a mechanical timepiece captures something enduring. Every hand-finished bevel, every escapement pulse, every vintage patina carries a chapter of human ambition.",
        sellHeadline: "YOUR WATCH. OUR SHOWCASE.",
        sellDescription:
          "Own a timepiece you would like to sell? Submit your watch for our horological team to review with utmost discretion.",
      }),
    },
  });

  // 3. Demo Watch Inventory
  const demoWatches = [
    {
      slug: "rolex-cosmograph-daytona-116500ln",
      brand: "Rolex",
      model: "Cosmograph Daytona",
      referenceNumber: "116500LN",
      year: 2021,
      condition: "Mint (Like New)",
      price: 52000000, // N$ 520,000
      description:
        "The definitive modern luxury chronograph. Featuring a high-contrast white dial, black monobloc Cerachrom ceramic bezel with tachymetric scale, and the revered in-house caliber 4130 automatic movement. Preserved in pristine collector condition.",
      diameter: "40mm",
      movement: "Automatic Calibre 4130",
      box: true,
      papers: true,
      ownershipType: "COMPANY",
      status: "AVAILABLE",
      featured: true,
      published: true,
      images: ["/watches/daytona.webp", "/sequence/frame-000.webp"],
    },
    {
      slug: "omega-speedmaster-professional-moonwatch",
      brand: "Omega",
      model: "Speedmaster Professional Moonwatch",
      referenceNumber: "310.30.42.50.01.002",
      year: 2023,
      condition: "Unworn / New",
      price: 15500000, // N$ 155,000
      description:
        "The legend that touched the lunar surface. Equipped with the Co-Axial Master Chronometer Calibre 3861, sapphire crystal with exhibition caseback, and iconic stepped dial with dot over ninety (DON) bezel.",
      diameter: "42mm",
      movement: "Manual Co-Axial 3861",
      box: true,
      papers: true,
      ownershipType: "COMPANY",
      status: "AVAILABLE",
      featured: true,
      published: true,
      images: ["/watches/speedmaster.webp", "/sequence/frame-015.webp"],
    },
    {
      slug: "tudor-black-bay-58-navy-blue",
      brand: "Tudor",
      model: "Black Bay 58",
      referenceNumber: "M79030B-0001",
      year: 2022,
      condition: "Excellent",
      price: 6800000, // N$ 68,000
      description:
        "A tribute to the brand's first divers' watches with historic proportions. Featuring the sought-after matte navy blue dial, snowflake hands, 39mm steel case, and manufacture Calibre MT5402 with 70-hour power reserve.",
      diameter: "39mm",
      movement: "Automatic MT5402 (COSC)",
      box: true,
      papers: true,
      ownershipType: "COMPANY",
      status: "AVAILABLE",
      featured: true,
      published: true,
      images: ["/watches/blackbay.webp", "/sequence/frame-030.webp"],
    },
    {
      slug: "iwc-portugieser-chronograph-classic",
      brand: "IWC Schaffhausen",
      model: "Portugieser Chronograph",
      referenceNumber: "IW371605",
      year: 2022,
      condition: "Mint (Like New)",
      price: 14500000, // N$ 145,000
      description:
        "An enduring icon of proportion and legibility. Clean silver-plated dial with applied blue numerals and slender feuille hands, powered by the IWC-manufactured 69355 calibre visible through the sapphire glass back.",
      diameter: "41mm",
      movement: "Automatic Calibre 69355",
      box: true,
      papers: true,
      ownershipType: "COMPANY",
      status: "AVAILABLE",
      featured: true,
      published: true,
      images: ["/watches/portugieser.webp", "/sequence/frame-045.webp"],
    },
    {
      slug: "atelier-chronograph-nocturne-edition",
      brand: "Atelier Curated",
      model: "Heritage Chronograph Nocturne",
      referenceNumber: "AT-2026-CH",
      year: 2024,
      condition: "Unworn / New",
      price: 18500000, // N$ 185,000
      description:
        "A bespoke boutique edition celebrating modern Namibian horology. Deep obsidian sunburst dial with champagne gold indices, flyback column-wheel movement, and hand-stitched alligator strap.",
      diameter: "40.5mm",
      movement: "Flyback Column-Wheel Automatic",
      box: true,
      papers: true,
      ownershipType: "COMPANY",
      status: "AVAILABLE",
      featured: true,
      published: true,
      images: ["/watches/nocturne.webp", "/sequence/frame-060.webp"],
    },
    {
      slug: "cartier-santos-de-cartier-large",
      brand: "Cartier",
      model: "Santos de Cartier",
      referenceNumber: "WSSA0018",
      year: 2023,
      condition: "Mint (Like New)",
      price: 13500000, // N$ 135,000
      description:
        "The world's first modern wristwatch, born from aviation pioneer Alberto Santos-Dumont's wish in 1904. Steel case with signature exposed screws, quick-switch strap system, and manufacture 1847 MC automatic caliber.",
      diameter: "39.8mm",
      movement: "Automatic 1847 MC",
      box: true,
      papers: true,
      ownershipType: "COMPANY",
      status: "AVAILABLE",
      featured: false,
      published: true,
      images: ["/watches/atelier.webp", "/sequence/frame-075.webp"],
    },
  ];

  for (const watchData of demoWatches) {
    const { images, ...data } = watchData;
    const watch = await prisma.watch.upsert({
      where: { slug: data.slug },
      update: { ...data },
      create: { ...data },
    });

    // Delete existing images and re-insert
    await prisma.watchImage.deleteMany({ where: { watchId: watch.id } });
    for (let i = 0; i < images.length; i++) {
      await prisma.watchImage.create({
        data: {
          watchId: watch.id,
          imageUrl: images[i],
          sortOrder: i,
        },
      });
    }
  }
  console.log(`✓ Seeded ${demoWatches.length} luxury watches with gallery images.`);

  // 4. Create a Demo Seller & Pending Submission for testing the Admin Workflow
  const demoSeller = await prisma.seller.create({
    data: {
      fullName: "Hendrik Van Der Merwe",
      email: "hendrik.vdm@example.na",
      phone: "+264819998877",
      preferredContactMethod: "WHATSAPP",
    },
  });

  const demoSubmission = await prisma.watchSubmission.create({
    data: {
      sellerId: demoSeller.id,
      brand: "Patek Philippe",
      model: "Calatrava Clous de Paris",
      referenceNumber: "5119G-001",
      year: 2018,
      condition: "Mint (Like New)",
      requestedPrice: 38000000, // N$ 380,000
      currency: "NAD",
      description:
        "White gold case with iconic guilloché hobnail bezel. White lacquered dial with Roman numerals. Stored in safe, worn less than 5 times. Complete with original certificate of origin and leather box.",
      defects: "None. Faint microscopic hairline on clasp.",
      box: true,
      papers: true,
      proof: true,
      status: "PENDING_REVIEW",
    },
  });

  await prisma.submissionImage.createMany({
    data: [
      {
        submissionId: demoSubmission.id,
        storageKey: "/watches/atelier.webp",
        sortOrder: 0,
      },
      {
        submissionId: demoSubmission.id,
        storageKey: "/sequence/frame-000.webp",
        sortOrder: 1,
      },
    ],
  });

  console.log(`✓ Seeded pending submission from Hendrik Van Der Merwe for Admin review.`);

  // 5. Initial Activity Log
  await prisma.adminActivityLog.create({
    data: {
      actorId: admin.id,
      actorName: admin.name,
      action: "SYSTEM_INITIALIZED",
      entityId: "SYSTEM",
      detail: "Database seeded with default Atelier Timepieces inventory and initial pending submission.",
    },
  });

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
