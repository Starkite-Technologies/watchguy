"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, ArrowRight, LoaderCircle } from "lucide-react";
import { Logo } from "./site-chrome";
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter(),
    [working, setWorking] = useState(false),
    [error, setError] = useState("");
  return (
    <main className="login-page">
      <Logo dark />
      <form
        className="login-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setWorking(true);
          const f = new FormData(e.currentTarget);
          try {
            const response = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: f.get("email"),
                password: f.get("password"),
              }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            router.push("/admin");
            router.refresh();
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Sign-in failed.",
            );
          } finally {
            setWorking(false);
          }
        }}
      >
        <span className="login-lock">
          <LockKeyhole size={20} />
        </span>
        <span className="eyebrow">BOUTIQUE ADMINISTRATION</span>
        <h1>Welcome back.</h1>
        <p>Sign in to look after your watch house.</p>
        {!configured && (
          <div className="setup-notice">
            Admin sign-in is unavailable until authentication and the database
            are configured. No public admin registration is offered.
          </div>
        )}
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            disabled={!configured}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={!configured}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button button-dark full"
          disabled={working || !configured}
        >
          {working ? (
            <>
              Signing in <LoaderCircle size={16} className="spin" />
            </>
          ) : (
            <>
              Sign in <ArrowRight size={16} />
            </>
          )}
        </button>
        <Link className="login-back" href="/">
          ← Back to the boutique
        </Link>
      </form>
      <span className="login-footer">PRIVATE ACCESS. CONSIDERED CONTROL.</span>
    </main>
  );
}
