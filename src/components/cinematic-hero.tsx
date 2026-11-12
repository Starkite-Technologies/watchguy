"use client";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { brand } from "@/config/brand";
export function CinematicHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const ref = useRef<HTMLElement>(null),
    reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 70]);
  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero-image" style={{ y: reduced ? 0 : y }}>
        <img
          src={brand.heroImage}
          alt="Original unbranded steel chronograph design concept"
          fetchPriority="high"
        />
      </motion.div>
      <div className="hero-copy">
        <span className="hero-kicker">
          <i /> THE ART OF EXCEPTIONAL TIME
        </span>
        <h1>
          {title === "TIME IS EVERYTHING." ? (
            <>
              TIME IS
              <br />
              EVERYTHING.
            </>
          ) : (
            title
          )}
        </h1>
        <p>{subtitle}</p>
        <div className="hero-buttons">
          <Link href="/collection" className="button button-ivory">
            Explore collection <ArrowUpRight size={18} />
          </Link>
          <Link href="/sell" className="hero-secondary">
            Sell your watch <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="hero-bottom">
        <button
          onClick={() =>
            document
              .querySelector("#featured")
              ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
          }
        >
          <span className="scroll-icon">
            <ArrowDown size={15} />
          </span>{" "}
          A DIFFERENT PERSPECTIVE ON TIME
        </button>
        <span>01 ? THE {brand.shortName.toUpperCase()} EDIT</span>
        <div className="hero-product-note">
          AN ORIGINAL DESIGN STUDY<span>STEEL / CHRONOGRAPH / CONCEPT</span>
        </div>
      </div>
    </section>
  );
}
