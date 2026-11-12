"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Mail,
  Clock,
  Sparkles,
  Award,
  Box,
  FileCheck,
  Check,
  Loader2,
} from "lucide-react";
import { formatNAD, getWhatsAppWatchLink, BRAND } from "@/config/brand";

interface WatchDetailProps {
  watch: {
    id: string;
    slug: string;
    brand: string;
    model: string;
    referenceNumber?: string | null;
    year?: number | null;
    condition: string;
    price: number;
    currency: string;
    description: string;
    diameter?: string | null;
    movement?: string | null;
    box: boolean;
    papers: boolean;
    status: string; // AVAILABLE, RESERVED, SOLD
    ownershipType: string; // COMPANY, THIRD_PARTY
    images: { id: string; imageUrl: string; sortOrder: number }[];
  };
}

export function WatchDetailClient({ watch }: WatchDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState(
    `Hello, I would like to enquire about acquiring the ${watch.brand} ${watch.model}${
      watch.referenceNumber ? ` (Ref. ${watch.referenceNumber})` : ""
    } listed for ${formatNAD(watch.price)}. Is this timepiece currently available for inspection in Windhoek?`,
  );
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const images =
    watch.images && watch.images.length > 0
      ? watch.images.map((img) => img.imageUrl)
      : ["/watches/daytona.webp"];

  const currentImage = images[selectedImageIndex] || images[0];
  const isAvailable = watch.status === "AVAILABLE";
  const isReserved = watch.status === "RESERVED";
  const isSold = watch.status === "SOLD";

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          message,
          watchId: watch.id,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-36">
      {/* Back Link */}
      <div className="mb-10">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A8A59E] hover:text-[#B79B6C] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back To Collection</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Image */}
          <div className="luxury-glass rounded-2xl p-8 md:p-14 border border-white/[0.08] flex items-center justify-center min-h-[460px] md:min-h-[560px] relative overflow-hidden bg-[#0C0E11]">
            <img
              src={currentImage}
              alt={`${watch.brand} ${watch.model}`}
              className="max-h-[440px] md:max-h-[500px] w-auto object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out"
            />

            {/* Condition Pill Overlay */}
            <div className="absolute top-6 left-6">
              <span className="text-xs uppercase tracking-wider text-[#B79B6C] bg-[#14171A]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#B79B6C]/30 font-medium">
                {watch.condition}
              </span>
            </div>

            {/* Status Indicator Overlay */}
            <div className="absolute top-6 right-6">
              {isSold ? (
                <span className="text-xs uppercase tracking-wider text-rose-300 bg-rose-950/80 px-3.5 py-1.5 rounded-full border border-rose-800/50">
                  Sold / In Private Vault
                </span>
              ) : isReserved ? (
                <span className="text-xs uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-800/50">
                  Reserved
                </span>
              ) : (
                <span className="text-xs uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-3.5 py-1.5 rounded-full border border-emerald-800/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Available For Acquisition
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-24 h-24 rounded-xl border p-2 bg-[#0E1013] transition-all shrink-0 flex items-center justify-center ${
                    selectedImageIndex === idx
                      ? "border-[#B79B6C] ring-2 ring-[#B79B6C]/30"
                      : "border-white/[0.08] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Timepiece Identity & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#B79B6C] font-medium mb-2 font-sans-ui">
              {watch.brand}
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-white font-normal uppercase tracking-tight leading-[1.1]">
              {watch.model}
            </h1>
            {watch.referenceNumber && (
              <div className="text-sm text-[#A8A59E] font-mono tracking-wider mt-2">
                Reference: {watch.referenceNumber} {watch.year ? `• Year: ${watch.year}` : ""}
              </div>
            )}
          </div>

          {/* Pricing Display */}
          <div className="p-6 rounded-2xl bg-[#0E1013] border border-white/[0.08]">
            <div className="text-xs uppercase tracking-[0.2em] text-[#A8A59E] mb-1 font-sans-ui">
              Acquisition Value
            </div>
            <div className="font-editorial text-3xl sm:text-4xl text-white font-normal">
              {formatNAD(watch.price)}
            </div>
            <div className="text-xs text-[#A8A59E]/70 mt-1">
              Namibian Dollars (NAD) • Physical collection in Windhoek or insured southern African transit
            </div>
          </div>

          {/* Prominent Horological Actions */}
          <div className="space-y-3 pt-2">
            {isSold ? (
              <div className="p-4 rounded-xl bg-[#14171A] border border-white/[0.08] text-center text-sm text-[#A8A59E]">
                This timepiece has been acquired. You may contact our concierge to source an equivalent reference.
              </div>
            ) : (
              <>
                <a
                  href={getWhatsAppWatchLink(watch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full py-4 text-center text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <span>Enquire on WhatsApp</span>
                </a>

                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="btn-ghost-luxury w-full py-4 text-center text-sm flex items-center justify-center gap-2"
                >
                  <Mail size={17} />
                  <span>Contact About This Watch</span>
                </button>
              </>
            )}
          </div>

          {/* Provenance & Ownership Classification */}
          <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0A0B0D] space-y-3 text-xs leading-relaxed text-[#A8A59E]">
            <div className="flex items-center gap-2 text-white font-medium uppercase tracking-wider text-[11px]">
              <ShieldCheck className="text-[#B79B6C]" size={16} />
              <span>
                {watch.ownershipType === "COMPANY"
                  ? "Atelier Boutique Vault Inventory"
                  : "Approved Private Consignment"}
              </span>
            </div>
            <p>
              Inspected and authenticated by our master horologist. All components, serial numbers, and functions verified against international manufacturer registries.
            </p>
          </div>

          {/* Detailed Specifications Matrix */}
          <div className="pt-6 border-t border-white/[0.08]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium mb-4">
              Horological Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-[#A8A59E] block mb-1">Manufacturer</span>
                <span className="text-white font-medium">{watch.brand}</span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Model Line</span>
                <span className="text-white font-medium">{watch.model}</span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Reference Number</span>
                <span className="text-white font-mono">{watch.referenceNumber || "Available upon request"}</span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Production Era</span>
                <span className="text-white font-medium">{watch.year ? `Circa ${watch.year}` : "Unstated"}</span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Diameter</span>
                <span className="text-white font-medium">{watch.diameter || "Standard manufacture"}</span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Calibre / Movement</span>
                <span className="text-white font-medium">{watch.movement || "Swiss mechanical"}</span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Original Presentation Box</span>
                <span className="text-white flex items-center gap-1 font-medium">
                  {watch.box ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>Included</span>
                    </>
                  ) : (
                    <span>Not Included</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-[#A8A59E] block mb-1">Papers & Documentation</span>
                <span className="text-white flex items-center gap-1 font-medium">
                  {watch.papers ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span>Included</span>
                    </>
                  ) : (
                    <span>Not Included</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Curatorial Description */}
          <div className="pt-6 border-t border-white/[0.08]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium mb-3">
              Curator’s Overview
            </h3>
            <p className="text-sm text-[#A8A59E] leading-relaxed whitespace-pre-line font-sans-ui">
              {watch.description}
            </p>
          </div>
        </div>
      </div>

      {/* In-Page Modal: Contact About This Watch */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0E1013] border border-white/[0.1] rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setShowEnquiryModal(false);
                setSubmitted(false);
              }}
              className="absolute top-6 right-6 text-[#A8A59E] hover:text-white"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase">
                  Enquiry Received
                </h3>
                <p className="text-sm text-[#A8A59E] leading-relaxed">
                  Thank you, <strong className="text-white">{customerName}</strong>. Our private client advisor in Windhoek has received your enquiry regarding the{" "}
                  <strong className="text-white">{watch.brand} {watch.model}</strong>. We will respond promptly.
                </p>
                <button
                  onClick={() => {
                    setShowEnquiryModal(false);
                    setSubmitted(false);
                  }}
                  className="btn-gold mt-6"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] mb-1">
                    Direct Boutique Enquiry
                  </div>
                  <h3 className="font-editorial text-2xl text-white font-normal uppercase">
                    {watch.brand} {watch.model}
                  </h3>
                  <div className="text-xs text-[#A8A59E] font-mono mt-1">
                    Value: {formatNAD(watch.price)}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Johannes Shipanga"
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@example.na"
                      className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-1.5">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+264 81 ..."
                      className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-1.5">
                    Message / Acquisition Questions *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 accent-[#B79B6C]"
                  />
                  <label htmlFor="consent" className="text-xs text-[#A8A59E] cursor-pointer">
                    I consent to Atelier Timepieces contacting me regarding this timepiece enquiry in accordance with boutique privacy terms.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full py-3.5 mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Transmitting Enquiry...</span>
                    </>
                  ) : (
                    <span>Submit Private Enquiry</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
