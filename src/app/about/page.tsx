import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Header,
  Footer,
  SectionLabel,
  SellBanner,
} from "@/components/site-chrome";
import { getContent } from "@/lib/catalogue";
import { brand } from "@/config/brand";
export const dynamic = "force-dynamic";
export const metadata = { title: "Our Story" };
export default async function About() {
  const c = await getContent();
  return (
    <>
      <Header />
      <main className="page-main">
        <section className="section-wrap about-intro">
          <SectionLabel>OUR PERSPECTIVE</SectionLabel>
          <h1>{c.aboutTitle}</h1>
          <div className="about-grid">
            <p className="large-copy">
              A watch keeps time.
              <br />
              <em>You give it meaning.</em>
            </p>
            <div>
              <p>{c.aboutText}</p>
              <p>
                A first milestone. An everyday ritual. Something worth passing
                on. We believe finding a timepiece should be as personal as
                wearing it.
              </p>
              <Link href="/collection" className="text-link">
                Discover the collection <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
        <section className="about-art">
          <img
            src={brand.heroImage}
            alt="Close-up of an original unbranded chronograph concept"
          />
          <span>THE BEAUTY IS IN THE DETAILS.</span>
        </section>
        <SellBanner />
      </main>
      <Footer />
    </>
  );
}
