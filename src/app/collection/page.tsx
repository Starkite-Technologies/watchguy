import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { Catalogue } from "@/components/catalogue";
import { publicPage } from "@/lib/public-catalogue";
export const dynamic = "force-dynamic";
export const metadata = { title: "The Collection" };
export default async function Collection({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; search?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const initial = await publicPage({
    brand: params.brand?.slice(0, 80) || "All brands",
    search: params.search?.slice(0, 120) || "",
  });
  return (
    <>
      <Header />
      <main className="page-main section-wrap">
        <div className="page-heading">
          <SectionLabel>THE COLLECTION</SectionLabel>
          <h1>
            Find the one
            <br />
            <em>that feels like you.</em>
          </h1>
          <p>Exceptional watches. Considered details. Your next chapter.</p>
        </div>
        <Catalogue
          watches={initial.watches}
          initialTotal={initial.total}
          allBrands={initial.brands}
          remote
          initialBrand={params.brand || "All brands"}
          initialSearch={params.search || ""}
          focusSearch={params.focus === "search"}
        />
      </main>
      <Footer />
    </>
  );
}
