"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, MessageCircle } from "lucide-react";
import { BRAND, getWhatsAppGeneralLink } from "@/config/brand";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Collection", href: "/collection" },
    { label: "Sell Your Watch", href: "/sell" },
    { label: "Boutique & Story", href: "/about" },
    { label: "Concierge", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#08090B]/85 backdrop-blur-md border-b border-white/[0.08] py-4 shadow-2xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="group flex items-center gap-3 text-decoration-none">
          <div className="w-8 h-8 rounded-full border border-[#B79B6C]/50 flex items-center justify-center bg-[#14171A] group-hover:border-[#B79B6C] transition-colors">
            <span className="text-[#B79B6C] font-editorial text-xs font-semibold">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-lg md:text-xl tracking-wider text-white font-medium group-hover:text-[#F4F1EA] transition-colors">
              {BRAND.name}
            </span>
            <span className="text-[9px] tracking-[0.25em] text-[#B79B6C] uppercase font-sans-ui -mt-1">
              Namibia
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "text-[#B79B6C] font-medium"
                    : "text-[#A8A59E] hover:text-[#F4F1EA]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={getWhatsAppGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B79B6C] hover:text-[#D4AF37] px-4 py-2 rounded-full border border-[#B79B6C]/30 hover:border-[#B79B6C] transition-all bg-[#14171A]/40"
          >
            <MessageCircle size={14} />
            <span>WhatsApp Concierge</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-2 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[70px] bg-[#08090B]/98 backdrop-blur-xl border-b border-white/[0.08] px-8 py-10 flex flex-col gap-6 shadow-2xl transition-all">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-[0.2em] text-[#F4F1EA] hover:text-[#B79B6C] py-2 border-b border-white/[0.04]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={getWhatsAppGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-center mt-4 w-full"
          >
            <MessageCircle size={16} />
            <span>WhatsApp Concierge</span>
          </a>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#050607] border-t border-white/[0.08] pt-20 pb-12 text-[#A8A59E]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-editorial text-2xl tracking-wider text-white">
                {BRAND.name}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#A8A59E] mb-6">
              {BRAND.description}
            </p>
            <div className="text-xs tracking-wider uppercase text-[#B79B6C]">
              {BRAND.location}
            </div>
          </div>

          {/* Col 2: Horological Collection */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-medium mb-5">
              Curation
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/collection" className="hover:text-[#B79B6C] transition-colors">
                  All Timepieces
                </Link>
              </li>
              <li>
                <Link href="/collection?brand=Rolex" className="hover:text-[#B79B6C] transition-colors">
                  Rolex
                </Link>
              </li>
              <li>
                <Link href="/collection?brand=Omega" className="hover:text-[#B79B6C] transition-colors">
                  Omega
                </Link>
              </li>
              <li>
                <Link href="/collection?brand=Patek+Philippe" className="hover:text-[#B79B6C] transition-colors">
                  Patek Philippe
                </Link>
              </li>
              <li>
                <Link href="/collection?brand=Tudor" className="hover:text-[#B79B6C] transition-colors">
                  Tudor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Client Services */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-medium mb-5">
              Private Services
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/sell" className="hover:text-[#B79B6C] transition-colors">
                  Sell Your Timepiece
                </Link>
              </li>
              <li>
                <a
                  href={getWhatsAppGeneralLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B79B6C] transition-colors flex items-center gap-1.5"
                >
                  <span>WhatsApp Concierge</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#B79B6C] transition-colors">
                  About Our Boutique
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#B79B6C] transition-colors">
                  Visit Boutique / Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Boutique Address & Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white font-medium mb-5">
              Concierge Contact
            </h4>
            <div className="space-y-3 text-sm leading-relaxed">
              <p className="text-[#F4F1EA]">{BRAND.address}</p>
              <p>{BRAND.location}</p>
              <p className="text-[#B79B6C]">{BRAND.contactPhone}</p>
              <p>{BRAND.contactEmail}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Namibian Luxury Horology.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/admin/login" className="text-white/20 hover:text-white/60 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-[#B79B6C]" />
      <span className="text-[11px] uppercase tracking-[0.28em] text-[#B79B6C] font-medium font-sans-ui">
        {children}
      </span>
    </div>
  );
}
