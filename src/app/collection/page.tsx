import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/site-chrome";
import { Catalogue } from "@/components/catalogue";
import { publicPage } from "@/lib/public-catalogue";
import { brand as store } from "@/config/brand";
import { breadcrumbJsonLd, jsonLd } from "@/lib/seo";
export const dynamic = "force-dynamic";

type Params = Promise<{ brand?: string; search?: string; focus?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Params;
}): Promise<Metadata> {
  const { brand } = await searchParams;
  const name = brand?.slice(0, 80);
  const title = name
    ? `Pre-owned ${name} watches for sale in Namibia`
    : "Pre-owned luxury watches for sale in Namibia";
  return {
    title,
    description: name
      ? `Browse pre-owned ${name} watches at ${store.name} in Windhoek. Photos, condition, box and papers, and prices in N$.`
      : `Browse every pre-owned luxury watch at ${store.name}: Rolex, Omega, Tudor, TAG Heuer and more, with photos, condition and prices in N$.`,
    alternates: {
      canonical: name
        ? "/collection?brand=" + encodeURIComponent(name)
        : "/collection",
    },
  };
}

export default async function Collection({
  searchParams,
}: {
  searchParams: Params;
}) {
  const params = await searchParams;
  const brand = params.brand?.slice(0, 80) || "";
  const initial = await publicPage({
    brand: brand || "All brands",
    search: params.search?.slice(0, 120) || "",
  });
  const origin = process.env.APP_ORIGIN || "";
  return (
    <>
      <Header />
      <main className="lt-page">
        <div className="lt-wrap">
          <nav className="lt-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            {brand ? (
              <>
                <Link href="/collection">All watches</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{brand}</span>
              </>
            ) : (
              <span aria-current="page">All watches</span>
            )}
          </nav>
          <header className="lt-page-head">
            <p className="lt-eyebrow">Browse the collection</p>
            <h1>{brand ? `${brand} watches` : "All watches"}</h1>
            <p className="lt-lede">
              Pre-owned luxury watches for sale in Namibia. Every listing shows
              real photos, the condition grade, what comes in the box and the
              price in N$.
            </p>
          </header>
          <Catalogue
            watches={initial.watches}
            initialTotal={initial.total}
            allBrands={initial.brands}
            brandCounts={initial.brandCounts}
            remote
            initialBrand={brand || "All brands"}
            initialSearch={params.search || ""}
            focusSearch={params.focus === "search"}
          />
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", url: origin + "/" },
              { name: "All watches", url: origin + "/collection" },
              ...(brand
                ? [
                    {
                      name: brand,
                      url:
                        origin +
                        "/collection?brand=" +
                        encodeURIComponent(brand),
                    },
                  ]
                : []),
            ]),
          ),
        }}
      />
      <Footer />
    </>
  );
}
