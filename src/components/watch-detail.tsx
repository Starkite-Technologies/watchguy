"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  HandCoins,
  Check,
  Minus,
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

/** Gallery, price and buying actions for one watch. */
export function WatchDetail({ watch, demo }: { watch: Watch; demo: boolean }) {
  const [photo, setPhoto] = useState(0),
    [dialog, setDialog] = useState<null | "enquire" | "offer">(null),
    [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const name = [watch.brand, watch.model].join(" ");
  const fullName = [name, watch.reference].filter(Boolean).join(" ");
  const message =
    "Hello, I’m interested in the " +
    fullName +
    ", listed at " +
    money(watch.price) +
    ". Is it still available? " +
    url;
  const whatsapp = brand.whatsapp.replace(/\D/g, "");
  const reserved = watch.availability === "RESERVED";
  const count = watch.images.length;
  const go = (step: number) => setPhoto((photo + step + count) % count);
  return (
    <>
      <div className="lt-detail">
        <div className="lt-gallery">
          <div className="lt-gallery-main">
            {watch.images[photo] && (
              <img
                src={watch.images[photo]}
                alt={`${fullName}, photo ${photo + 1} of ${count}`}
                fetchPriority={photo === 0 ? "high" : "auto"}
              />
            )}
            {count > 1 && (
              <>
                <button
                  className="lt-gallery-nav prev"
                  aria-label="Previous photo"
                  onClick={() => go(-1)}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="lt-gallery-nav next"
                  aria-label="Next photo"
                  onClick={() => go(1)}
                >
                  <ChevronRight size={20} />
                </button>
                <span className="lt-gallery-count">
                  {photo + 1} / {count}
                </span>
              </>
            )}
          </div>
          {count > 1 && (
            <div className="lt-thumbs">
              {watch.images.map((image, i) => (
                <button
                  key={image}
                  className={photo === i ? "active" : ""}
                  onClick={() => setPhoto(i)}
                  aria-label={"Show photo " + (i + 1)}
                  aria-pressed={photo === i}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          {demo && (
            <p className="lt-demo-note">
              Illustrative concept photo. This demo listing is not a real watch
              for sale.
            </p>
          )}
        </div>

        <div className="lt-summary">
          <p className="lt-card-brand">{watch.brand}</p>
          <h1>{watch.model}</h1>
          {watch.reference && (
            <p className="lt-summary-ref">Reference {watch.reference}</p>
          )}
          <ul className="lt-facts" aria-label="Key details">
            <li>{watch.box ? <Check size={15} /> : <Minus size={15} />} Box</li>
            <li>
              {watch.papers ? <Check size={15} /> : <Minus size={15} />} Papers
            </li>
            {watch.year && <li>Year {watch.year}</li>}
            <li>Condition: {watch.condition}</li>
          </ul>
          <p className="lt-summary-price">
            {money(watch.price)}
            {reserved && (
              <span className="lt-badge lt-badge-reserved">Reserved</span>
            )}
          </p>
          <p className="lt-summary-seller">
            {watch.sellerType === "STORE"
              ? `From ${brand.name}'s own collection`
              : "Listed for a private seller, reviewed by our team"}
          </p>
          <div className="lt-actions">
            {whatsapp ? (
              <a
                className="lt-button"
                href={
                  "https://wa.me/" +
                  whatsapp +
                  "?text=" +
                  encodeURIComponent(message)
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={17} aria-hidden="true" /> Enquire on
                WhatsApp
              </a>
            ) : (
              <button
                className="lt-button"
                onClick={() => setDialog("enquire")}
              >
                <Mail size={17} aria-hidden="true" /> Enquire about this watch
              </button>
            )}
            {!reserved && (
              <button
                className="lt-button lt-button-outline"
                onClick={() => setDialog("offer")}
              >
                <HandCoins size={17} aria-hidden="true" /> Make an offer
              </button>
            )}
            {whatsapp && (
              <button
                className="lt-button lt-button-ghost"
                onClick={() => setDialog("enquire")}
              >
                <Mail size={17} aria-hidden="true" /> Email us instead
              </button>
            )}
          </div>
          <p className="lt-reassure">
            Viewings in {brand.location.split(",")[0]} by appointment. Price,
            availability and condition are confirmed with you before any
            payment.
          </p>
        </div>
      </div>

      <div className="lt-sticky-bar" aria-hidden={dialog !== null}>
        <div>
          <strong>{name}</strong>
          <span>{money(watch.price)}</span>
        </div>
        <button className="lt-button" onClick={() => setDialog("enquire")}>
          Enquire
        </button>
      </div>

      <Dialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <DialogContent>
          <DialogTitle className="dialog-heading">
            {dialog === "offer" ? "Make an offer" : "Ask about this watch"}
          </DialogTitle>
          <DialogDescription>
            {fullName} — {money(watch.price)}
          </DialogDescription>
          <EnquiryForm
            key={dialog || "closed"}
            watchId={watch.id}
            watchName={fullName}
            initialMessage={
              dialog === "offer"
                ? `Hello, I would like to offer N$ [your amount] for the ${fullName} (listed at ${money(watch.price)}).`
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
