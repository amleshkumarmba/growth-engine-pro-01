import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-content";
import logo from "@/assets/bscalex-logo.png.asset.json";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "You're Registered | BscaleX Free Marketplace Webinar" },
      { name: "description", content: "Your free seat for the BscaleX marketplace growth webinar on 27th September 2026 is confirmed. Join the WhatsApp community to get the joining link." },
      { property: "og:title", content: "You're Registered | BscaleX Free Marketplace Webinar" },
      { property: "og:description", content: "Seat confirmed. Join the WhatsApp community to receive the joining link and reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/thank-you" }],
  }),
  component: ThankYouPage,
});

const WEBINAR_DATE = new Date("2026-09-27T23:59:59+05:30");
const WEBINAR_DATE_LABEL = "27th September 2026";
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
      <div key={String(label)} className="min-w-14 rounded-lg border border-on-dark/15 bg-surface-dark-raised px-2 py-2 text-center">
        <strong className="block font-display text-xl text-on-dark">{String(value).padStart(2, "0")}</strong>
        <span className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-on-dark-muted">{label}</span>
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
        <Link to="/" aria-label="BscaleX home"><img src={logo.url} alt="BscaleX" className="h-12 w-auto object-contain" /></Link>
        <div className="hidden sm:block"><Countdown /></div>
        <Button variant="hero" size="sm" asChild>
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { label: "header" })}>Join Community</a>
        </Button>
      </div>
    </header>

    <main className="section-shell py-16 text-center lg:py-24">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-primary text-primary"><Check className="h-8 w-8" /></span>
      <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary">Free seat confirmed</p>
      <h1 className="mt-6 font-display text-4xl font-semibold uppercase leading-[1.05] sm:text-5xl lg:text-6xl">
        You're In.<br /><span className="text-primary">One Step Left.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-on-dark-muted">
        Your seat for the free 90-minute marketplace growth webinar on{" "}
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 font-bold text-primary"><CalendarDays className="h-4 w-4" />{WEBINAR_DATE_LABEL}</span>{" "}
        is booked. The joining link goes out inside our WhatsApp community — join it now so you don't miss it.
      </p>

      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border-2 border-primary/60 bg-surface-dark-raised p-7 sm:p-10">
        <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary"><Users className="h-4 w-4" />Attendees-only group</p>
        <h2 className="mt-4 font-display text-2xl font-semibold uppercase sm:text-3xl">Join the WhatsApp Community Now</h2>
        <p className="mt-3 text-sm text-on-dark-muted">Joining link, reminders and Q&amp;A — all shared here first.</p>
        <Button variant="hero" size="xl" className="mt-7 w-full sm:w-auto" asChild>
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { label: "thank_you_primary" })}>
            <MessageCircle /> Join the Free WhatsApp Community
          </a>
        </Button>
        <p className="mt-4 text-xs text-on-dark-muted">Takes 5 seconds · No spam · Leave any time</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
        {[
          ["Save the date", `The live session is on ${WEBINAR_DATE_LABEL}. Add it to your calendar now.`],
          ["Language", "The full 90-minute session is in English only."],
          ["What to bring", "Your product list and the platforms you want to sell on."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-xl border border-on-dark/15 bg-surface-dark-raised p-6">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-on-dark-muted">{copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button variant="quiet" size="lg" className="border-on-dark/25 text-on-dark hover:border-primary hover:text-primary" asChild>
          <Link to="/">Back to the website <ArrowRight /></Link>
        </Button>
      </div>
    </main>

    <footer className="border-t border-on-dark/10 py-8">
      <p className="section-shell text-center text-xs text-on-dark-muted">© {new Date().getFullYear()} {siteConfig.brand}. All rights reserved.</p>
    </footer>
  </div>;
}
