import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitLead } from "@/lib/leads.functions";
import { useSeatsLeft } from "@/lib/seats";
import { getAttributionPayload } from "@/lib/attribution";
import {
  RAZORPAY_PAYMENT_URL,
  WEBINAR_DATE,
  WEBINAR_DATE_LABEL,
  WEBINAR_PRICE_LABEL,
  WEBINAR_PRICE_STRIKE,
} from "@/lib/webinar";

const PLATFORM_OPTIONS = ["Amazon India", "Flipkart", "Meesho", "Myntra", "AJIO", "Nykaa", "Blinkit", "Zepto", "Swiggy Instamart", "BigBasket / BB Now", "Flipkart Minutes", "Amazon Now / Fresh", "Other"];

function track(event: string, details: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const win = window as Window & { dataLayer?: Array<Record<string, string>> };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...details });
}

export function SeatsBadge({ withDate = false }: { withDate?: boolean }) {
  const seats = useSeatsLeft();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-primary">
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      Only {seats} seats left{withDate ? ` for ${WEBINAR_DATE_LABEL}` : ""}
    </span>
  );
}

export function DateHighlight() {
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-primary/15 px-2 py-0.5 font-bold text-primary">
      <CalendarDays className="h-4 w-4" />
      {WEBINAR_DATE_LABEL}
    </span>
  );
}

