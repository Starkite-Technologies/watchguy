import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { brand } from "@/config/brand";
export const metadata = { title: "Privacy Policy" };
export default function Privacy() {
  return (
    <>
      <Header />
      <main className="page-main section-wrap legal-page">
        <SectionLabel>PRIVACY POLICY — PRE-LAUNCH DRAFT</SectionLabel>
        <h1>
          Your details.
          <br />
          <em>Considered carefully.</em>
        </h1>
        <p>
          {brand.name} is a temporary brand for a development preview. The
          operator’s identity and contact details must be confirmed before
          commercial launch. Please use sample information when testing the
          preview.
        </p>
        <h2>Watch submissions</h2>
        <p>
          We collect seller contact details, watch information, consent and
          photographs to consider a listing and communicate about it. Pending
          submissions and photographs are private and accessible only to
          authorized administrators. Only approved watch details and selected
          images are published. Seller contact information is never part of
          public listing data.
        </p>
        <h2>Customer enquiries</h2>
        <p>
          Your name, contact details and message are used to respond to your
          enquiry. Administrators can associate a message with the selected
          watch and record its status.
        </p>
        <h2>Storage and security</h2>
        <p>
          Private photographs use access-controlled object storage. Review links
          expire. Uploaded photos are decoded, optimized and stripped of
          embedded metadata. Administrative sessions use secure cookies. Public
          forms use rate limits and bot verification when configured for launch.
        </p>
        <h2>Retention and your choices</h2>
        <p>
          The operator must confirm retention periods, service-provider
          locations, contact details and procedures for access or deletion
          requests. A configurable cleanup tool is included for old rejected
          submissions; it is not automatically run without an approved retention
          policy.
        </p>
        <h2>Preview content</h2>
        <p>
          Sample listings are fictional. Original generated, unbranded concept
          imagery is not photography of actual stock. No authentication,
          authenticity, valuation or business credential claims should be
          inferred.
        </p>
      </main>
      <Footer />
    </>
  );
}
