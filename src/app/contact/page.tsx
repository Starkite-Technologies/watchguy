import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { EnquiryForm } from "@/components/enquiry-form";
import { getContent } from "@/lib/catalogue";
import { brand } from "@/config/brand";
import { ArrowUpRight, MessageCircle } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };
export default async function Contact() {
  const c = await getContent(),
    number = brand.whatsapp.replace(/\D/g, "");
  return (
    <>
      <Header />
      <main className="page-main section-wrap contact-page">
        <div>
          <SectionLabel>A PERSONAL CONNECTION</SectionLabel>
          <h1>
            Let?s make
            <br />
            <em>time to talk.</em>
          </h1>
          <p>
            A particular timepiece in mind? A story to share?
            <br />
            We?d love to hear from you.
          </p>
          <dl className="contact-details">
            <div>
              <dt>BASED IN</dt>
              <dd>{c.location}</dd>
            </div>
            <div>
              <dt>EMAIL</dt>
              <dd>
                {c.contactEmail.endsWith(".example") ? (
                  "Business email to be confirmed"
                ) : (
                  <a href={"mailto:" + c.contactEmail}>{c.contactEmail}</a>
                )}
              </dd>
            </div>
            <div>
              <dt>TELEPHONE</dt>
              <dd>{c.contactPhone}</dd>
            </div>
          </dl>
          {number && (
            <a
              className="text-link"
              href={"https://wa.me/" + number}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp <ArrowUpRight size={16} />
            </a>
          )}
        </div>
        <div className="contact-form-panel">
          <span className="eyebrow">YOUR ENQUIRY</span>
          <h2>A conversation starts here.</h2>
          <EnquiryForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
