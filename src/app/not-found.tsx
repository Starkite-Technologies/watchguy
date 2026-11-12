import Link from "next/link";
import { Header, Footer } from "@/components/site-chrome";
export default function Page() {
  return (
    <>
      <Header />
      <main className="page-main empty-state">
        <span className="eyebrow">A MOMENT OUT OF TIME</span>
        <h1>This page is unavailable.</h1>
        <p>The timepiece may have moved on to its next chapter.</p>
        <Link className="button button-dark" href="/collection">
          Explore the collection ?
        </Link>
      </main>
      <Footer />
    </>
  );
}
