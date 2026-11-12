import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Header, Footer } from "@/components/site-chrome";
import { WatchDetailClient } from "@/components/watch-detail-client";
import { BRAND, formatNAD } from "@/config/brand";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WatchPageProps) {
  const { slug } = await params;
  const watch = await db.watch.findUnique({
    where: { slug },
    select: {
      brand: true,
      model: true,
      referenceNumber: true,
      price: true,
      description: true,
    },
  });

  if (!watch) {
    return { title: "Timepiece Not Found" };
  }

  return {
    title: `${watch.brand} ${watch.model} | ${BRAND.name}`,
    description: `${watch.brand} ${watch.model} listed at ${formatNAD(watch.price)}. ${watch.description.substring(0, 150)}...`,
  };
}

export default async function WatchDetailPage({ params }: WatchPageProps) {
  const { slug } = await params;

  const watch = await db.watch.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!watch || !watch.published) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-[#08090B] min-h-screen">
        <WatchDetailClient watch={watch} />
      </main>
      <Footer />
    </>
  );
}
