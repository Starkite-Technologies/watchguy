import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { SellMultiStepForm } from "@/components/sell-multi-step-form";
import { BRAND } from "@/config/brand";

export const metadata = {
  title: "Sell Your Watch — Private Consignment & Valuation",
  description: "Submit your luxury wristwatch for professional valuation and consignment review by Atelier Timepieces in Windhoek, Namibia. No public account required.",
};

export default function SellPage() {
  return (
    <>
      <Header />
      <main className="bg-[#08090B] pt-32 pb-36 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Editorial Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <SectionLabel>PRIVATE HOROLOGICAL ADVISORY</SectionLabel>
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal uppercase tracking-tight mt-3 mb-4">
              YOUR WATCH. OUR SHOWCASE.
            </h1>
            <p className="text-base sm:text-lg text-[#A8A59E] leading-relaxed font-sans-ui">
              Entrust your luxury timepiece to our discreet consignment service. Complete our secure 4-step submission to receive a prompt appraisal from our Windhoek curation board.
            </p>
          </div>

          {/* Multi-Step Submission Form */}
          <SellMultiStepForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
