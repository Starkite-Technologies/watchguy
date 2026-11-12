import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { formatNAD } from "@/config/brand";

export interface WatchCardData {
  id: string;
  slug: string;
  brand: string;
  model: string;
  referenceNumber?: string | null;
  year?: number | null;
  condition: string;
  price: number;
  currency: string;
  status: string; // AVAILABLE, RESERVED, SOLD
  ownershipType?: string;
  featured?: boolean;
  images: { imageUrl: string }[];
}

export function WatchCard({ watch }: { watch: WatchCardData }) {
  const primaryImage =
    watch.images && watch.images.length > 0
      ? watch.images[0].imageUrl
      : "/watches/daytona.webp";

  const isSold = watch.status === "SOLD";
  const isReserved = watch.status === "RESERVED";

  return (
    <div className="luxury-card group flex flex-col justify-between rounded-xl overflow-hidden p-6 md:p-8 bg-[#0E1013] relative">
      
      {/* Top Meta Badges */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#B79B6C] bg-[#14171A] px-3 py-1 rounded-full border border-[#B79B6C]/20">
          {watch.condition}
        </span>

        {isSold ? (
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-rose-400 bg-rose-950/40 px-3 py-1 rounded-full border border-rose-800/40">
            Acquired / Sold
          </span>
        ) : isReserved ? (
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40">
            Reserved
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-800/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        )}
      </div>

      {/* Product Image Stage */}
      <Link
        href={`/watches/${watch.slug}`}
        className="block relative aspect-[4/3] w-full my-4 overflow-hidden flex items-center justify-center"
      >
        <img
          src={primaryImage}
          alt={`${watch.brand} ${watch.model}`}
          loading="lazy"
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </Link>

      {/* Details & Pricing */}
      <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#A8A59E] mb-1 font-sans-ui">
            {watch.brand}
          </div>
          <Link
            href={`/watches/${watch.slug}`}
            className="font-editorial text-lg md:text-xl text-white font-medium hover:text-[#B79B6C] transition-colors line-clamp-1 block"
          >
            {watch.model}
          </Link>
          {watch.referenceNumber && (
            <div className="text-[11px] text-[#A8A59E]/70 font-mono tracking-wider mt-1">
              Ref. {watch.referenceNumber} {watch.year ? `• ${watch.year}` : ""}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A8A59E]/60 font-sans-ui">
              Price
            </span>
            <span className="text-lg md:text-xl font-editorial font-medium text-[#F4F1EA]">
              {formatNAD(watch.price)}
            </span>
          </div>

          <Link
            href={`/watches/${watch.slug}`}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-[#B79B6C] group-hover:text-white transition-colors"
          >
            <span>Details</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
