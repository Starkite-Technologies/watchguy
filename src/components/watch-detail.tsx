"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";
import type { Watch } from "@/lib/types";
import { money } from "@/lib/demo";
import { brand } from "@/config/brand";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { EnquiryForm } from "./enquiry-form";
export function WatchDetail({ watch, demo }: { watch: Watch; demo: boolean }) {
  const [photo, setPhoto] = useState(0),
    [open, setOpen] = useState(false),
    [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const message =
    "Hello, I’m interested in the " +
    watch.brand +
    " " +
    watch.model +
    (watch.reference ? " (reference " + watch.reference + ")" : "") +
    ", listed at " +
    money(watch.price) +
    ". Please confirm availability and condition. " +
    url;
  const whatsapp = brand.whatsapp.replace(/\D/g, "");
  return (
    <main className="detail-main section-wrap">
      <Link className="back-link" href="/collection">
        <ArrowLeft size={14} />
        Back to the collection
      </Link>
      <div className="detail-layout">
        <div>
          <div
            className={
              "detail-photo " +
              (watch.images[photo]?.includes("hero") ? "dark-image" : "")
            }
          >
            <img
              src={watch.images[photo]}
              alt={
                watch.brand + " " + watch.model + " — photograph " + (photo + 1)
              }
            />
            <span className="watch-badge">
              {demo ? "DEMO PIECE" : watch.condition}
            </span>
            {watch.images.length > 1 && (
              <div className="gallery-controls">
                <button
                  aria-label="Previous photograph"
                  onClick={() =>
                    setPhoto(
                      (photo - 1 + watch.images.length) % watch.images.length,
                    )
                  }
                >
                  <ChevronLeft size={20} />
                </button>
                <span>
                  {photo + 1} / {watch.images.length}
                </span>
                <button
                  aria-label="Next photograph"
                  onClick={() => setPhoto((photo + 1) % watch.images.length)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="photo-thumbnails">
            {watch.images.map((image, i) => (
              <button
                key={image}
                className={photo === i ? "active" : ""}
                onClick={() => setPhoto(i)}
                aria-label={"View photograph " + (i + 1)}
                aria-pressed={photo === i}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
          {demo && (
            <p className="field-note">
              Original unbranded concept imagery. This development record does
              not represent an actual watch for sale.
            </p>
          )}
        </div>
        <div className="detail-copy">
          <div className="eyebrow">
            {watch.brand} /{" "}
            {watch.sellerType === "STORE"
              ? "COMPANY INVENTORY"
              : "APPROVED THIRD-PARTY LISTING"}
          </div>
          <h1>{watch.model}</h1>
          {watch.reference && (
            <span className="reference">REFERENCE {watch.reference}</span>
          )}
          <div className="detail-price">
            {money(watch.price)}
            <span
              className={
                "availability " +
                (watch.availability === "RESERVED" ? "reserved" : "")
              }
            >
              <i />
              {watch.availability === "RESERVED" ? "Reserved" : "Available"}
            </span>
          </div>
          <p>{watch.description}</p>
          <dl className="detail-specs">
            {[
              ["Condition", watch.condition],
              ["Year", watch.year || "On request"],
              ["Case diameter", watch.diameter || "On request"],
              ["Movement", watch.movement || "On request"],
              ["Original box", watch.box ? "Included" : "Not included"],
              ["Original papers", watch.papers ? "Included" : "Not included"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="condition-note">
            <strong>Condition notes</strong>
            {watch.defects ||
              "Please enquire for a detailed condition assessment."}
          </p>
          {whatsapp ? (
            <a
              href={
                "https://wa.me/" +
                whatsapp +
                "?text=" +
                encodeURIComponent(message)
              }
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark full"
            >
              Enquire on WhatsApp <MessageCircle size={17} />
            </a>
          ) : (
            <button
              className="button button-dark full"
              onClick={() => setOpen(true)}
            >
              Enquire about this watch <ArrowUpRight size={17} />
            </button>
          )}
          <button
            className="button button-outline full"
            onClick={() => setOpen(true)}
          >
            Contact about this watch <ArrowUpRight size={17} />
          </button>
          <p className="detail-disclaimer">
            <LockKeyhole size={15} />
            Availability, condition and purchase arrangements are confirmed in
            conversation with the boutique.
          </p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="dialog-heading">A closer look.</DialogTitle>
          <DialogDescription>
            {watch.brand} {watch.model} — {money(watch.price)}
          </DialogDescription>
          <EnquiryForm
            watchId={watch.id}
            watchName={
              watch.brand +
              " " +
              watch.model +
              (watch.reference ? " — " + watch.reference : "")
            }
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
