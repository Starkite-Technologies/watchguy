import { Header, Footer, SectionLabel } from "@/components/site-chrome";
import { SellForm } from "@/components/sell-form";
import { demoEnabled } from "@/lib/catalogue";
import { LockKeyhole, Clock3 } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sell Your Watch" };
export default function Sell() {
  return (
    <>
      <Header />
      <main className="page-main section-wrap sell-page">
        <div className="sell-introduction">
          <SectionLabel>A NEW CHAPTER</SectionLabel>
          <h1>
            Your watch.
            <br />
            <em>Our showcase.</em>
          </h1>
          <p>
            Every timepiece has a story. Tell us yours, and let’s explore what
            comes next.
          </p>
          <div className="sell-promise">
            <LockKeyhole size={19} />
            <div>
              <strong>Private from the start.</strong>
              <p>
                Your details and photographs are only visible to our review
                team.
              </p>
            </div>
          </div>
          <div className="sell-promise">
            <Clock3 size={19} />
            <div>
              <strong>A personal consideration.</strong>
              <p>
                No automated listings. Every submission is reviewed before
                publication.
              </p>
            </div>
          </div>
          <p className="field-note">
            Submitting your watch does not constitute authentication, valuation
            or an offer to purchase.
          </p>
        </div>
        <SellForm demo={demoEnabled()} />
      </main>
      <Footer />
    </>
  );
}
