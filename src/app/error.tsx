"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-main section-wrap empty-state">
      <span className="eyebrow">PLEASE TRY AGAIN</span>
      <h1>A momentary interruption.</h1>
      <p>
        We could not load this page. Your request has not been marked as
        complete.
      </p>
      <button className="button button-dark" onClick={reset}>
        Try again ?
      </button>
    </main>
  );
}
