"use client";
import { useEffect, useRef } from "react";
type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export function BotCheck({
  action,
  onToken,
}: {
  action: string;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    callback = useRef(onToken);
  callback.current = onToken;
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!key) return;
    let widget: string | undefined,
      disposed = false;
    const mount = () => {
      if (!disposed && ref.current && window.turnstile)
        widget = window.turnstile.render(ref.current, {
          sitekey: key,
          action,
          theme: "light",
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => callback.current(""),
        });
    };
    let script = document.querySelector<HTMLScriptElement>("#turnstile-script");
    if (window.turnstile) mount();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = "turnstile-script";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      disposed = true;
      script?.removeEventListener("load", mount);
      if (widget) window.turnstile?.remove(widget);
    };
  }, [action]);
  return <div ref={ref} className="bot-check" />;
}
