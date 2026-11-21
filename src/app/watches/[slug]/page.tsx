import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowRight } from "lucide-react";
import { getWatch } from "@/lib/catalogue";
import { relatedWatches } from "@/lib/public-catalogue";
import { Header, Footer } from "@/components/site-chrome";
import { WatchDetail } from "@/components/watch-detail";
import { WatchCard } from "@/components/catalogue";
import { brand as store } from "@/config/brand";
import {
  breadcrumbJsonLd,
  jsonLd,
  productJsonLd,
  seoDescription,
  seoTitle,
  watchName,
  writeUpFor,
} from "@/lib/seo";
export const dynamic = "force-dynamic";

const ctx = { siteName: store.name, location: store.location };
const load = cache(async (slug: string) => getWatch(slug));
type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const watch = await load(slug);
  if (!watch) return { title: "Watch not available", robots: { index: false } };
  const title = seoTitle(watch);
  const description = seoDescription(watch, ctx);
  return {
    title: { absolute: title + " | " + store.shortName },
    description,
    alternates: { canonical: "/watches/" + watch.slug },
    robots: watch.demo ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title: watchName(watch),
      description,
      url: "/watches/" + watch.slug,
      images: watch.images.slice(0, 1).map((url) => ({
        url,
        alt: watchName(watch),
      })),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Specs({
  watch,
}: {
  watch: NonNullable<Awaited<ReturnType<typeof load>>>;
}) {
  const groups: [string, [string, string | number | null | undefined][]][] = [
    [
      "Case",
      [
        ["Diameter", watch.diameter],
        ["Material", watch.caseMaterial],
        ["Water resistance", watch.waterResistance],
      ],
    ],
    [
      "Dial and strap",
      [
        ["Dial", watch.dial],
        ["Bracelet or strap", watch.bracelet],
      ],
    ],
    ["Movement", [["Movement", watch.movement]]],
    [
      "This watch",
      [
        ["Brand", watch.brand],
        ["Model", watch.model],
        ["Reference", watch.reference],
        ["Year", watch.year],
        ["Condition", watch.condition],
        ["Original box", watch.box ? "Included" : "Not included"],
        ["Original papers", watch.papers ? "Included" : "Not included"],
      ],
    ],
  ];
  return (
    <div className="lt-spec-grid">
      {groups
        .map(([title, rows]) => [title, rows.filter(([, v]) => v)] as const)
        .filter(([, rows]) => rows.length)
        .map(([title, rows]) => (
          <section key={title} className="lt-spec-group">
            <h3>{title}</h3>
            <dl>
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
    </div>
  );
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const watch = await load(slug);
  if (!watch) notFound();
  const related = await relatedWatches(watch.brand, watch.id);
  const origin = process.env.APP_ORIGIN || "";
  const url = origin + "/watches/" + watch.slug;
  const brandUrl = "/collection?brand=" + encodeURIComponent(watch.brand);
  const paragraphs = writeUpFor(watch, ctx).split(/\n{2,}/);
  return (
    <>
      <Header />
      <main className="lt-page">
        <div className="lt-wrap">
          <nav className="lt-breadcrumb" aria-label="Breadcrumb">
            <Link href="/collection">All watches</Link>
            <span aria-hidden="true">/</span>
            <Link href={brandUrl}>{watch.brand}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{watch.model}</span>
          </nav>
          <WatchDetail watch={watch} demo={!!watch.demo} />

          <div className="lt-detail-body">
            <section className="lt-section" aria-labelledby="description">
              <h2 id="description">
                About this {watch.brand} {watch.model}
              </h2>
              <div className="lt-prose">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {watch.description && (
                <>
                  <h3 className="lt-subhead">From the listing</h3>
                  <p className="lt-prose">{watch.description}</p>
                </>
              )}
              {watch.defects && (
                <div className="lt-condition">
                  <h3>Condition notes</h3>
                  <p>{watch.defects}</p>
                </div>
              )}
            </section>
            <section className="lt-section" aria-labelledby="specification">
              <h2 id="specification">Specification</h2>
              <Specs watch={watch} />
            </section>
          </div>

          {related.length > 0 && (
            <section
              className="lt-section lt-related"
              aria-labelledby="related"
            >
              <div className="lt-section-head">
                <h2 id="related">More from {watch.brand}</h2>
                <Link className="lt-link" href={brandUrl}>
                  See all {watch.brand}{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <div className="lt-grid lt-grid-compact">
                {related.map((w, i) => (
                  <WatchCard key={w.id} watch={w} index={i + 4} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            productJsonLd(watch, url, ctx),
            breadcrumbJsonLd([
              { name: "All watches", url: origin + "/collection" },
              { name: watch.brand, url: origin + brandUrl },
              { name: watch.model, url },
            ]),
          ]),
        }}
      />
      <Footer />
    </>
  );
}
