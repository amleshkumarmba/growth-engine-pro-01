import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowRight, BarChart3, Check, ChevronRight, Clock3,
  Compass, ExternalLink, Gauge, Linkedin, LineChart, Mail, MapPin, Menu,
  MessageCircle, MousePointer2, MousePointerClick, Phone, Route as RouteIcon,
  Search, SearchX, Send, Sparkles, Target, TrendingDown, Unplug, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { submitLead } from "@/lib/leads.functions";
import { caseStudies, faqs, pillars, problems, services, siteConfig, testimonials } from "@/lib/site-content";
import portrait from "@/assets/bharat-hudadalli.jpg";
import logo from "@/assets/bscalex-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bharat Hudadalli | D2C Growth Consultant" },
      { name: "description", content: "Onboard and grow your D2C brand across Amazon, Flipkart, Blinkit, Zepto and other leading marketplaces with Bharat Hudadalli." },
      { property: "og:title", content: "Bharat Hudadalli | D2C Growth Consultant" },
      { property: "og:description", content: "Marketplace onboarding, account management and Q-commerce strategy for ambitious D2C brands." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "Person", name: siteConfig.name,
       jobTitle: "E-commerce and Quick-commerce Growth Consultant", url: "/", sameAs: [siteConfig.linkedin],
       knowsAbout: ["D2C brand onboarding", "Marketplace management", "Quick commerce", "Vendor consulting"],
    }) }],
  }),
  component: LandingPage,
});

const iconMap = { TrendingDown, Activity, MousePointerClick, BarChart3, Unplug, SearchX, Gauge, Megaphone: Target, Search, Users, MousePointer2, Compass, Route: RouteIcon, LineChart, Sparkles } as const;

function track(event: string, details: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const win = window as Window & { dataLayer?: Array<Record<string, string>> };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push({ event, ...details });
}

const PLATFORM_OPTIONS = ["Zepto", "Instamart", "Blinkit", "Flipkart Minutes", "Amazon Now"];
const WEBINAR_DATE = new Date("2026-09-27T23:59:59+05:30");
const WEBINAR_DATE_LABEL = "27th September 2026";

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const pick = (key: string) => params.get(key)?.slice(0, 200) ?? "";
  return {
    utmSource: pick("utm_source"), utmMedium: pick("utm_medium"), utmCampaign: pick("utm_campaign"),
    utmAdset: pick("utm_adset"), utmAd: pick("utm_ad"), utmPlacement: pick("utm_placement"), utmDevice: pick("utm_device"),
  };
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CTA({ children = "Get My Free Seat", compact = false }: { children?: ReactNode; compact?: boolean }) {
  return <Button variant="hero" size={compact ? "default" : "xl"} onClick={() => { track("cta_click", { label: String(children) }); scrollTo("top"); }}>{children}<ArrowRight /></Button>;
}

function UrgencyBadge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-primary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />{children}</span>;
}

