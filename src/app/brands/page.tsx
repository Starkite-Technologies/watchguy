import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { publicPage } from "@/lib/public-catalogue";
export const dynamic = "force-dynamic";
export const metadata = { title: "Explore by Brand" };
export default async function Page() {
  const { brands } = await publicPage({}, 1, 1);
  return (
    <>
      <Header />
      <main className="page-main section-wrap">
        <div className="page-heading">
          <SectionLabel>THE COLLECTION</SectionLabel>
          <h1>
            Distinctive names.
            <br />
            <em>A personal discovery.</em>
          </h1>
        </div>
        <div className="brand-list">
          {brands.map((brand, i) => (
            <Link
              key={brand}
              href={"/collection?brand=" + encodeURIComponent(brand)}
            >
              <span className="eyebrow">0{i + 1}</span>
              <h2>{brand}</h2>
              <span>Explore timepieces</span>
              <ArrowUpRight size={23} />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
