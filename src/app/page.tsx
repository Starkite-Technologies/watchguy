import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Clock, Award, Compass, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { BRAND, formatNAD, getWhatsAppGeneralLink } from "@/config/brand";
import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { CinematicHero } from "@/components/cinematic-hero";
import { WatchCard } from "@/components/watch-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch live featured watches from database
  const featuredWatches = await db.watch.findMany({
    where: {
      published: true,
      featured: true,
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      <Header />
      <main className="bg-[#08090B] text-[#F4F1EA]">
        {/* Section 1: Cinematic Hero with Scroll Sequence */}
        <CinematicHero />

        {/* Brand Ribbon: Heritage Curation */}
        <section className="border-y border-white/[0.08] bg-[#0B0D10] py-6 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-8 min-w-[600px]">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#B79B6C] font-medium whitespace-nowrap">
              Curated Brands
            </span>
            <div className="flex items-center gap-8 md:gap-14 text-xs uppercase tracking-[0.2em] text-[#A8A59E]">
              {BRAND.featuredBrands.map((brand) => (
                <Link
                  key={brand}
                  href={`/collection?brand=${encodeURIComponent(brand)}`}
                  className="hover:text-white transition-colors whitespace-nowrap font-sans-ui"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Featured Watches */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <SectionLabel>01 / CURATED TIMEPIECES</SectionLabel>
              <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-white font-normal uppercase tracking-tight">
                Featured Acquisitions
              </h2>
            </div>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B79B6C] hover:text-white transition-colors"
            >
              <span>View Complete Catalogue</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {featuredWatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWatches.map((watch) => (
                <WatchCard key={watch.id} watch={watch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/[0.06] rounded-xl">
              <p className="font-editorial text-xl text-[#A8A59E]">
                New curation currently undergoing verification.
              </p>
              <Link href="/collection" className="btn-gold mt-6 inline-block">
                Explore Full Collection
              </Link>
            </div>
          )}
        </section>

        {/* Section 3: Brand Story — Editorial Section */}
        <section className="bg-[#0C0E11] border-y border-white/[0.08] py-28 md:py-36 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(183,155,108,0.05)_0%,transparent_70%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Visual Column: Chronograph Blueprint Study */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#14171A] p-4 group">
                <img
                  src="/sequence/frame-043.webp"
                  alt="Exploded Chronograph Movement Study"
                  className="w-full h-auto object-cover rounded-xl filter contrast-125"
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#08090B]/85 backdrop-blur-md border border-white/[0.08]">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-[#B79B6C] mb-1">
                    Horological Architecture
                  </div>
                  <div className="text-sm font-editorial text-white">
                    Column-Wheel & Free-Sprung Balance Wheel Study
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Copy Column */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <SectionLabel>THE ATELIER HERITAGE</SectionLabel>
                <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal uppercase leading-[1.1] tracking-tight mt-3">
                  {BRAND.editorialHeadline}
                </h2>
              </div>

              <p className="text-base sm:text-lg text-[#A8A59E] leading-relaxed font-sans-ui max-w-2xl">
                Founded to bridge the discreet world of Swiss fine watchmaking with the discerning collectors of southern Africa, Atelier Timepieces represents a sanctuary of horological integrity in Windhoek.
              </p>

              <p className="text-base sm:text-lg text-[#A8A59E] leading-relaxed font-sans-ui max-w-2xl">
                Every timepiece admitted to our vault undergoes rigorous physical inspection, movement timing verification, and provenance archiving. We do not deal in mere instruments of seconds; we safeguard milestones, heirlooms, and monuments of mechanical perfection.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.08]">
                <div>
                  <div className="font-editorial text-2xl md:text-3xl text-white font-medium mb-1">
                    100%
                  </div>
                  <div className="text-xs uppercase tracking-wider text-[#B79B6C]">
                    Authenticated
                  </div>
                </div>
                <div>
                  <div className="font-editorial text-2xl md:text-3xl text-white font-medium mb-1">
                    Windhoek
                  </div>
                  <div className="text-xs uppercase tracking-wider text-[#B79B6C]">
                    Private Vault
                  </div>
                </div>
                <div>
                  <div className="font-editorial text-2xl md:text-3xl text-white font-medium mb-1">
                    Direct
                  </div>
                  <div className="text-xs uppercase tracking-wider text-[#B79B6C]">
                    Client Advisory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Collection Philosophy Grid */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-28 md:py-36">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <SectionLabel>CATEGORIES OF DISTINCTION</SectionLabel>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-white font-normal uppercase mt-2">
              Curated By Discipline
            </h2>
            <p className="text-[#A8A59E] text-base mt-4">
              Explore timepieces categorized by horological heritage, complication, and aesthetic significance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Sports & Divers */}
            <div className="luxury-card rounded-2xl p-8 flex flex-col justify-between min-h-[380px] bg-gradient-to-b from-[#121417] to-[#0A0B0D]">
              <div>
                <Compass className="text-[#B79B6C] mb-6" size={32} />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79B6C] block mb-2 font-sans-ui">
                  High Performance
                </span>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase mb-3">
                  Chronographs & Divers
                </h3>
                <p className="text-sm text-[#A8A59E] leading-relaxed">
                  Submariners, Speedmasters, and Black Bays engineered for underwater depth and lunar velocity.
                </p>
              </div>
              <Link
                href="/collection?condition=Mint+(Like+New)"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B79B6C] hover:text-white transition-colors pt-6 border-t border-white/[0.06]"
              >
                <span>View Models</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* Card 2: Haute Horlogerie & Dress */}
            <div className="luxury-card rounded-2xl p-8 flex flex-col justify-between min-h-[380px] bg-gradient-to-b from-[#121417] to-[#0A0B0D]">
              <div>
                <Award className="text-[#B79B6C] mb-6" size={32} />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79B6C] block mb-2 font-sans-ui">
                  Quiet Elegance
                </span>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase mb-3">
                  Dress & Complications
                </h3>
                <p className="text-sm text-[#A8A59E] leading-relaxed">
                  Patek Philippe Calatravas, IWC Portugiesers, and Santos timepieces in precious metals.
                </p>
              </div>
              <Link
                href="/collection?brand=IWC+Schaffhausen"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B79B6C] hover:text-white transition-colors pt-6 border-t border-white/[0.06]"
              >
                <span>View Models</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* Card 3: Collector Consignment */}
            <div className="luxury-card rounded-2xl p-8 flex flex-col justify-between min-h-[380px] bg-gradient-to-b from-[#121417] to-[#0A0B0D]">
              <div>
                <Clock className="text-[#B79B6C] mb-6" size={32} />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79B6C] block mb-2 font-sans-ui">
                  Private Vault
                </span>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase mb-3">
                  Collector Submissions
                </h3>
                <p className="text-sm text-[#A8A59E] leading-relaxed">
                  Timepieces curated directly from verified private collectors and estate holdings across Namibia.
                </p>
              </div>
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B79B6C] hover:text-white transition-colors pt-6 border-t border-white/[0.06]"
              >
                <span>View Models</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 5: Sell Your Watch Showcase CTA */}
        <section className="bg-[#050607] border-y border-white/[0.08] py-28 md:py-36 relative">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
            <SectionLabel>PRIVATE CONSIGNMENT & ACQUISITION</SectionLabel>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal uppercase tracking-tight mt-4 mb-6">
              YOUR WATCH. OUR SHOWCASE.
            </h2>
            <p className="text-base sm:text-lg text-[#A8A59E] font-editorial italic max-w-2xl mx-auto mb-10 leading-relaxed">
              Own a timepiece you would like to sell? Submit your watch for our horological team to review with complete privacy and discretion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sell" className="btn-gold px-10 py-4 text-sm">
                <span>Submit Your Watch</span>
                <ArrowUpRight size={16} />
              </Link>
              <a
                href={getWhatsAppGeneralLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-luxury px-8 py-4 text-sm"
              >
                <MessageCircle size={16} className="text-[#B79B6C]" />
                <span>Enquire On WhatsApp</span>
              </a>
            </div>

            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto pt-10 border-t border-white/[0.06]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-[#B79B6C] mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white font-medium">
                    No Public Account Needed
                  </h4>
                  <p className="text-xs text-[#A8A59E] mt-1">
                    Fast, seamless multi-step submission directly to our private review queue.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="text-[#B79B6C] mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white font-medium">
                    Fair Market Valuation
                  </h4>
                  <p className="text-xs text-[#A8A59E] mt-1">
                    Transparent pricing in Namibian Dollars (N$) aligned with global horological indices.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-[#B79B6C] mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white font-medium">
                    Swift Evaluation
                  </h4>
                  <p className="text-xs text-[#A8A59E] mt-1">
                    Personalized response and preliminary assessment within 24 to 48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
