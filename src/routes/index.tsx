import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowRight, BarChart3, BriefcaseBusiness, Check, ChevronRight,
  Compass, ExternalLink, Gauge, Linkedin, LineChart, Mail, MapPin, Menu,
  MessageCircle, MousePointer2, MousePointerClick, Phone, Route as RouteIcon,
  Search, SearchX, Send, Sparkles, Target, TrendingDown, Unplug, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { submitLead } from "@/lib/leads.functions";
import { caseStudies, credibility, faqs, pillars, problems, services, siteConfig, testimonials } from "@/lib/site-content";
import portrait from "@/assets/bharat-portrait-placeholder.jpg";
import logo from "@/assets/bscalex-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bharat Hudadalli | Growth Strategy Expert" },
      { name: "description", content: "Helping businesses generate qualified leads, improve conversions and scale revenue through performance marketing and data-driven growth strategies." },
      { property: "og:title", content: "Bharat Hudadalli | Growth Strategy Expert" },
      { property: "og:description", content: "Turn marketing into a measurable system for qualified leads, stronger conversions and sustainable growth." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "Person", name: siteConfig.name,
      jobTitle: "Growth Strategy Consultant", url: "/", sameAs: [siteConfig.linkedin],
      knowsAbout: ["Performance marketing", "Lead generation", "Conversion optimization", "Growth strategy"],
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

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CTA({ children = "Book a Free Strategy Call", compact = false }: { children?: ReactNode; compact?: boolean }) {
  return <Button variant="hero" size={compact ? "default" : "xl"} onClick={() => { track("cta_click", { label: String(children) }); scrollTo("contact"); }}>{children}<ArrowRight /></Button>;
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
  const links = [["About", "about"], ["Services", "services"], ["Process", "process"], ["Results", "results"], ["Testimonials", "testimonials"], ["FAQ", "faq"]];
  return <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${solid || open ? "border-border/20 bg-surface-dark/95 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
    <nav className="section-shell grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-5" aria-label="Primary navigation">
      <a href="#top" className="flex min-w-0 items-center" aria-label="BscaleX home"><img src={logo.url} alt="BscaleX" className="h-14 w-auto object-contain object-left" /></a>
      <div className="hidden items-center gap-7 lg:flex">{links.map(([label, id]) => <a key={id} href={`#${id}`} className="text-xs font-semibold text-on-dark-muted transition-colors hover:text-on-dark">{label}</a>)}<CTA compact>Book a Call</CTA></div>
      <Button variant="ghost" size="icon" className="text-on-dark hover:bg-on-dark/10 hover:text-on-dark lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</Button>
    </nav>
    {open && <div className="border-t border-border/20 bg-surface-dark px-4 pb-6 lg:hidden">{links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block border-b border-border/15 py-4 font-semibold text-on-dark">{label}</a>)}<div className="pt-5"><CTA>Book a Free Strategy Call</CTA></div></div>}
  </header>;
}

function Hero() {
  return <section id="top" className="dark-grid relative overflow-hidden bg-surface-dark pb-20 pt-32 text-on-dark lg:pb-28 lg:pt-40">
    <div className="section-shell grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
      <div className="relative z-10">
        <p className="mb-6 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary">{siteConfig.eyebrow}</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">Turn Your Marketing Into a <span className="text-primary">Predictable</span> Growth Engine.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-on-dark-muted">I help ambitious businesses generate more qualified leads, improve conversions and scale revenue with data-driven marketing.</p>
        <p className="mt-4 max-w-xl text-sm leading-6 text-on-dark-muted">Stop guessing what works. Build a measurable growth system that turns attention into qualified conversations, customers and sustainable revenue.</p>
        <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row"><CTA /><Button variant="quiet" size="xl" className="border-on-dark/25 text-on-dark hover:border-primary hover:text-primary" onClick={() => scrollTo("services")}>See How I Can Help</Button></div>
      </div>
      <div className="relative mx-auto w-full max-w-[31rem]">
        <div className="absolute -left-4 top-12 z-10 border border-primary/35 bg-surface-dark-raised/95 px-4 py-3 backdrop-blur sm:-left-10"><p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-primary">Focused on one outcome</p><p className="mt-1 font-display text-lg font-semibold">Helping Businesses Grow</p></div>
        <div className="relative aspect-[4/5] overflow-hidden border border-on-dark/15 bg-surface-dark-raised"><img src={portrait} alt="Placeholder portrait for Bharat Hudadalli, growth strategy consultant" width={1200} height={1500} fetchPriority="high" className="h-full w-full object-cover" /><span className="absolute bottom-3 right-3 bg-surface-dark/85 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-on-dark-muted">Portrait placeholder</span></div>
        <div className="grid grid-cols-3 border-x border-b border-on-dark/15 bg-surface-dark-raised">{credibility.map((item) => <div key={item.label} className="border-r border-on-dark/15 px-3 py-4 last:border-r-0"><p className="font-display text-sm font-semibold text-primary sm:text-base">{item.value}</p><p className="mt-1 text-[0.62rem] uppercase leading-4 tracking-[0.1em] text-on-dark-muted">{item.label}</p></div>)}</div>
      </div>
    </div>
  </section>;
}

function TrustBar() {
  return <section className="border-b border-border bg-card py-9"><div className="section-shell"><p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Trusted by businesses, founders & growth-focused teams</p><div className="mt-7 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">{["[CLIENT LOGO]", "[CLIENT LOGO]", "[CLIENT LOGO]", "[CLIENT LOGO]"].map((x, i) => <div key={i} className="grid h-16 place-items-center bg-card text-xs font-bold tracking-[0.12em] text-muted-foreground">{x}</div>)}</div><div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">{[["[EXPERIENCE]", "Verified experience"], ["[PROJECTS]", "Verified projects"], ["Multiple", "Industries"], ["ROI-focused", "Strategy"]].map(([v, l]) => <div key={l} className="text-center"><p className="font-display text-xl font-semibold">{v}</p><p className="mt-1 text-xs text-muted-foreground">{l}</p></div>)}</div></div></section>;
}

function Problems() {
  return <section className="py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="The real problem" title="Your Business Doesn't Need More Marketing. It Needs Better Marketing." copy="More activity cannot fix a broken growth system. The first step is seeing where spend, attention and opportunity are being lost." /><div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{problems.map(([icon, title, copy]) => { const Icon = iconMap[icon]; return <article key={title} className="group bg-card p-7 transition-transform hover:-translate-y-1"><Icon className="h-6 w-6 text-primary"/><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></article>; })}</div></div></section>;
}

function Solutions() {
  return <section className="bg-foreground py-24 text-on-dark lg:py-32"><div className="section-shell"><SectionHeading light eyebrow="The growth architecture" title="Build a Growth System That Actually Scales" copy="A connected approach across strategy, acquisition, conversion and measurement—built around the economics of your business."/><div className="mt-14 grid gap-px bg-on-dark/15 lg:grid-cols-4">{pillars.map(([number, title, copy]) => <article key={number} className="bg-surface-dark p-7"><span className="font-display text-4xl font-semibold text-primary">{number}</span><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-on-dark-muted">{copy}</p></article>)}</div></div></section>;
}

function Services() {
  return <section id="services" className="py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="Capabilities" title="How I Can Help Your Business Grow" copy="Focused support for the parts of your growth engine that need sharper thinking, stronger execution and better measurement."/><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(([icon, title, copy]) => { const Icon = iconMap[icon]; return <article key={title} className="group border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"><Icon className="h-6 w-6 text-primary"/><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{copy}</p><a href="#contact" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">Learn More <ChevronRight className="h-4 w-4"/></a></article>; })}</div><div className="mt-12 flex justify-center"><CTA /></div></div></section>;
}

function Process() {
  const steps = [["01", "Understand", "Your business, audience, offer, funnel and growth goals."], ["02", "Strategize", "A customized acquisition and conversion plan."], ["03", "Execute", "Campaigns, landing pages, funnels and tracking systems."], ["04", "Optimize", "Measure bottlenecks and continuously improve ROI."]];
  return <section id="process" className="border-y border-border bg-muted py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="How it works" title="A Simple Process. Built for Results."/><div className="relative mt-16 grid gap-8 lg:grid-cols-4 lg:gap-0 before:absolute before:left-8 before:top-0 before:h-full before:w-px before:bg-border lg:before:left-[12.5%] lg:before:top-7 lg:before:h-px lg:before:w-3/4">{steps.map(([n,t,c]) => <article key={n} className="relative grid grid-cols-[4rem_1fr] gap-4 lg:block lg:px-5 lg:text-center"><span className="relative z-10 grid h-14 w-14 place-items-center border border-primary bg-background font-display font-bold text-primary lg:mx-auto">{n}</span><div><h3 className="mt-1 text-xl font-semibold lg:mt-8">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{c}</p></div></article>)}</div></div></section>;
}

function Results() {
  return <section id="results" className="bg-surface-dark py-24 text-on-dark lg:py-32"><div className="section-shell"><SectionHeading light eyebrow="Evidence, not hype" title="Results Speak Louder Than Promises." copy="Verified outcomes will replace the placeholders below. Until then, no invented claims—only an honest view of how each case study will be presented."/><div className="mt-14 grid gap-5 lg:grid-cols-3">{caseStudies.map((item) => <article key={item.industry} className="border border-on-dark/15 bg-surface-dark-raised p-7"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{item.industry}</p><dl className="mt-8 space-y-6"><div><dt className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-dark-muted">Challenge</dt><dd className="mt-2 text-sm">{item.challenge}</dd></div><div><dt className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-dark-muted">Strategy</dt><dd className="mt-2 text-sm">{item.strategy}</dd></div></dl><p className="mt-8 border-t border-on-dark/15 pt-6 font-display text-2xl font-semibold text-primary">{item.result}</p></article>)}</div><div className="mt-12"><CTA /></div></div></section>;
}

function About() {
  return <section id="about" className="py-24 lg:py-32"><div className="section-shell grid items-center gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20"><div className="relative"><img src={portrait} alt="Placeholder editorial portrait for Bharat Hudadalli" width={1200} height={1500} loading="lazy" className="aspect-[4/5] w-full object-cover grayscale"/><span className="absolute bottom-3 right-3 bg-surface-dark/85 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-on-dark-muted">Replace with verified portrait</span></div><div><SectionHeading eyebrow="Personal, practical, accountable" title={`Meet ${siteConfig.name}`} /><p className="mt-7 text-lg leading-8 text-muted-foreground">A growth consultant focused on connecting marketing activity to the commercial outcomes that matter: qualified demand, stronger conversion and healthier revenue.</p><blockquote className="my-8 border-l-2 border-primary pl-6 font-display text-2xl font-medium leading-9">“I don't believe in marketing for the sake of marketing. Every campaign, funnel and creative should connect to business growth.”</blockquote><div className="grid gap-3 sm:grid-cols-2">{["Business-led strategy", "Full-funnel thinking", "Hands-on execution", "Clear measurement"].map((x) => <p key={x} className="flex items-center gap-3 text-sm font-semibold"><Check className="h-4 w-4 text-primary"/>{x}</p>)}</div><div className="mt-9"><CTA>Let's Talk About Your Growth</CTA></div></div></div></section>;
}

function WhyMe() {
  const items = [["Business First", "Marketing decisions connect to revenue—not vanity metrics."], ["Data Driven", "Important decisions are backed by measurable performance."], ["Full Funnel Thinking", "From first click to qualified lead to customer."], ["Hands-On Strategy", "Strategic thinking combined with practical execution."], ["Continuous Optimization", "The work is never set and forget."]];
  return <section className="border-y border-border bg-muted py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="A better working model" title="Why Businesses Choose to Work With Me"/><div className="mt-14 border-t border-border">{items.map(([title, copy], i) => <div key={title} className="grid gap-3 border-b border-border py-6 sm:grid-cols-[3rem_15rem_1fr] sm:items-center"><span className="font-display text-sm text-primary">0{i+1}</span><h3 className="text-lg font-semibold">{title}</h3><p className="text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div></div></section>;
}

function Testimonials() {
  return <section id="testimonials" className="py-24 lg:py-32"><div className="section-shell"><SectionHeading eyebrow="Client perspective" title="What Clients Say" copy="Verified client stories will be added here. The current cards are intentionally marked placeholders."/><div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map((item, i) => <figure key={i} className="border border-border bg-card p-7"><p aria-label="5 stars" className="text-sm tracking-[0.2em] text-primary">★★★★★</p><blockquote className="mt-8 min-h-28 text-base leading-7">“{item.quote}”</blockquote><figcaption className="mt-8 border-t border-border pt-5"><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.role}</p><p className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-primary">Testimonial placeholder</p></figcaption></figure>)}</div></div></section>;
}

type LeadKind = "growth_audit" | "contact";
function LeadForm({ kind }: { kind: LeadKind }) {
  const submit = useServerFn(submitLead);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("loading"); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await submit({ data: { source: kind, fullName: String(form.get("fullName") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), companyName: String(form.get("companyName") ?? ""), websiteUrl: String(form.get("websiteUrl") ?? ""), monthlyBudget: String(form.get("monthlyBudget") ?? ""), message: String(form.get("message") ?? "") } });
      track("form_submitted", { form: kind }); setState("success");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check your details and try again."); setState("error"); }
  };
  if (state === "success") return <div className="grid min-h-80 place-items-center border border-primary/30 bg-accent/30 p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></span><h3 className="mt-5 text-3xl font-semibold">You're In!</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Thanks for reaching out. Your request has been received. We'll get back to you shortly.</p><Button className="mt-7" variant="hero" size="lg" onClick={() => { track("calendar_click"); scrollTo("contact"); }}>Schedule Your Call <ArrowRight /></Button></div></div>;
  const input = "h-12 w-full border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
  return <form onSubmit={onSubmit} onFocus={() => track("form_started", { form: kind })} className="grid gap-4 sm:grid-cols-2">
    <label className="text-xs font-bold uppercase tracking-[0.1em]">Full Name<input required name="fullName" minLength={2} maxLength={100} autoComplete="name" className={`${input} mt-2`} /></label>
    <label className="text-xs font-bold uppercase tracking-[0.1em]">Work Email<input required name="email" type="email" maxLength={255} autoComplete="email" className={`${input} mt-2`} /></label>
    <label className="text-xs font-bold uppercase tracking-[0.1em]">Phone<input name="phone" type="tel" maxLength={30} autoComplete="tel" className={`${input} mt-2`} /></label>
    <label className="text-xs font-bold uppercase tracking-[0.1em]">Company<input name="companyName" maxLength={120} autoComplete="organization" className={`${input} mt-2`} /></label>
    {kind === "growth_audit" && <><label className="text-xs font-bold uppercase tracking-[0.1em]">Website URL<input name="websiteUrl" type="url" maxLength={500} placeholder="https://" className={`${input} mt-2`} /></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Monthly Marketing Budget<select name="monthlyBudget" className={`${input} mt-2`} defaultValue=""><option value="" disabled>Select a range</option><option>Under ₹1 lakh</option><option>₹1–5 lakh</option><option>₹5–15 lakh</option><option>₹15 lakh+</option><option>Not currently spending</option></select></label></>}
    <label className="text-xs font-bold uppercase tracking-[0.1em] sm:col-span-2">{kind === "growth_audit" ? "Biggest Growth Challenge" : "Message"}<textarea required name="message" minLength={10} maxLength={1500} rows={5} className={`${input} mt-2 h-auto py-3`} /></label>
    {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
    <div className="sm:col-span-2"><Button disabled={state === "loading"} type="submit" variant="hero" size="xl">{state === "loading" ? "Sending…" : kind === "growth_audit" ? "Get My Free Growth Audit" : "Send Inquiry"}<ArrowRight /></Button><p className="mt-3 text-xs text-muted-foreground">Your details are used only to respond to your enquiry.</p></div>
  </form>;
}

function LeadMagnet() {
  return <section id="audit" className="bg-accent/35 py-24 lg:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20"><div><SectionHeading eyebrow="A useful first step" title="Get My Free Growth Audit" copy="I'll identify the biggest opportunities in your marketing funnel and show you where potential customers may be slipping away."/><div className="mt-8 space-y-3">{["A focused funnel review", "Priority growth opportunities", "Clear next-step recommendations"].map((x) => <p key={x} className="flex items-center gap-3 text-sm font-semibold"><Check className="h-4 w-4 text-primary"/>{x}</p>)}</div></div><div className="bg-card p-6 shadow-xl sm:p-9"><LeadForm kind="growth_audit"/></div></div></section>;
}

function FAQ() {
  return <section id="faq" className="py-24 lg:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20"><SectionHeading eyebrow="Before we talk" title="Frequently Asked Questions" copy="Straight answers about fit, scope and how an engagement begins."/><Accordion type="single" collapsible className="border-t border-border">{faqs.map(([q,a],i) => <AccordionItem key={q} value={`faq-${i}`}><AccordionTrigger className="py-6 text-left font-display text-base font-semibold hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-2xl pb-6 leading-6 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}

function FinalCTA() {
  return <section className="dark-grid bg-surface-dark py-24 text-center text-on-dark"><div className="section-shell"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your next growth move</p><h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Ready to Turn Your Marketing Into Growth?</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-on-dark-muted">Let's identify what's holding your business back and build a practical roadmap to scale.</p><div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><CTA>Book a Free Strategy Call</CTA><Button variant="quiet" size="xl" className="border-on-dark/25 text-on-dark hover:border-primary hover:text-primary" onClick={() => scrollTo("audit")}>Get a Free Growth Audit</Button></div></div></section>;
}

function Contact() {
  return <section id="contact" className="py-24 lg:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20"><div><SectionHeading eyebrow="Start a conversation" title="Let's Talk Growth" copy="Share where you are today and what you want to improve. If there is a strong fit, we'll map the next step together."/><div className="mt-9 space-y-4"><a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-sm" onClick={() => track("email_click")}><Mail className="h-5 w-5 text-primary"/>{siteConfig.email}</a><a href={`tel:${siteConfig.phone}`} className="flex items-center gap-3 text-sm" onClick={() => track("phone_click")}><Phone className="h-5 w-5 text-primary"/>{siteConfig.phone}</a><a href={siteConfig.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm"><Linkedin className="h-5 w-5 text-primary"/>LinkedIn <ExternalLink className="h-3 w-3"/></a><p className="flex items-center gap-3 text-sm"><MapPin className="h-5 w-5 text-primary"/>{siteConfig.location}</p><a href={siteConfig.whatsappUrl} className="flex items-center gap-3 text-sm" onClick={() => track("whatsapp_click")}><MessageCircle className="h-5 w-5 text-primary"/>WhatsApp [LINK PLACEHOLDER]</a></div></div><div className="border border-border bg-card p-6 sm:p-9"><LeadForm kind="contact"/></div></div></section>;
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
  return <><Navbar/><main><Hero/><TrustBar/><Problems/><Solutions/><Services/><Process/><Results/><About/><WhyMe/><Testimonials/><LeadMagnet/><FAQ/><FinalCTA/><Contact/></main><Footer/><div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/20 bg-surface-dark p-3 lg:hidden"><Button variant="hero" className="h-12 w-full" onClick={() => { track("cta_click", { label: "mobile_sticky" }); scrollTo("contact"); }}>Book Free Strategy Call <ArrowRight /></Button></div></>;
}