function SectionHeading({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return <div className="reveal max-w-3xl">
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
    <h2 className={`text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl ${light ? "text-on-dark" : "text-foreground"}`}>{title}</h2>
    {copy && <p className={`mt-5 max-w-2xl text-base leading-7 ${light ? "text-on-dark-muted" : "text-muted-foreground"}`}>{copy}</p>}
  </div>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const update = () => setSolid(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const links = [["About", "about"], ["Services", "services"], ["Process", "process"], ["Results", "results"], ["Reviews", "testimonials"], ["FAQ", "faq"]];
  return <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${solid || open ? "border-border/20 bg-surface-dark/95 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
    <nav className="section-shell grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-5" aria-label="Primary navigation">
      <a href="#top" className="flex min-w-0 items-center" aria-label="BscaleX home"><img src={logo.url} alt="BscaleX" className="h-14 w-auto object-contain object-left" /></a>
       <div className="hidden items-center gap-7 lg:flex">{links.map(([label, id]) => <a key={id} href={`#${id}`} className="text-xs font-semibold text-on-dark-muted transition-colors hover:text-on-dark">{label}</a>)}<CTA compact>Get My Free Seat</CTA></div>
      <Button variant="ghost" size="icon" className="text-on-dark hover:bg-on-dark/10 hover:text-on-dark lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</Button>
    </nav>
     {open && <div className="border-t border-border/20 bg-surface-dark px-4 pb-6 lg:hidden">{links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block border-b border-border/15 py-4 font-semibold text-on-dark">{label}</a>)}<div className="pt-5"><CTA /></div></div>}
  </header>;
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
  return <div className="grid grid-cols-4 gap-2" aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes and ${remaining.seconds} seconds remaining`}>
    {[[remaining.days, "Days"], [remaining.hours, "Hours"], [remaining.minutes, "Minutes"], [remaining.seconds, "Seconds"]].map(([value, label]) => <div key={String(label)} className="border border-on-dark/15 bg-surface-dark px-2 py-3 text-center"><strong className="block font-display text-2xl text-on-dark">{String(value).padStart(2, "0")}</strong><span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-on-dark-muted">{label}</span></div>)}
  </div>;
}

function RegistrationForm({ source = "contact", formName = "registration" }: { source?: "growth_audit" | "contact"; formName?: string }) {
  const submit = useServerFn(submitLead);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("loading"); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await submit({ data: { source, fullName: String(form.get("fullName") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), companyName: "", websiteUrl: "", monthlyBudget: "", city: String(form.get("city") ?? ""), platform: String(form.get("platform") ?? ""), message: "Free webinar seat registration", ...getUtmParams() } });
      track("form_submitted", { form: formName }); setState("success");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check your details and try again."); setState("error"); }
  };
  if (state === "success") return <div className="grid min-h-[25rem] place-items-center rounded-2xl border border-primary/30 bg-surface-dark p-7 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></span><h2 className="mt-5 text-3xl font-semibold text-on-dark">You're In!</h2><p className="mt-3 text-sm text-on-dark-muted">Your free seat for the {WEBINAR_DATE_LABEL} webinar is reserved. We'll send the joining link on WhatsApp and email.</p><Button className="mt-7" variant="hero" size="lg" onClick={() => { track("cta_click", { label: "success_register_another" }); scrollTo("top"); }}>Register Another Seat <ArrowRight /></Button></div></div>;
  const field = "h-12 w-full rounded-md border border-on-dark/20 bg-surface-dark px-4 text-sm text-on-dark outline-none placeholder:text-on-dark-muted focus:border-primary focus:ring-2 focus:ring-primary/20";
  const label = "text-xs font-bold uppercase tracking-[0.1em] text-on-dark";
  return <form onSubmit={onSubmit} onFocus={() => track("form_started", { form: formName })} className="rounded-2xl border border-on-dark/15 bg-surface-dark-raised p-5 shadow-2xl sm:p-7">
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-primary-foreground">100% Free · ₹0</span><UrgencyBadge>Only 5 free seats left</UrgencyBadge></div>
    <h2 className="mt-5 font-display text-2xl font-semibold uppercase leading-tight text-on-dark sm:text-3xl">Reserve Your <span className="text-primary">Free</span> Seat</h2>
    <p className="mt-2 text-sm text-on-dark-muted">90 minutes live · Hindi & English · {WEBINAR_DATE_LABEL}</p>
    <div className="mt-5 flex items-center justify-between gap-4"><p className="text-sm font-semibold text-on-dark">Registration closes in</p><p className="flex items-center gap-2 text-xs font-bold text-primary"><Clock3 className="h-4 w-4"/>Limited slots</p></div>
    <div className="mt-3"><Countdown /></div>
    <div className="mt-5 flex items-end gap-3"><span className="text-sm text-on-dark-muted line-through">₹1,999</span><strong className="font-display text-3xl text-primary">₹0</strong><span className="pb-1 text-xs font-bold uppercase text-on-dark">Today</span></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <label className={label}>Name<input required name="fullName" minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name" className={`${field} mt-2`}/></label>
      <label className={label}>Email<input required name="email" type="email" maxLength={255} autoComplete="email" placeholder="you@email.com" className={`${field} mt-2`}/></label>
      <label className={label}>WhatsApp Number<input required name="phone" type="tel" maxLength={30} autoComplete="tel" placeholder="+91 98765 43210" className={`${field} mt-2`}/></label>
      <label className={label}>City<input required name="city" maxLength={120} autoComplete="address-level2" placeholder="Mumbai" className={`${field} mt-2`}/></label>
      <label className={`${label} sm:col-span-2`}>Where Do You Want to List Your Products?<select required name="platform" defaultValue="" className={`${field} mt-2`}><option value="" disabled>Select a platform</option>{PLATFORM_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <Button disabled={state === "loading"} type="submit" variant="hero" size="xl" className="mt-5 w-full">{state === "loading" ? "Reserving…" : "Get My Free Seat"}<ArrowRight /></Button>
    <p className="mt-3 text-center text-sm font-semibold text-primary">No card needed · No fees · Free webinar</p>
    <p className="mt-4 text-center text-xs text-on-dark-muted">By registering you agree to receive session reminders and updates on email and WhatsApp. You can opt out any time.</p>
  </form>;
}

function Hero() {
  return <section id="top" className="dark-grid relative overflow-hidden bg-surface-dark pb-20 pt-32 text-on-dark lg:pb-28 lg:pt-40">
    <div className="section-shell grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
      <div className="relative z-10">
        <p className="mb-6 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary">{siteConfig.eyebrow}</p>
         <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">Scale Your D2C Brand. <span className="text-primary">Faster.</span></h1>
         <p className="mt-7 max-w-xl text-lg leading-8 text-on-dark-muted">Get the end-to-end onboarding and growth strategy that gets your brand listed, visible and selling across India's leading marketplaces.</p>
         <p className="mt-4 max-w-xl text-sm leading-6 text-on-dark-muted">Amazon, Flipkart, Blinkit, Zepto and Instamart all play by different rules. Replace guesswork with hands-on, platform-specific support.</p>
         <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row"><CTA>Get My Free Seat</CTA><Button variant="quiet" size="xl" className="border-on-dark/25 text-on-dark hover:border-primary hover:text-primary" onClick={() => scrollTo("services")}>Explore Services</Button></div>
      </div>
       <div className="mx-auto w-full max-w-[31rem]"><RegistrationForm source="contact" formName="hero_registration" /></div>
    </div>
  </section>;
}

function TrustBar() {
   const platforms = [
     ["Amazon", "/platform-logos/amazon.png"], ["Flipkart", "/platform-logos/flipkart.png"], ["Myntra", "/platform-logos/myntra.png"],
     ["Blinkit", "/platform-logos/blinkit.png"], ["Zepto", "/platform-logos/zepto.png"], ["Instamart", "/platform-logos/swiggy.svg"],
     ["BigBasket", "/platform-logos/bigbasket.svg"], ["Nykaa", "/platform-logos/nykaa.png"], ["Tata Cliq", "/platform-logos/tatacliq.jpg"],
   ];
   return <section className="border-b border-border bg-card py-9"><div className="section-shell"><p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Platforms I work across</p><div className="mt-7 grid grid-cols-3 gap-px border border-border bg-border sm:grid-cols-5 lg:grid-cols-9">{platforms.map(([name, src]) => <div key={name} className="flex h-20 flex-col items-center justify-center gap-2 bg-card px-3"><img src={src} alt={`${name} logo`} loading="lazy" className="h-7 max-w-full object-contain"/><span className="text-[0.62rem] font-semibold text-muted-foreground">{name}</span></div>)}</div></div></section>;
}

function Problems() {
   return <section className="py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="Where brands get stuck" title="Great Products Don't Fail. Bad Onboarding Does." copy="Marketplace growth slows when onboarding is confusing, account management is reactive and every platform is treated the same." /><div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{problems.map(([icon, title, copy]) => { const Icon = iconMap[icon]; return <article key={title} className="group bg-card p-7 transition-transform hover:-translate-y-1"><Icon className="h-6 w-6 text-primary"/><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></article>; })}</div></div></section>;
}

function Solutions() {
   return <section className="bg-foreground py-24 text-on-dark lg:py-32"><div className="section-shell"><SectionHeading light eyebrow="How I work" title="Clear Strategy. Hands-On Execution." copy="A practical process built around your brand, your platforms and the bottleneck holding growth back."/><div className="mt-14 grid gap-px bg-on-dark/15 lg:grid-cols-4">{pillars.map(([number, title, copy]) => <article key={number} className="bg-surface-dark p-7"><span className="font-display text-4xl font-semibold text-primary">{number}</span><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-on-dark-muted">{copy}</p></article>)}</div></div></section>;
}

function Services() {
   return <section id="services" className="py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="Capabilities" title="From First Listing to Marketplace Growth" copy="Focused support across the five areas D2C brands need to launch well, stay healthy and scale across channels."/><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(([icon, title, copy], index) => { const Icon = iconMap[icon]; return <article key={title} className="group border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"><span className="text-xs font-bold text-primary">0{index + 1}</span><Icon className="mt-6 h-6 w-6 text-primary"/><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{copy}</p><a href="#top" onClick={() => track("cta_click", { label: "service_card" })} className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">Discuss Your Brand <ChevronRight className="h-4 w-4"/></a></article>; })}</div><div className="mt-12 flex flex-col items-center gap-3"><UrgencyBadge>Only 5 free seats left for {WEBINAR_DATE_LABEL}</UrgencyBadge><CTA /></div></div></section>;
}

function Process() {
   const steps = [["01", "Understand Your Brand", "Your product, current platform presence and gaps."], ["02", "Diagnose the Bottleneck", "The real blocker across onboarding, account health or Q-commerce."], ["03", "Build an Action Plan", "What to fix first, what to set up next and what to avoid."], ["04", "Execute & Stay Hands-On", "Monitor performance and adjust the strategy as your brand grows."]];
  return <section id="process" className="border-y border-border bg-muted py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="How it works" title="A Simple Process. Built for Results."/><div className="relative mt-16 grid gap-8 lg:grid-cols-4 lg:gap-0 before:absolute before:left-8 before:top-0 before:h-full before:w-px before:bg-border lg:before:left-[12.5%] lg:before:top-7 lg:before:h-px lg:before:w-3/4">{steps.map(([n,t,c]) => <article key={n} className="relative grid grid-cols-[4rem_1fr] gap-4 lg:block lg:px-5 lg:text-center"><span className="relative z-10 grid h-14 w-14 place-items-center border border-primary bg-background font-display font-bold text-primary lg:mx-auto">{n}</span><div><h3 className="mt-1 text-xl font-semibold lg:mt-8">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{c}</p></div></article>)}</div></div></section>;
}

function Results() {
   return <section id="results" className="bg-surface-dark py-24 text-on-dark lg:py-32"><div className="section-shell"><SectionHeading light eyebrow="Selected brand work" title="Supporting Brands Built for the Big Stage" copy="Complete onboarding assistance and account management for beauty brands later featured on Shark Tank India."/><div className="mt-14 grid max-w-4xl gap-5 md:grid-cols-2">{caseStudies.map((item) => <article key={item.industry} className="border border-on-dark/15 bg-surface-dark-raised p-7"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{item.industry}</p><dl className="mt-8 space-y-6"><div><dt className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-dark-muted">Need</dt><dd className="mt-2 text-sm">{item.challenge}</dd></div><div><dt className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-dark-muted">Support</dt><dd className="mt-2 text-sm">{item.strategy}</dd></div></dl><p className="mt-8 border-t border-on-dark/15 pt-6 font-display text-2xl font-semibold text-primary">{item.result}</p></article>)}</div><div className="mt-12 flex flex-col items-center gap-3"><UrgencyBadge>Webinar on {WEBINAR_DATE_LABEL} — seats filling fast</UrgencyBadge><CTA /></div></div></section>;
}

function About() {
   return <section id="about" className="py-24 lg:py-32"><div className="section-shell grid items-center gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20"><div><img src={portrait} alt="Bharat Hudadalli" width={1600} height={1067} loading="lazy" className="aspect-[4/5] w-full object-cover object-[58%_center]"/></div><div><SectionHeading eyebrow="Meet your growth architect" title={`Meet ${siteConfig.name}`} /><p className="mt-7 text-lg leading-8 text-muted-foreground">An e-commerce and quick-commerce growth consultant based in Bengaluru, and founder of E-Com Brands Launchpad.</p><blockquote className="my-8 border-l-2 border-primary pl-6 font-display text-2xl font-medium leading-9">“Hands-on, platform-specific experience. Not recycled playbooks.”</blockquote><div className="grid gap-3 sm:grid-cols-2">{["D2C brand onboarding", "Marketplace account health", "Q-commerce strategy", "Direct 1:1 access"].map((x) => <p key={x} className="flex items-center gap-3 text-sm font-semibold"><Check className="h-4 w-4 text-primary"/>{x}</p>)}</div><div className="mt-9"><CTA>Reserve My Free Seat</CTA></div></div></div></section>;
}

function WhyMe() {
   const items = [["Platform Experience", "Hands-on onboarding experience across leading marketplaces and quick-commerce channels."], ["Founder-Led", "Founder of E-Com Brands Launchpad."], ["Topmate Recognition", "Ranked in the Top 5% of Topmate creators."], ["Current Q-Commerce Insight", "A practical understanding of India's fast-evolving quick-commerce landscape."], ["Direct Access", "You work directly with Bharat, not a junior account manager."]];
  return <section className="border-y border-border bg-muted py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="A better working model" title="Why Businesses Choose to Work With Me"/><div className="mt-14 border-t border-border">{items.map(([title, copy], i) => <div key={title} className="grid gap-3 border-b border-border py-6 sm:grid-cols-[3rem_15rem_1fr] sm:items-center"><span className="font-display text-sm text-primary">0{i+1}</span><h3 className="text-lg font-semibold">{title}</h3><p className="text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div></div></section>;
}

function Testimonials() {
   return <section id="testimonials" className="py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="Founder and partner feedback" title="What Clients Say" copy="Feedback published on Bharat's original consultancy website."/><div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map((item, i) => <figure key={i} className="border border-border bg-card p-7"><p aria-label="5 stars" className="text-sm tracking-[0.2em] text-primary">★★★★★</p><blockquote className="mt-8 min-h-28 text-base leading-7">“{item.quote}”</blockquote><figcaption className="mt-8 border-t border-border pt-5"><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.role}</p></figcaption></figure>)}</div><div className="mt-12 flex flex-col items-center gap-3"><UrgencyBadge>Only 5 free seats left</UrgencyBadge><CTA /></div></div></section>;
}

function LeadMagnet() {
   return <section id="audit" className="bg-accent/35 py-24 lg:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20"><div><SectionHeading eyebrow="A useful first step" title="Get a Free Marketplace Growth Audit" copy="Identify the biggest onboarding, account-health and channel opportunities holding your brand back."/><div className="mt-8 space-y-3">{["A focused marketplace review", "Priority platform opportunities", "Clear next-step recommendations"].map((x) => <p key={x} className="flex items-center gap-3 text-sm font-semibold"><Check className="h-4 w-4 text-primary"/>{x}</p>)}</div></div><div><RegistrationForm source="growth_audit" formName="growth_audit" /></div></div></section>;
}

function FAQ() {
  return <section id="faq" className="py-24 lg:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20"><SectionHeading eyebrow="Before we talk" title="Frequently Asked Questions" copy="Straight answers about fit, scope and how an engagement begins."/><Accordion type="single" collapsible className="border-t border-border">{faqs.map(([q,a],i) => <AccordionItem key={q} value={`faq-${i}`}><AccordionTrigger className="py-6 text-left font-display text-base font-semibold hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-2xl pb-6 leading-6 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}

function FinalCTA() {
   return <section className="dark-grid bg-surface-dark py-24 text-center text-on-dark"><div className="section-shell"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your next growth move</p><h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Ready to Get Listed, Visible and Selling?</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-on-dark-muted">Join the free {WEBINAR_DATE_LABEL} webinar. Only 5 seats left — reserve yours now.</p><div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><CTA /><Button variant="quiet" size="xl" className="border-on-dark/25 text-on-dark hover:border-primary hover:text-primary" onClick={() => scrollTo("services")}>Explore Services</Button></div></div></section>;
}

function Contact() {
   return <section id="contact" className="py-24 lg:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20"><div><SectionHeading eyebrow="Start a conversation" title="Let's Scale Your Brand" copy="Tell me where you sell today and what's blocking your next stage of marketplace growth."/><div className="mt-9 space-y-4"><a href={siteConfig.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm"><Linkedin className="h-5 w-5 text-primary"/>Connect on LinkedIn <ExternalLink className="h-3 w-3"/></a><p className="flex items-center gap-3 text-sm"><MapPin className="h-5 w-5 text-primary"/>Bengaluru, India</p></div></div><div><RegistrationForm source="contact" formName="contact" /></div></div></section>;
}

function Footer() {
  return <footer className="border-t border-on-dark/10 bg-surface-dark pb-24 pt-10 text-on-dark lg:pb-10"><div className="section-shell flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><img src={logo.url} alt="BscaleX" loading="lazy" className="h-16 w-auto object-contain object-left"/><div className="text-left sm:text-right"><p className="text-sm text-on-dark-muted">Strategy. Performance. Growth.</p><p className="mt-2 text-xs text-on-dark-muted">© {new Date().getFullYear()} BscaleX. All rights reserved.</p></div></div></footer>;
}

function LandingPage() {
  useEffect(() => {
    const marks = new Set<number>();
    const onScroll = () => { const depth = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100); [25,50,75,90].forEach((mark) => { if (depth >= mark && !marks.has(mark)) { marks.add(mark); track("scroll_depth", { percent: String(mark) }); } }); };
    window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll);
  }, []);
   return <><Navbar/><main><Hero/><TrustBar/><Problems/><Services/><Process/><Results/><About/><WhyMe/><Testimonials/><LeadMagnet/><FAQ/><FinalCTA/><Contact/></main><Footer/><div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/20 bg-surface-dark p-3 lg:hidden"><Button variant="hero" className="h-12 w-full" onClick={() => { track("cta_click", { label: "mobile_sticky" }); scrollTo("top"); }}>Get My Free Seat <ArrowRight /></Button></div></>;
}
