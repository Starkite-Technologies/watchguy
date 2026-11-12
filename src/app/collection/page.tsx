import { db } from "@/lib/db";
import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { CollectionView } from "@/components/collection-view";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Horological Collection",
  description: "Browse curated luxury timepieces authenticated in Windhoek, Namibia. Rolex, Omega, Patek Philippe, and fine Swiss watchmaking.",
};

interface CollectionPageProps {
  searchParams: Promise<{
    brand?: string;
    condition?: string;
  }>;
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  const params = await searchParams;
  const initialBrand = params.brand || "All";
  const initialCondition = params.condition || "All";

  // Live database fetch of published watches
  const watches = await db.watch.findMany({
    where: {
      published: true,
      status: { not: "SOLD" },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Header />
      <main className="bg-[#08090B] pt-32 pb-36 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Editorial Header */}
          <div className="max-w-3xl mb-14">
            <SectionLabel>THE COMPLETE CATALOGUE</SectionLabel>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal uppercase tracking-tight mt-3 mb-6">
              The Horological Collection
            </h1>
            <p className="text-base sm:text-lg text-[#A8A59E] leading-relaxed font-sans-ui">
              Every timepiece presented in our collection has undergone rigorous provenance verification, mechanical timing inspection, and aesthetic detailing in our Windhoek vault.
            </p>
          </div>

          {/* Interactive Collection View with Live Data */}
          <CollectionView
            initialWatches={watches}
            initialBrand={initialBrand}
            initialCondition={initialCondition}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
