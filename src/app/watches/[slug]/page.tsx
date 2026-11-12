import { notFound } from "next/navigation";
import { getWatch } from "@/lib/catalogue";
import { Header, Footer } from "@/components/site-chrome";
import { WatchDetail } from "@/components/watch-detail";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const watch = await getWatch((await params).slug);
  return watch
    ? {
        title: watch.brand + " " + watch.model,
        description: watch.description.slice(0, 160),
        openGraph: { images: watch.images.slice(0, 1) },
      }
    : { title: "Timepiece unavailable" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const watch = await getWatch((await params).slug);
  if (!watch) notFound();
  return (
    <>
      <Header />
      <WatchDetail watch={watch} demo={!!watch.demo} />
      <Footer />
    </>
  );
}
