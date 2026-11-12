import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { BRAND } from "@/config/brand";

export const metadata = {
  title: "Privacy & Data Protection Policy",
  description: "Atelier Timepieces privacy policy regarding client confidentiality, watch seller records, and transactional security in Namibia.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-[#08090B] pt-32 pb-36 min-h-screen text-[#F4F1EA]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-8">
          <div>
            <SectionLabel>LEGAL & CONFIDENTIALITY</SectionLabel>
            <h1 className="font-editorial text-4xl sm:text-5xl text-white font-normal uppercase tracking-tight mt-2 mb-4">
              Privacy & Data Policy
            </h1>
            <p className="text-sm text-[#A8A59E]">
              Last updated: November 2026 • Governing Law: Republic of Namibia
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#A8A59E] leading-relaxed pt-6 border-t border-white/[0.08]">
            <h2 className="font-editorial text-2xl text-white uppercase">
              1. Discretion & Private Seller Protection
            </h2>
            <p>
              At {BRAND.name}, confidentiality is central to luxury watchmaking. When third-party sellers submit timepieces for valuation, their personal identity, telephone number, email address, asking price, and private serial records are stored exclusively within our restricted administrative vault. They are never published publicly or shared with buyers.
            </p>

            <h2 className="font-editorial text-2xl text-white uppercase">
              2. Data Collected
            </h2>
            <p>
              We collect information strictly necessary to facilitate horological authentication and client communication:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact Details: Full legal name, telephone/WhatsApp contact, and email address.</li>
              <li>Horological Specifications: Watch manufacture, model, serial/reference number, and photographs.</li>
              <li>Customer Enquiries: Inquiries submitted for viewing appointments or purchase questions.</li>
            </ul>

            <h2 className="font-editorial text-2xl text-white uppercase">
              3. Image Storage & Access
            </h2>
            <p>
              Photographs submitted by private sellers are stored in secured storage. Only upon formal administrative approval and seller consent are selected product photographs promoted to our public collection showcase.
            </p>

            <h2 className="font-editorial text-2xl text-white uppercase">
              4. Direct Contact & Advisory
            </h2>
            <p>
              We do not sell, rent, or lease client data. Your contact details are used solely by our internal boutique advisors in Windhoek to discuss your watches and transaction requests.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
