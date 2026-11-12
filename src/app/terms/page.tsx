import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { BRAND } from "@/config/brand";

export const metadata = {
  title: "Terms & Conditions of Consignment",
  description: "Terms and conditions of watch consignment, valuation, and acquisition with Atelier Timepieces.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#08090B] pt-32 pb-36 min-h-screen text-[#F4F1EA]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-8">
          <div>
            <SectionLabel>HOROLOGICAL GOVERNANCE</SectionLabel>
            <h1 className="font-editorial text-4xl sm:text-5xl text-white font-normal uppercase tracking-tight mt-2 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-sm text-[#A8A59E]">
              Governing Law: Republic of Namibia • {BRAND.location}
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#A8A59E] leading-relaxed pt-6 border-t border-white/[0.08]">
            <h2 className="font-editorial text-2xl text-white uppercase">
              1. Scope of Boutique Operations
            </h2>
            <p>
              {BRAND.name} operates an independent luxury timepiece showcase, advisory, and verified marketplace based in Windhoek, Namibia. We are not an authorized representative or official concessionaire of any individual luxury watch manufacture, nor do we claim official brand partnerships unless specifically documented.
            </p>

            <h2 className="font-editorial text-2xl text-white uppercase">
              2. Consignment & Third-Party Submissions
            </h2>
            <p>
              By submitting a watch via our digital submission workflow, the seller warrants and affirms that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>They hold absolute and unencumbered legal title to the timepiece.</li>
              <li>The watch has not been stolen, encumbered by liens, or reported to lost/stolen registries.</li>
              <li>The photographs and specifications provided represent the actual timepiece in its true condition.</li>
              <li>Digital submission does not guarantee boutique acceptance or immediate publication.</li>
            </ul>

            <h2 className="font-editorial text-2xl text-white uppercase">
              3. Physical Inspection & Authentication
            </h2>
            <p>
              Prior to final acquisition or public buyer transfer, all approved consignments must be physically presented at our Windhoek vault for conclusive movement inspection, serial number matching, and timing machine diagnostics.
            </p>

            <h2 className="font-editorial text-2xl text-white uppercase">
              4. Currency & Pricing
            </h2>
            <p>
              All prices displayed and quoted are denominated in Namibian Dollars (NAD / N$) unless expressly stated otherwise in private negotiation.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