export function Countdown() {
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
  });
  return (
    <div className="grid grid-cols-4 gap-2" aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes and ${remaining.seconds} seconds remaining`}>
      {[[remaining.days, "Days"], [remaining.hours, "Hours"], [remaining.minutes, "Minutes"], [remaining.seconds, "Seconds"]].map(([value, label]) => (
        <div key={String(label)} className="border border-on-dark/15 bg-surface-dark px-2 py-3 text-center">
          <strong className="block font-display text-2xl text-on-dark">{String(value).padStart(2, "0")}</strong>
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-on-dark-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}

/** Dark card with the ₹49 price and the Razorpay Pay Now button. */
export function PaymentCard() {
  return (
    <div className="rounded-2xl border border-on-dark/15 bg-surface-dark-raised p-5 shadow-2xl sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)]">
          {WEBINAR_PRICE_LABEL} Only
        </span>
        <SeatsBadge />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold uppercase leading-tight text-on-dark sm:text-3xl">
        Reserve Your <span className="rounded-md bg-primary px-2 text-primary-foreground">Seat</span>
      </h2>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-dark-muted">
        90 minutes live · English only · <DateHighlight />
      </p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-on-dark">Registration closes in</p>
        <p className="flex items-center gap-2 text-xs font-bold text-primary"><Clock3 className="h-4 w-4" />Limited slots</p>
      </div>
      <div className="mt-3"><Countdown /></div>
      <div className="mt-5 flex items-end gap-3">
        <span className="text-sm text-on-dark-muted line-through">{WEBINAR_PRICE_STRIKE}</span>
        <strong className="font-display text-3xl text-primary">{WEBINAR_PRICE_LABEL}</strong>
        <span className="pb-1 text-xs font-bold uppercase text-on-dark">Today</span>
      </div>
      <Button
        variant="hero"
        size="xl"
        className="mt-5 w-full"
        asChild
      >
        <a
          href={RAZORPAY_PAYMENT_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("payment_click", { label: "pay_now_card", value: WEBINAR_PRICE_LABEL })}
        >
          Pay {WEBINAR_PRICE_LABEL} &amp; Book My Seat <ArrowRight />
        </a>
      </Button>
      <p className="mt-3 text-center text-sm font-semibold text-primary">Secure payment via Razorpay · UPI, cards &amp; net banking</p>
      <p className="mt-4 text-center text-xs text-on-dark-muted">
        After payment you'll be taken to a short registration form to lock your seat and get the joining details.
      </p>
    </div>
  );
}

/** Detailed lead form shown after payment. Submits the lead, then shows the thank-you page. */
export function RegistrationForm({ source = "contact", formName = "registration" }: { source?: "growth_audit" | "contact"; formName?: string }) {
  const submit = useServerFn(submitLead);
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("loading"); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await submit({ data: { source, formName, fullName: String(form.get("fullName") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), companyName: String(form.get("companyName") ?? ""), websiteUrl: "", monthlyBudget: "", city: String(form.get("city") ?? ""), platform: String(form.get("platform") ?? ""), message: `Paid webinar seat registration (${WEBINAR_PRICE_LABEL})`, attribution: getAttributionPayload() } });
      // Handed to the thank-you page so the Meta Lead event fires once per real registration.
      window.sessionStorage.setItem("bscalex_last_lead", JSON.stringify({ leadRef: result.leadRef, eventId: result.eventId, form: formName }));
      track("form_submitted", { form: formName, lead_id: result.leadRef, event_id: result.eventId });
      navigate({ to: "/thank-you" });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check your details and try again."); setState("error"); }
  };
  const field = "h-12 w-full rounded-md border border-on-dark/20 bg-surface-dark px-4 text-sm text-on-dark outline-none placeholder:text-on-dark-muted focus:border-primary focus:ring-2 focus:ring-primary/20";
  const label = "text-xs font-bold uppercase tracking-[0.1em] text-on-dark";
  return (
    <form onSubmit={onSubmit} onFocus={() => track("form_started", { form: formName })} className="rounded-2xl border border-on-dark/15 bg-surface-dark-raised p-5 shadow-2xl sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)]">
          Payment Done · {WEBINAR_PRICE_LABEL}
        </span>
        <SeatsBadge />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold uppercase leading-tight text-on-dark sm:text-3xl">
        Complete Your <span className="rounded-md bg-primary px-2 text-primary-foreground">Registration</span>
      </h2>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-dark-muted">
        90 minutes live · English only · <DateHighlight />
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className={label}>Name<input required name="fullName" minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name" className={`${field} mt-2`} /></label>
        <label className={label}>Email<input required name="email" type="email" maxLength={255} autoComplete="email" placeholder="you@email.com" className={`${field} mt-2`} /></label>
        <label className={label}>WhatsApp Number<input required name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" minLength={10} maxLength={10} autoComplete="tel" placeholder="9876543210" title="Enter a 10-digit mobile number" onInput={(event) => { const input = event.currentTarget; input.value = input.value.replace(/\D/g, "").slice(0, 10); }} className={`${field} mt-2`} /><span className="mt-1 block text-[0.65rem] font-medium normal-case tracking-normal text-on-dark-muted">10-digit mobile number, without +91</span></label>
        <label className={label}>City<input required name="city" maxLength={120} autoComplete="address-level2" placeholder="Mumbai" className={`${field} mt-2`} /></label>
        <label className={`${label} sm:col-span-2`}>Company / Brand Name<input name="companyName" maxLength={120} autoComplete="organization" placeholder="Your brand or company" className={`${field} mt-2`} /></label>
        <label className={`${label} sm:col-span-2`}>Where Do You Want to List Your Products?<select required name="platform" defaultValue="" className={`${field} mt-2`}><option value="" disabled>Select a platform</option>{PLATFORM_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <Button disabled={state === "loading"} type="submit" variant="hero" size="xl" className="mt-5 w-full">
        {state === "loading" ? "Confirming…" : "Confirm My Seat"}<ArrowRight />
      </Button>
      <p className="mt-3 text-center text-sm font-semibold text-primary">Your seat is locked once you submit this form</p>
      <p className="mt-4 text-center text-xs text-on-dark-muted">
        Haven't paid yet? <a href={RAZORPAY_PAYMENT_URL} target="_blank" rel="noreferrer" className="font-bold text-primary underline" onClick={() => track("payment_click", { label: "register_page_fallback" })}>Pay {WEBINAR_PRICE_LABEL} here first</a>. By registering you agree to receive session reminders and updates on email and WhatsApp.
      </p>
    </form>
  );
}
