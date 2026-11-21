import { Header, Footer, SectionLabel } from "@/components/site-chrome";
export const metadata = { title: "Terms & Conditions" };
export default function Terms() {
  return (
    <>
      <Header />
      <main className="page-main section-wrap legal-page">
        <SectionLabel>TERMS & CONDITIONS — PRE-LAUNCH DRAFT</SectionLabel>
        <h1>
          Clear details.
          <br />
          <em>Personal conversations.</em>
        </h1>
        <h2>Enquiry-based sales</h2>
        <p>
          This initial release supports enquiries rather than online payment.
          Availability, condition, provenance, pricing and purchase arrangements
          must be confirmed with the boutique before an agreement is made.
          Reserved and sold status can change.
        </p>
        <h2>Submitting a watch</h2>
        <p>
          You must own the watch or have authority to sell it. Supply accurate
          details, known defects and photographs you have permission to share.
          Do not include personal documents, payment details or third-party
          private information in photographs.
        </p>
        <p>
          A submission is not authentication, valuation, acceptance for listing
          or an offer to buy. It remains private until an authorized
          administrator explicitly approves the public price, description and
          selected images. The boutique may reject a submission or request more
          information.
        </p>
        <h2>Public listings</h2>
        <p>
          Approved third-party listings are identified separately from company
          inventory. Private seller contact information is not displayed
          publicly. Inclusion does not imply an official brand partnership or
          manufacturer authorization.
        </p>
        <h2>Before commercial launch</h2>
        <p>
          The operator must supply reviewed sale terms, commission and
          consignment arrangements, payment and delivery terms, returns, legal
          identity, dispute procedures and applicable privacy information. These
          draft terms are not a substitute for the client’s final policies.
        </p>
      </main>
      <Footer />
    </>
  );
}
