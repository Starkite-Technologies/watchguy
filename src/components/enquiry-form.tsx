"use client";
import { useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { BotCheck } from "./bot-check";
export function EnquiryForm({
  watchId,
  watchName,
  initialMessage,
}: {
  watchId?: string;
  watchName?: string;
  initialMessage?: string;
}) {
  const [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [token, setToken] = useState(""),
    [key, setKey] = useState(0);
  if (sent)
    return (
      <div className="form-success">
        <Check size={35} />
        <h2>A conversation has begun.</h2>
        <p>
          Your enquiry has been saved for our team. We’ll be in touch using the
          details you provided.
        </p>
      </div>
    );
  return (
    <form
      className="enquiry-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setWorking(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
          const response = await fetch("/api/enquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              email: form.get("email"),
              phone: form.get("phone"),
              message: form.get("message"),
              consent: form.get("consent") === "on",
              website: form.get("website") || "",
              botToken: token,
              ...(watchId && !watchId.startsWith("demo-") ? { watchId } : {}),
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          setSent(true);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "We could not send your enquiry.",
          );
          setToken("");
          setKey((k) => k + 1);
        } finally {
          setWorking(false);
        }
      }}
    >
      <div className="form-grid">
        <label>
          Your name
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        Phone number (optional)
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
      </label>
      <label>
        Your message
        <textarea
          name="message"
          rows={4}
          required
          maxLength={2000}
          defaultValue={
            initialMessage ??
            (watchName
              ? "Hello, I’m interested in " +
                watchName +
                ". Please confirm availability, condition and the next steps."
              : "")
          }
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="checkbox-label">
        <input name="consent" type="checkbox" required />I consent to being
        contacted about this enquiry and accept the privacy policy.
      </label>
      <BotCheck key={key} action="enquiry" onToken={setToken} />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button disabled={working} className="button button-dark">
        {working ? (
          <>
            Sending <LoaderCircle size={16} className="spin" />
          </>
        ) : (
          <>
            Send enquiry <ArrowUpRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
