import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, CreditCard, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-content";
import { captureAttribution } from "@/lib/attribution";
import { WEBINAR_DATE, WEBINAR_DATE_LABEL, WEBINAR_PAYMENT_URL, WEBINAR_SEAT_PRICE_LABEL } from "@/lib/webinar";
import logo from "@/assets/bscalex-logo.png.asset.json";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Complete Your Seat Payment | BscaleX Marketplace Webinar" },
      { name: "description", content: `Pay ${WEBINAR_SEAT_PRICE_LABEL} to confirm your seat for the BscaleX marketplace growth webinar on ${WEBINAR_DATE_LABEL}. Join the WhatsApp community for updates.` },
      { property: "og:title", content: "Complete Your Seat Payment | BscaleX Marketplace Webinar" },
      { property: "og:description", content: `Pay ${WEBINAR_SEAT_PRICE_LABEL} to confirm your seat, then join the WhatsApp community for the joining link and reminders.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/thank-you" }],
  }),
  component: ThankYouPage,
});

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/FkuBkYpKFZO2MmzMayll8E";

function track(event: string, details: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const win = window as Window & { dataLayer?: Array<Record<string, string>> };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...details });
}

function Countdown() {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const difference = Math.max(0, WEBINAR_DATE.getTime() - Date.now());
      setRemaining({
        days: Math.floor(difference / 86_400_000),
        hours: Math.floor((difference % 86_400_000) / 3_600_000),
        minutes: Math.floor((difference % 3_600_000) / 60_000),
        seconds: Math.floor((difference % 60_000) / 1000),
      });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="flex gap-2">
    {[[remaining.days, "Days"], [remaining.hours, "Hrs"], [remaining.minutes, "Min"], [remaining.seconds, "Sec"]].map(([value, label]) => (
      <div key={String(label)} className="min-w-16 rounded-lg border border-on-dark/15 bg-surface-dark-raised px-3 py-2.5 text-center">
        <strong className="block font-display text-2xl text-on-dark">{String(value).padStart(2, "0")}</strong>
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-on-dark-muted">{label}</span>
      </div>
    ))}
  </div>;
}

const FIRED_EVENTS_KEY = "bscalex_fired_lead_events";

function ThankYouPage() {
  const [leadRef, setLeadRef] = useState("");

  useEffect(() => {
    captureAttribution();

    let lead: { leadRef?: string; eventId?: string } = {};
    try {
      lead = JSON.parse(window.sessionStorage.getItem("bscalex_last_lead") ?? "{}");
    } catch {
      lead = {};
    }
    setLeadRef(lead.leadRef ?? "");

    // Fire the Meta Lead event once per real registration — refresh, back button
    // and re-opening the page never send a second event.
    let fired: string[] = [];
    try {
      fired = JSON.parse(window.localStorage.getItem(FIRED_EVENTS_KEY) ?? "[]");
    } catch {
      fired = [];
    }
    const eventId = lead.eventId;
    if (!eventId || fired.includes(eventId)) return;

    track("registration_complete", { page: "thank_you", lead_id: lead.leadRef ?? "", event_id: eventId });
    const win = window as Window & { fbq?: (...args: unknown[]) => void };
    win.fbq?.(
      "track",
      "Lead",
      {
        content_name: "BScalex Webinar Registration",
        content_category: "Webinar",
        value: 0,
        currency: "INR",
      },
      { eventID: eventId },
    );

    try {
      window.localStorage.setItem(FIRED_EVENTS_KEY, JSON.stringify([...fired, eventId].slice(-50)));
    } catch {
      /* storage unavailable — the event simply is not de-duplicated on this device */
    }
  }, []);

  return <div className="min-h-screen bg-surface-dark text-on-dark">
    <header className="border-b border-on-dark/10">
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <Link to="/" aria-label="BscaleX home"><img src={logo.url} alt="BscaleX" className="h-14 w-auto object-contain" /></Link>
        <div className="hidden sm:block"><Countdown /></div>
        <Button variant="hero" size="lg" className="text-sm" asChild>
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { label: "header" })}>Join Community</a>
        </Button>
      </div>
    </header>

    <main className="section-shell py-16 text-center lg:py-24">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-primary text-primary"><Check className="h-10 w-10" /></span>
      <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-primary">Payment required to confirm your seat</p>
      <h1 className="mt-6 font-display text-5xl font-semibold uppercase leading-[1.05] sm:text-6xl lg:text-7xl">
        Thank You.<br /><span className="text-primary">Confirm Your Seat.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-on-dark-muted">
        Complete your seat reservation for the 90-minute marketplace growth webinar on{" "}
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1 text-base font-bold text-primary"><CalendarDays className="h-5 w-5" />{WEBINAR_DATE_LABEL}</span>{" "}
        by paying {WEBINAR_SEAT_PRICE_LABEL} only. The joining link and updates are shared in our WhatsApp community — join so you don't miss them.
      </p>
      {leadRef && <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-on-dark-muted">Registration ID: <span className="text-primary">{leadRef}</span></p>}

      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border-2 border-primary/60 bg-surface-dark-raised p-7 sm:p-10">
        <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary"><CreditCard className="h-4 w-4" />Seat confirmation</p>
        <h2 className="mt-4 font-display text-2xl font-semibold uppercase sm:text-3xl">Pay {WEBINAR_SEAT_PRICE_LABEL} to Confirm Your Seat</h2>
        <p className="mt-3 text-sm text-on-dark-muted">Complete your payment, then join the community for the joining link, reminders and Q&amp;A.</p>
        <div className="mt-7 flex flex-col gap-4">
        <Button variant="hero" size="xl" className="w-full whitespace-normal" asChild>
          <a href={WEBINAR_PAYMENT_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("payment_link_click", { label: "thank_you", lead_id: leadRef })}>
            <CreditCard /> Pay Now — {WEBINAR_SEAT_PRICE_LABEL} Only
          </a>
        </Button>
        <Button variant="quiet" size="xl" className="w-full whitespace-normal border-on-dark/25 text-on-dark hover:border-primary hover:text-primary" asChild>
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { label: "thank_you_primary" })}>
            <MessageCircle /> Join the WhatsApp Community
          </a>
        </Button>
        </div>
        <p className="mt-4 text-xs text-on-dark-muted">Takes 5 seconds · No spam · Leave any time</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
        {[
          ["Save the date", `The live session is on ${WEBINAR_DATE_LABEL}. Add it to your calendar now.`],
          ["Language", "The full 90-minute session is in English only."],
          ["What to bring", "Your product list and the platforms you want to sell on."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-xl border border-on-dark/15 bg-surface-dark-raised p-7">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-base leading-7 text-on-dark-muted">{copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button variant="quiet" size="xl" className="border-on-dark/25 text-on-dark hover:border-primary hover:text-primary text-base" asChild>
          <Link to="/">Back to the website <ArrowRight /></Link>
        </Button>
      </div>
    </main>

    <footer className="border-t border-on-dark/10 py-8">
      <p className="section-shell text-center text-sm text-on-dark-muted">© {new Date().getFullYear()} {siteConfig.brand}. All rights reserved.</p>
    </footer>
  </div>;
}
