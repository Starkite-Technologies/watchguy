"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, CheckCircle2, Loader2, ArrowUpRight } from "lucide-react";
import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { BRAND, getWhatsAppGeneralLink } from "@/config/brand";

export default function ContactPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry.");
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-[#08090B] pt-32 pb-36 min-h-screen text-[#F4F1EA]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <SectionLabel>PRIVATE CLIENT CONCIERGE</SectionLabel>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal uppercase tracking-tight mt-3 mb-6">
              Connect With Atelier
            </h1>
            <p className="text-base sm:text-lg text-[#A8A59E] leading-relaxed font-sans-ui">
              Whether you are seeking a specific vintage reference, arranging a private vault viewing in Windhoek, or requesting an appraisal, our horological advisors remain at your service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Direct Channels & Address (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              {/* WhatsApp Card */}
              <div className="luxury-card rounded-2xl p-8 bg-gradient-to-br from-[#12161A] to-[#0A0D10] border border-[#B79B6C]/30 shadow-2xl">
                <div className="flex items-center gap-3 text-[#B79B6C] mb-4">
                  <MessageCircle size={28} />
                  <span className="text-xs uppercase tracking-[0.25em] font-medium font-sans-ui">
                    Immediate Response
                  </span>
                </div>
                <h3 className="font-editorial text-2xl text-white font-normal uppercase mb-3">
                  WhatsApp Concierge
                </h3>
                <p className="text-sm text-[#A8A59E] leading-relaxed mb-6">
                  For time-sensitive inquiries, immediate photographs, or private vault booking, converse directly with our senior client advisor.
                </p>
                <a
                  href={getWhatsAppGeneralLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  <span>Open WhatsApp ({BRAND.whatsappDisplay})</span>
                </a>
              </div>

              {/* Address & Hours */}
              <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0E1013] space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <MapPin className="text-[#B79B6C] mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white font-medium mb-1">
                      Boutique & Vault Address
                    </h4>
                    <p className="text-[#A8A59E] leading-relaxed">
                      {BRAND.address}
                      <br />
                      {BRAND.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-white/[0.06]">
                  <Phone className="text-[#B79B6C] mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white font-medium mb-1">
                      Direct Telephone
                    </h4>
                    <p className="text-[#A8A59E] font-mono">{BRAND.contactPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-white/[0.06]">
                  <Mail className="text-[#B79B6C] mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white font-medium mb-1">
                      Boutique Email
                    </h4>
                    <p className="text-[#A8A59E]">{BRAND.contactEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: General Enquiry Form (7 cols) */}
            <div className="lg:col-span-7 luxury-glass rounded-3xl p-8 md:p-12 border border-white/[0.08] bg-[#0C0E11] shadow-2xl">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-editorial text-3xl text-white uppercase">
                    Message Dispatched
                  </h3>
                  <p className="text-sm text-[#A8A59E] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{customerName}</strong>. Your enquiry has reached our private client concierge in Windhoek. We will contact you via your provided email or telephone.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="btn-gold mt-6"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#B79B6C] font-medium">
                      Bespoke Inquiry
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal uppercase mt-1">
                      Send A Confidential Message
                    </h2>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Johannes Shipanga"
                      className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@example.na"
                        className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+264 81 ..."
                        className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#A8A59E] mb-2 font-sans-ui">
                      Your Message or Sourcing Request *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you are looking for, or specify dates for a private viewing..."
                      className="w-full bg-[#14171A] border border-white/[0.1] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#B79B6C]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full py-4 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Transmitting Message...</span>
                      </>
                    ) : (
                      <span>Dispatch Confidential Message</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
