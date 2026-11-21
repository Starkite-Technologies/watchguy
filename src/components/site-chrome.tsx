"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  Search,
  MessageCircle,
} from "lucide-react";
import { brand } from "@/config/brand";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
export function Logo({ dark = false }: { dark?: boolean }) {
  const logo = dark ? brand.logoDarkUrl || brand.logoUrl : brand.logoUrl;
  return (
    <Link
      href="/"
      className={"wordmark " + (dark ? "dark" : "")}
      aria-label={brand.name + " home"}
    >
      {logo ? (
        <img className="custom-logo" src={logo} alt={brand.name} />
      ) : (
        <>
          <span className="logo-symbol" aria-hidden="true">
            <i />
            <b />
          </span>
          <span>
            {brand.shortName}
            <small>{brand.descriptor}</small>
          </span>
        </>
      )}
    </Link>
  );
}
export function Header() {
  const path = usePathname(),
    [scrolled, setScrolled] = useState(false),
    [open, setOpen] = useState(false);
  useEffect(() => {
    const update = () =>
      setScrolled(
        window.scrollY > (path === "/" ? window.innerHeight - 90 : 20),
      );
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [path]);
  useEffect(() => setOpen(false), [path]);
  const light = path !== "/" || scrolled;
  return (
    <>
      <header className={"site-header " + (light ? "light" : "")}>
        <Logo dark={light} />
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/collection">Buy watches</Link>
          <Link href="/about">Our story</Link>
          <Link href="/sell">Sell your watch</Link>
        </nav>
        <div className="header-actions">
          <span className="market-label">NAMIBIA / N$</span>
          <Link href="/collection?focus=search" aria-label="Search watches">
            <Search size={18} />
          </Link>
          <Link href="/contact" className="header-contact">
            Let’s talk <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mobile-menu-dialog">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Explore the boutique
          </DialogDescription>
          <Logo dark />
          <nav aria-label="Mobile navigation">
            {[
              ["/", "Home"],
              ["/collection", "Buy watches"],
              ["/about", "Our story"],
              ["/sell", "Sell your watch"],
              ["/contact", "Contact"],
            ].map(([href, label], i) => (
              <DialogClose asChild key={href}>
                <Link href={href}>
                  <span>0{i + 1}</span>
                  {label}
                  <ArrowUpRight size={23} />
                </Link>
              </DialogClose>
            ))}
          </nav>
          <span className="eyebrow">{brand.location}</span>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Footer() {
  const whatsapp = brand.whatsapp.replace(/\D/g, "");
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <div>
          <span className="eyebrow">A PERSONAL CONNECTION</span>
          <h2>
            Good things begin
            <br />
            with a <em>conversation.</em>
          </h2>
        </div>
        <Link
          href={whatsapp ? "https://wa.me/" + whatsapp : "/contact"}
          className="footer-chat"
        >
          {whatsapp ? <MessageCircle size={20} /> : null}
          <span>{whatsapp ? "Chat on WhatsApp" : "Let’s talk time"}</span>
          <ArrowUpRight size={25} />
        </Link>
      </div>
      <div className="footer-main">
        <div>
          <Logo />
          <p>
            {brand.tagline}
            <br />
            {brand.location}
          </p>
          <span className="footer-placeholder">
            BUSINESS CONTACT DETAILS TO BE CONFIRMED
          </span>
        </div>
        <div className="footer-links">
          <span>EXPLORE</span>
          <Link href="/about">About us</Link>
          <Link href="/collection">Shop watches</Link>
          <Link href="/sell">Sell your watch</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-links">
          <span>FOLLOW THE STORY</span>
          {brand.instagram ? (
            <a href={brand.instagram} target="_blank" rel="noopener noreferrer">
              Instagram <ArrowUpRight size={12} />
            </a>
          ) : (
            <span className="placeholder-social">Instagram — coming soon</span>
          )}
          {brand.facebook ? (
            <a href={brand.facebook} target="_blank" rel="noopener noreferrer">
              Facebook <ArrowUpRight size={12} />
            </a>
          ) : (
            <span className="placeholder-social">Facebook — coming soon</span>
          )}
          <p>
            Considered timepieces.
            <br />
            Personal connections.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
        <div>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms & conditions</Link>
        </div>
      </div>
    </footer>
  );
}
export function SectionLabel({
  children,
  index,
}: {
  children: React.ReactNode;
  index?: string;
}) {
  return (
    <div className="section-label">
      <span className="label-line" />
      {children}
      {index && <span className="section-index">{index}</span>}
    </div>
  );
}
export function SellBanner() {
  return (
    <section className="sell-banner section-wrap">
      <div>
        <SectionLabel index="05 / A NEW CHAPTER">PASS IT ON</SectionLabel>
        <h2>
          Your watch.
          <br />
          <em>Our showcase.</em>
        </h2>
        <p>
          Own a timepiece you would like to sell?
          <br />
          Submit your watch for our team to review.
        </p>
        <Link className="button button-dark" href="/sell">
          Submit your watch <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="sell-steps">
        {[
          [
            "01",
            "Tell us its story",
            "Share the details, history and character of your timepiece.",
          ],
          [
            "02",
            "Let us take a closer look",
            "Our team reviews your submission and gets in touch.",
          ],
          [
            "03",
            "Begin the next chapter",
            "Only approved pieces, with confirmed details, join our showcase.",
          ],
        ].map(([n, title, copy]) => (
          <div key={n}>
            <span>{n}</span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
            <ArrowUpRight size={17} />
          </div>
        ))}
      </div>
    </section>
  );
}
