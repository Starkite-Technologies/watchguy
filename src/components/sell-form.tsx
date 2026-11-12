"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Upload,
  X,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { money } from "@/lib/demo";
import { BotCheck } from "./bot-check";
type Values = {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  brand: string;
  model: string;
  reference: string;
  year: string;
  condition: string;
  price: string;
  description: string;
  defects: string;
  box: boolean;
  papers: boolean;
  consent: boolean;
  website: string;
};
const initial: Values = {
  name: "",
  email: "",
  phone: "",
  preferredContactMethod: "Email",
  brand: "",
  model: "",
  reference: "",
  year: "",
  condition: "",
  price: "",
  description: "",
  defects: "",
  box: false,
  papers: false,
  consent: false,
  website: "",
};
const steps = [
  "Your details",
  "The timepiece",
  "Photographs",
  "Review & submit",
];
export function SellForm({ demo = false }: { demo?: boolean }) {
  const [step, setStep] = useState(0),
    [values, setValues] = useState(initial),
    [files, setFiles] = useState<File[]>([]),
    [previews, setPreviews] = useState<string[]>([]),
    [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(0),
    [reference, setReference] = useState(""),
    [token, setToken] = useState(""),
    [botKey, setBotKey] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);
  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  const field = (
    name: keyof Values,
    label: string,
    opts: { required?: boolean; type?: string; placeholder?: string } = {},
  ) => (
    <label>
      {label}
      <input
        name={name}
        type={opts.type || "text"}
        value={String(values[name])}
        onChange={(e) => set(name, e.target.value as never)}
        required={opts.required ?? true}
        maxLength={name === "email" ? 200 : 120}
        placeholder={opts.placeholder}
        min={
          opts.type === "number" ? (name === "year" ? 1900 : 0.01) : undefined
        }
        max={
          opts.type === "number"
            ? name === "year"
              ? new Date().getFullYear() + 1
              : 99999999
            : undefined
        }
        step={name === "price" ? ".01" : undefined}
        autoComplete={
          name === "name"
            ? "name"
            : name === "email"
              ? "email"
              : name === "phone"
                ? "tel"
                : undefined
        }
      />
    </label>
  );
  function next(value: number) {
    setStep(value);
    setError("");
    requestAnimationFrame(() => heading.current?.focus());
  }
  function addFiles(incoming: File[]) {
    const selected = [...files, ...incoming];
    if (selected.length > 6) {
      setError("Please choose no more than six photographs.");
      return;
    }
    if (
      selected.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 4 * 1024 * 1024,
      )
    ) {
      setError("Use JPG, PNG or WebP files under 4 MB each.");
      return;
    }
    setFiles(selected);
    setError("");
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (step === 2 && files.length < 3) {
      setError("Please add at least three clear photographs.");
      return;
    }
    if (step < 3) {
      next(step + 1);
      return;
    }
    setWorking(true);
    setProgress(0);
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) =>
      body.append(key, String(value)),
    );
    body.append("botToken", token);
    files.forEach((file) => body.append("photos", file));
    try {
      const result = await new Promise<{ id: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/submissions");
        xhr.timeout = 120000;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(data);
            else
              reject(
                new Error(data.error || "The submission could not be saved."),
              );
          } catch (error) {
            reject(error);
          }
        };
        xhr.onerror = () =>
          reject(
            new Error("The connection was interrupted. Please try again."),
          );
        xhr.ontimeout = () =>
          reject(new Error("The upload timed out. Please try again."));
        xhr.send(body);
      });
      setReference(result.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The submission could not be sent.",
      );
      setToken("");
      setBotKey((k) => k + 1);
    } finally {
      setWorking(false);
    }
  }
  if (reference)
    return (
      <div className="submission-success">
        <span className="success-circle">
          <Check size={30} />
        </span>
        <div className="eyebrow">PRIVATELY RECEIVED</div>
        <h2>
          A new chapter
          <br />
          <em>is in motion.</em>
        </h2>
        <p>
          Your watch is securely saved and pending review. Our team will contact
          you using the details you shared.
        </p>
        <code>YOUR REFERENCE: {reference.slice(0, 8).toUpperCase()}</code>
        <p className="field-note">
          An acknowledgement email will follow when email delivery is
          configured.
        </p>
        <Link href="/collection" className="button button-dark">
          Explore the collection <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  return (
    <div className="seller-form-shell">
      <div className="form-progress">
        {steps.map((name, i) => (
          <button
            key={name}
            onClick={() => next(i)}
            disabled={i > step || working}
            className={i === step ? "active" : i < step ? "complete" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            <span>
              {i < step ? <Check size={12} /> : String(i + 1).padStart(2, "0")}
            </span>
            <small>{name}</small>
          </button>
        ))}
      </div>
      <form className="sell-form" onSubmit={submit}>
        <div className="step-title">
          <span className="eyebrow">STEP 0{step + 1} / 04</span>
          <h2 ref={heading} tabIndex={-1}>
            {steps[step]}
          </h2>
          <p>
            {
              [
                "A personal connection starts here.",
                "Tell us what makes your timepiece special.",
                "A closer look makes all the difference.",
                "Take a moment to confirm the details.",
              ][step]
            }
          </p>
        </div>
        {demo && (
          <p className="preview-note">
            Design preview. Please use sample information; submissions are not
            connected.
          </p>
        )}
        {step === 0 && (
          <>
            {field("name", "Full name")}
            {field("email", "Email address", { type: "email" })}
            {field("phone", "Phone number", { type: "tel" })}
            <label>
              Preferred contact method
              <select
                value={values.preferredContactMethod}
                onChange={(e) => set("preferredContactMethod", e.target.value)}
              >
                {["Email", "Phone", "WhatsApp"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="form-privacy">
              <LockKeyhole size={18} />
              <p>
                Your contact information is private. It will never appear on a
                public listing.
              </p>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="form-grid">
              {field("brand", "Watch brand", {
                placeholder: "e.g. the watchmaker?s name",
              })}
              {field("model", "Model")}
              {field("reference", "Reference number (optional)", {
                required: false,
              })}
              {field("year", "Year (optional)", {
                required: false,
                type: "number",
              })}
            </div>
            <div className="form-grid">
              <label>
                Condition
                <select
                  aria-label="Watch condition"
                  required
                  value={values.condition}
                  onChange={(e) => set("condition", e.target.value)}
                >
                  <option value="">Select condition</option>
                  {["Unworn", "Excellent", "Very good", "Good", "Fair"].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </label>
              {field("price", "Asking price (N$)", { type: "number" })}
            </div>
            <label>
              Description
              <textarea
                required
                maxLength={3000}
                rows={4}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="History, servicing and anything else we should know."
              />
            </label>
            <label>
              Known defects or damage
              <textarea
                maxLength={1500}
                rows={2}
                value={values.defects}
                onChange={(e) => set("defects", e.target.value)}
                placeholder="Please describe wear or damage, or state ?none known?."
              />
            </label>
            <div className="provenance-options">
              {(
                [
                  ["box", "Original box included"],
                  ["papers", "Original papers included"],
                ] as const
              ).map(([key, label]) => (
                <label className="checkbox-label" key={key}>
                  <input
                    type="checkbox"
                    checked={values[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="photo-upload">
              <Upload size={27} />
              <strong>Add your photographs</strong>
              <span>Front, back, side, clasp, and close-up details</span>
              <small>3?6 JPG, PNG or WebP files ? max 4 MB each</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                aria-label="Upload watch photographs"
                onChange={(e) => {
                  addFiles([...(e.target.files || [])]);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="field-note">
              Use clear, well-lit photographs. Do not include personal
              documents, addresses or payment details.
            </p>
            <div className="photo-preview-grid">
              {previews.map((url, i) => (
                <div key={url}>
                  <img src={url} alt={"Watch photograph " + (i + 1)} />
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    aria-label={"Remove photograph " + (i + 1)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="review-summary">
              <span className="eyebrow">YOUR TIMEPIECE</span>
              <h3>
                {values.brand} {values.model}
              </h3>
              <dl>
                {[
                  ["Seller", values.name],
                  ["Email", values.email],
                  ["Phone", values.phone],
                  ["Contact preference", values.preferredContactMethod],
                  ["Reference", values.reference || "Not supplied"],
                  ["Year", values.year || "Not supplied"],
                  ["Condition", values.condition],
                  ["Asking price", money(Number(values.price))],
                  [
                    "Included",
                    [values.box && "Box", values.papers && "Papers"]
                      .filter(Boolean)
                      .join(", ") || "Watch only",
                  ],
                  ["Photographs", String(files.length)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p>{values.description}</p>
              <p>
                <strong>Known defects:</strong>{" "}
                {values.defects || "Not supplied"}
              </p>
            </div>
            <label className="checkbox-label consent">
              <input
                type="checkbox"
                required
                checked={values.consent}
                onChange={(e) => set("consent", e.target.checked)}
              />
              <span>
                I have the right to sell this watch and share these photographs,
                and consent to the private submission and review process. I
                accept the{" "}
                <Link href="/terms" target="_blank">
                  submission terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            <p className="field-note">
              Submission is not authentication, valuation, acceptance for
              listing or an offer to buy. Your watch remains private until
              explicitly approved.
            </p>
            <BotCheck key={botKey} action="submission" onToken={setToken} />
          </>
        )}
        <label className="honeypot" aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
        {working && (
          <div className="upload-progress" role="status">
            <div>
              <span>
                {progress < 100
                  ? "Uploading photographs"
                  : "Saving your private submission"}
              </span>
              <span>{progress}%</span>
            </div>
            <progress max={100} value={progress} />
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-navigation">
          {step > 0 ? (
            <button
              className="back-step"
              type="button"
              disabled={working}
              onClick={() => next(step - 1)}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          ) : (
            <span className="field-note">No account required.</span>
          )}
          <button
            type="submit"
            className="button button-dark"
            disabled={working}
          >
            {working ? (
              <>
                Please wait <LoaderCircle size={16} className="spin" />
              </>
            ) : step < 3 ? (
              <>
                Continue <ArrowRight size={16} />
              </>
            ) : (
              <>
                Submit for review <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
