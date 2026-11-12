import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Header,
  Footer,
  SectionLabel,
  SellBanner,
} from "@/components/site-chrome";
import { CinematicHero } from "@/components/cinematic-hero";
import { Catalogue, WatchCard } from "@/components/catalogue";
import { getWatches, getContent, demoEnabled } from "@/lib/catalogue";
import { brand } from "@/config/brand";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [watches, content] = await Promise.all([getWatches(), getContent()]);
  const featured = watches.filter((w) => w.featured).slice(0, 3);
  return (
    <>
      <Header />
      <main>
        <CinematicHero
          title={content.heroTitle}
          subtitle={content.heroSubtitle}
        />
        <div className="intro-strip">
          <span>EXCEPTIONAL TIMEPIECES. PERSONAL CONNECTIONS.</span>
          <span>
            NAMIBIA <i /> A CONSIDERED PERSPECTIVE
          </span>
        </div>
        <section className="featured-section section-wrap" id="featured">
          <div className="section-heading">
            <div>
              <SectionLabel index="02 / THE CURATED EDIT">
                WORTH YOUR TIME
              </SectionLabel>
              <h2>
                Exceptional timepieces.
                <br />
                <em>Chosen with intention.</em>
              </h2>
            </div>
            <Link href="/collection" className="text-link">
              View all watches <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="featured-grid">
            {featured.map((watch, i) => (
              <WatchCard key={watch.id} watch={watch} index={i} />
            ))}
          </div>
          {!featured.length && (
            <div className="empty-state">
              <h3>A considered selection is on its way.</h3>
              <Link className="text-link" href="/collection">
                Explore the collection ?
              </Link>
            </div>
          )}
          {demoEnabled() && (
            <p className="demo-caption">
              DESIGN PREVIEW ? FICTIONAL WATCHES & ORIGINAL UNBRANDED CONCEPT
              IMAGERY
            </p>
          )}
        </section>
        <section className="story-section">
          <div className="story-image">
            <img
              src={brand.heroImage}
              alt="A closer look at the original unbranded chronograph concept"
              loading="lazy"
            />
            <span>FORM. FUNCTION. FEELING.</span>
          </div>
          <div className="story-copy">
            <SectionLabel index="03 / OUR PERSPECTIVE">
              A DIFFERENT RELATIONSHIP WITH TIME
            </SectionLabel>
            <h2>
              More than a watch.
              <br />
              <em>A legacy.</em>
            </h2>
            <p>{content.aboutText}</p>
            <Link href="/about" className="text-link">
              Discover our story <ArrowUpRight size={17} />
            </Link>
            <span className="story-footnote">
              SOME THINGS ONLY BECOME MORE PERSONAL WITH TIME.
            </span>
          </div>
        </section>
        <section className="collection-section section-wrap" id="collection">
          <div className="section-heading">
            <div>
              <SectionLabel index="04 / DISCOVER">
                FIND YOUR NEXT CHAPTER
              </SectionLabel>
              <h2>
                A timepiece for
                <br />
                <em>your kind of time.</em>
              </h2>
            </div>
            <p>
              Follow a familiar name. Find something unexpected.
              <br />
              Explore the pieces that speak to you.
            </p>
          </div>
          <Catalogue watches={watches} compact />
        </section>
        <SellBanner />
      </main>
      <Footer />
    </>
  );
}
