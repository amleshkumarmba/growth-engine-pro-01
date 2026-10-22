import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/registration-form";
import { siteConfig } from "@/lib/site-content";
import { captureAttribution } from "@/lib/attribution";
import { RAZORPAY_PAYMENT_URL, WEBINAR_DATE_LABEL, WEBINAR_PRICE_LABEL } from "@/lib/webinar";
import logo from "@/assets/bscalex-logo.png.asset.json";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Complete Your Registration | BscaleX Marketplace Webinar" },
      { name: "description", content: `Payment done? Complete your registration for the BscaleX marketplace growth webinar on ${WEBINAR_DATE_LABEL} to lock your seat.` },
      { property: "og:title", content: "Complete Your Registration | BscaleX Marketplace Webinar" },
      { property: "og:description", content: "One short form after payment locks your webinar seat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: RegisterPage,
});

function track(event: string, details: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const win = window as Window & { dataLayer?: Array<Record<string, string>> };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...details });
}

function RegisterPage() {
  useEffect(() => {
    captureAttribution();
    track("register_page_view", { page: "register" });
  }, []);

  return (
    <div className="min-h-screen bg-surface-dark text-on-dark">
      <header className="border-b border-on-dark/10">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Link to="/" aria-label="BscaleX home"><img src={logo.url} alt="BscaleX" className="h-12 w-auto object-contain" /></Link>
          <Button variant="hero" size="sm" asChild>
            <a href={RAZORPAY_PAYMENT_URL} target="_blank" rel="noreferrer" onClick={() => track("payment_click", { label: "register_header" })}>Pay {WEBINAR_PRICE_LABEL}</a>
          </Button>
        </div>
      </header>

      <main className="section-shell grid gap-12 py-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Almost there</p>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-[1.05] sm:text-5xl">
            Payment Done?<br /><span className="text-primary">Lock Your Seat.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-on-dark-muted">
            Fill in your details so we can confirm your seat for the live 90-minute marketplace growth webinar on{" "}
            <strong className="text-on-dark">{WEBINAR_DATE_LABEL}</strong> and send you the joining link on email and WhatsApp.
          </p>
          <p className="mt-6 max-w-xl text-sm leading-6 text-on-dark-muted">
            Haven't paid yet?{" "}
            <a href={RAZORPAY_PAYMENT_URL} target="_blank" rel="noreferrer" className="font-bold text-primary underline" onClick={() => track("payment_click", { label: "register_body" })}>
              Pay {WEBINAR_PRICE_LABEL} securely via Razorpay
            </a>{" "}
            first, then come back to this form.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[31rem]">
          <RegistrationForm source="contact" formName="paid_registration" />
        </div>
      </main>

      <footer className="border-t border-on-dark/10 py-8">
        <p className="section-shell text-center text-xs text-on-dark-muted">© {new Date().getFullYear()} {siteConfig.brand}. All rights reserved.</p>
      </footer>
    </div>
  );
}
