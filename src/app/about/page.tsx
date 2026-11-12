import Link from "next/link";
import { ArrowUpRight, Award, Clock, Compass, ShieldCheck } from "lucide-react";
import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { BRAND } from "@/config/brand";

export const metadata = {
  title: "Boutique Heritage & Philosophy",
  description: "Learn about Atelier Timepieces — Namibia's premier destination for authenticated Swiss horology and private watch collection management.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-[#08090B] pt-32 pb-36 min-h-screen text-[#F4F1EA]">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="mb-16">
            <SectionLabel>OUR HOROLOGICAL ORIGINS</SectionLabel>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal uppercase tracking-tight mt-3 mb-6">
              MORE THAN A WATCH. A LEGACY.
            </h1>
            <p className="text-lg text-[#A8A59E] leading-relaxed font-sans-ui max-w-3xl">
              Established in Windhoek, {BRAND.name} was conceived with a single guiding ambition: to bring the uncompromising standards of Swiss haute horlogerie to the passionate collectors and connoisseurs of Namibia and southern Africa.
            </p>
          </div>

          {/* Visual Showcase */}
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-[#14171A] my-12">
            <img
              src="/sequence/frame-090.webp"
              alt="Swiss Escapement & Balance Spring Craftsmanship"
              className="w-full h-[400px] object-cover filter contrast-125 brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B79B6C] font-medium block mb-1">
                Mechanical Precision
              </span>
              <p className="font-editorial text-2xl text-white">
                Guaranteed Authenticity. Transparent Provenance. Unmatched Discretion.
              </p>
            </div>
          </div>

          {/* Core Tenets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            <div className="luxury-card p-8 rounded-2xl bg-[#0E1013]">
              <ShieldCheck className="text-[#B79B6C] mb-4" size={28} />
              <h3 className="font-editorial text-xl text-white mb-2 uppercase">
                Physical Authentication
              </h3>
              <p className="text-xs text-[#A8A59E] leading-relaxed">
                Every timepiece in our vault is physically verified for case integrity, dial originality, escapement amplitude, and matching movement serial numbers.
              </p>
            </div>

            <div className="luxury-card p-8 rounded-2xl bg-[#0E1013]">
              <Compass className="text-[#B79B6C] mb-4" size={28} />
              <h3 className="font-editorial text-xl text-white mb-2 uppercase">
                Windhoek Private Vault
              </h3>
              <p className="text-xs text-[#A8A59E] leading-relaxed">
                Discreet viewings and acquisitions occur in our secure Windhoek sanctuary, offering clients a serene, private environment without retail pressure.
              </p>
            </div>

            <div className="luxury-card p-8 rounded-2xl bg-[#0E1013]">
              <Award className="text-[#B79B6C] mb-4" size={28} />
              <h3 className="font-editorial text-xl text-white mb-2 uppercase">
                Direct Seller Consignment
              </h3>
              <p className="text-xs text-[#A8A59E] leading-relaxed">
                We empower private collectors to realize genuine global market value for their watches in Namibian Dollars (N$) through transparent, curated showcase listings.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t border-white/[0.08] pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-editorial text-2xl text-white uppercase">
                Looking to Acquire or Consign?
              </h4>
              <p className="text-sm text-[#A8A59E]">
                Our private concierge is at your service.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/collection" className="btn-gold">
                <span>View Collection</span>
                <ArrowUpRight size={14} />
              </Link>
              <Link href="/contact" className="btn-ghost-luxury">
                <span>Visit Boutique</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
