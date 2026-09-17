import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const SHEET_ID = "1NLoxTRP9UmnTBYOFvsAFVZbbYQq2SfBtgYGzAa6EiAI";
const SHEET_RANGE = "Sheet1!A:BN";
const SITE_URL = "https://workshop.bscalex.com/";
const THANK_YOU_URL = "https://workshop.bscalex.com/thank-you";
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/FkuBkYpKFZO2MmzMayll8E";
const WEBINAR_DATE_LABEL = "27th September 2026";
const LEAD_NOTIFICATION_TO = "bharat.hudadalli@gmail.com";

export const SHEET_HEADER = [
  "Lead ID", "Name", "Email", "Phone", "WhatsApp", "Company", "Designation", "City", "State", "Country", "Lead Date", "Lead Time",
  "First Source", "First Medium", "First Campaign", "First Content", "First Term",
  "Last Source", "Last Medium", "Last Campaign", "Last Content", "Last Term",
  "Campaign Name", "Campaign ID", "Ad Set Name", "Ad Set ID", "Ad Name", "Ad ID", "Placement", "Publisher Platform", "Site Source Name",
  "FBCLID", "GCLID", "WBRAID", "GBRAID", "MSCLKID",
  "Landing Page URL", "First Page URL", "Last Page URL", "Referrer", "Page Title", "Registration Page URL", "Thank-You URL", "First Visit At",
  "Device Type", "Operating System", "Browser", "Screen Resolution", "Device Language",
  "User Agent", "Time Zone", "IP / Geo",
  "Lead Event", "Event ID", "Registration Status",
  "Lead Status", "Sales Owner", "Follow-Up Status", "Qualified", "Sales Conversion", "Revenue",
  "Platform Interest", "Form Source", "Extra Params", "Created At", "Updated At",
];

const touchSchema = z
  .object({
    source: z.string().trim().max(300).optional(),
    medium: z.string().trim().max(300).optional(),
    campaign: z.string().trim().max(300).optional(),
    content: z.string().trim().max(300).optional(),
    term: z.string().trim().max(300).optional(),
  })
  .partial()
  .optional();

const stringMap = z.record(z.string().max(60), z.string().max(500)).optional();

const attributionSchema = z
  .object({
    firstTouch: touchSchema,
    lastTouch: touchSchema,
    landingPageUrl: z.string().trim().max(800).optional(),
    firstPageUrl: z.string().trim().max(800).optional(),
    lastPageUrl: z.string().trim().max(800).optional(),
    pageUrl: z.string().trim().max(800).optional(),
    pageTitle: z.string().trim().max(300).optional(),
    referrer: z.string().trim().max(800).optional(),
    firstVisitAt: z.string().trim().max(60).optional(),
    metaAttribution: z
      .object({
        campaignName: z.string().max(300).optional(), campaignId: z.string().max(120).optional(),
        adsetName: z.string().max(300).optional(), adsetId: z.string().max(120).optional(),
        adName: z.string().max(300).optional(), adId: z.string().max(120).optional(),
        placement: z.string().max(200).optional(), publisherPlatform: z.string().max(120).optional(),
        siteSourceName: z.string().max(120).optional(),
      })
      .partial()
      .optional(),
    clickIds: z
      .object({
        fbclid: z.string().max(500).optional(), gclid: z.string().max(500).optional(),
        wbraid: z.string().max(500).optional(), gbraid: z.string().max(500).optional(),
        msclkid: z.string().max(500).optional(),
      })
      .partial()
      .optional(),
    extraParams: stringMap,
    firstParams: stringMap,
    lastParams: stringMap,
    device: z
      .object({
        deviceType: z.string().max(40).optional(), operatingSystem: z.string().max(40).optional(),
        browser: z.string().max(80).optional(), screenResolution: z.string().max(40).optional(),
        deviceLanguage: z.string().max(40).optional(), timeZone: z.string().max(80).optional(),
        userAgent: z.string().max(500).optional(),
      })
      .partial()
      .nullable()
      .optional(),
  })
  .partial()
  .optional();

const leadSchema = z.object({
  source: z.enum(["growth_audit", "contact"]),
  formName: z.string().trim().max(80).optional(),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  companyName: z.string().trim().max(120).optional(),
  designation: z.string().trim().max(120).optional(),
  websiteUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).optional(),
  monthlyBudget: z.string().trim().max(80).optional(),
  platform: z.string().trim().max(80).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(1500),
  // Legacy flat UTM fields (kept so older links keep working).
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmAdset: z.string().trim().max(200).optional(),
  utmAd: z.string().trim().max(200).optional(),
  utmPlacement: z.string().trim().max(200).optional(),
  utmDevice: z.string().trim().max(100).optional(),
  attribution: attributionSchema,
});

type LeadInput = z.infer<typeof leadSchema>;
type LeadRecord = LeadInput & { leadRef: string; eventId: string; createdAt: string };

const asText = (value: string | undefined | null) => {
  const text = (value ?? "").toString();
  // Prevent Google Sheets from interpreting +91… or =… as a formula.
  return /^[+=\-@]/.test(text) ? `'${text}` : text;
};

function buildRow(lead: LeadRecord) {
  const attribution = lead.attribution ?? {};
  const first = attribution.firstTouch ?? {};
  const last = attribution.lastTouch ?? {};
  const meta = attribution.metaAttribution ?? {};
  const clicks = attribution.clickIds ?? {};
  const device = attribution.device ?? {};
  const created = new Date(lead.createdAt);
  const inIndia = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", ...options }).format(created);

  return [
    lead.leadRef,
    lead.fullName,
    lead.email,
    asText(lead.phone),
    asText(lead.phone),
    lead.companyName ?? "",
    lead.designation ?? "",
    lead.city ?? "",
    lead.state ?? "",
    lead.country ?? "",
    inIndia({ day: "2-digit", month: "short", year: "numeric" }),
    inIndia({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    first.source ?? "", first.medium ?? "", first.campaign ?? "", first.content ?? "", first.term ?? "",
    last.source ?? "", last.medium ?? "", last.campaign ?? "", last.content ?? "", last.term ?? "",
    meta.campaignName ?? lead.utmCampaign ?? "", meta.campaignId ?? "",
    meta.adsetName ?? lead.utmAdset ?? "", meta.adsetId ?? "",
    meta.adName ?? lead.utmAd ?? "", meta.adId ?? "",
    meta.placement ?? lead.utmPlacement ?? "", meta.publisherPlatform ?? "", meta.siteSourceName ?? "",
    clicks.fbclid ?? "", clicks.gclid ?? "", clicks.wbraid ?? "", clicks.gbraid ?? "", clicks.msclkid ?? "",
    attribution.landingPageUrl ?? "", attribution.firstPageUrl ?? "", attribution.lastPageUrl ?? "",
    attribution.referrer ?? "", attribution.pageTitle ?? "",
    attribution.pageUrl ?? SITE_URL, THANK_YOU_URL, attribution.firstVisitAt ?? "",
    device.deviceType ?? "", device.operatingSystem ?? "", device.browser ?? "",
    device.screenResolution ?? "", device.deviceLanguage ?? "",
    device.userAgent ?? "", device.timeZone ?? "", "",
    "Lead", lead.eventId, "Registered",
    "New", "", "", "", "", "",
    lead.platform ?? "", lead.formName ?? lead.source, JSON.stringify(attribution.extraParams ?? {}),
    lead.createdAt, lead.createdAt,
  ];
}

async function appendToSheet(lead: LeadRecord) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lovableKey || !connectionKey) return;

  const response = await fetch(
    `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ majorDimension: "ROWS", values: [buildRow(lead)] }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    console.error(`Google Sheets sync failed [${response.status}]: ${body}`);
  }
}

function encodeBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function mimeHeader(value: string) {
  return /^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${encodeBase64(value)}?=`;
}

async function sendGmailMessage(to: string, subject: string, body: string, contentType = "text/html") {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !connectionKey) return;

  const raw = [
    `To: ${to}`,
    `Subject: ${mimeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: ${contentType}; charset="UTF-8"`,
    "",
    body,
  ].join("\r\n");

  const message = encodeBase64(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const response = await fetch(
    "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: message }),
    },
  );
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Gmail send failed [${response.status}]: ${errorBody}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendThankYouEmail(lead: LeadRecord) {
  const firstName = escapeHtml(lead.fullName.trim().split(/\s+/)[0] ?? lead.fullName);
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Free Seat Is Confirmed</title></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;padding-bottom:24px;">
      <div style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:12px;font-weight:bold;letter-spacing:1px;padding:6px 16px;border-radius:999px;">100% FREE &bull; SEAT CONFIRMED</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:26px;line-height:1.25;color:#111111;text-align:center;">You're In, ${firstName}!</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444444;text-align:center;">
      Your free seat for the <strong>BscaleX Marketplace Growth Webinar</strong> on
      <strong style="color:#16a34a;">${WEBINAR_DATE_LABEL}</strong> is confirmed.
      90 minutes live &bull; English only &bull; No fees, ever.
    </p>
    <div style="background-color:#f6fef9;border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:16px;font-weight:bold;color:#111111;">One step left: join the attendees-only community</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#444444;">
        The webinar joining link, reminders, bonus resources and every update are shared only inside the WhatsApp community &mdash; so you never miss anything.
      </p>
      <a href="${WHATSAPP_COMMUNITY_URL}" style="display:inline-block;background-color:#25d366;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:10px;box-shadow:0 4px 0 #128c4b;">JOIN THE WHATSAPP COMMUNITY</a>
    </div>
    <div style="background-color:#f8f8f8;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#111111;">What happens next</p>
      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#444444;">1. Join the WhatsApp community above &mdash; the joining link is shared there.</p>
      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#444444;">2. Save the date: <strong>${WEBINAR_DATE_LABEL}</strong>, 90 minutes, live.</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#444444;">3. Bring your top marketplace or q-commerce question &mdash; Bharat answers live.</p>
    </div>
    <p style="margin:0 0 4px;font-size:13px;color:#666666;text-align:center;">
      See you live &mdash; <strong>Bharat Hudadalli</strong>, BscaleX
    </p>
    <p style="margin:0 0 4px;font-size:12px;color:#999999;text-align:center;">Your registration ID: ${escapeHtml(lead.leadRef)}</p>
    <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
      <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none;">workshop.bscalex.com</a>
    </p>
  </div>
</body>
</html>`;

  await sendGmailMessage(lead.email, "Your Free Seat Is Confirmed - BscaleX Webinar (27th Sep)", html);
}

async function sendLeadEmail(lead: LeadRecord) {
  const attribution = lead.attribution ?? {};
  const first = attribution.firstTouch ?? {};
  const last = attribution.lastTouch ?? {};
  const meta = attribution.metaAttribution ?? {};
  const clicks = attribution.clickIds ?? {};
  const device = attribution.device ?? {};

  const rows: Array<[string, string]> = [
    ["Lead ID", lead.leadRef],
    ["Name", lead.fullName],
    ["Email", lead.email],
    ["WhatsApp / Phone", lead.phone ?? "-"],
    ["City", lead.city ?? "-"],
    ["Platform interest", lead.platform ?? "-"],
    ["Form", lead.formName ?? lead.source],
    ["First touch", `${first.source ?? "-"} / ${first.medium ?? "-"} / ${first.campaign ?? "-"}`],
    ["Last touch", `${last.source ?? "-"} / ${last.medium ?? "-"} / ${last.campaign ?? "-"}`],
    ["Campaign", `${meta.campaignName ?? "-"} (${meta.campaignId ?? "-"})`],
    ["Ad set", `${meta.adsetName ?? "-"} (${meta.adsetId ?? "-"})`],
    ["Ad", `${meta.adName ?? "-"} (${meta.adId ?? "-"})`],
    ["Placement", meta.placement ?? "-"],
    ["Publisher platform", meta.publisherPlatform ?? "-"],
    ["Site source name", meta.siteSourceName ?? "-"],
    ["Click IDs", `fbclid=${clicks.fbclid ?? "-"} gclid=${clicks.gclid ?? "-"}`],
    ["Landing page", attribution.landingPageUrl ?? "-"],
    ["Referrer", attribution.referrer ?? "-"],
    ["Device", `${device.deviceType ?? "-"} / ${device.operatingSystem ?? "-"} / ${device.browser ?? "-"}`],
    ["Screen", device.screenResolution ?? "-"],
    ["Time zone", device.timeZone ?? "-"],
    ["Event ID", lead.eventId],
    ["Received at", lead.createdAt],
  ];

  const body = ["New Lead Received", "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\r\n");
  await sendGmailMessage(LEAD_NOTIFICATION_TO, "New Lead Received", body, "text/plain");
}

function leadRefFor(sequence: number, date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date).replace(/-/g, "");
  return `BSX-${parts}-${String(sequence).padStart(4, "0")}`;
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Lead capture is not configured.");

    const client = createClient(url, key, { auth: { persistSession: false } });
    const createdAt = new Date();
    const eventId = crypto.randomUUID();
    const attribution = data.attribution ?? {};
    const meta = attribution.metaAttribution ?? {};
    const clicks = attribution.clickIds ?? {};
    const device = attribution.device ?? {};

    // Sequential Lead ID per day (BSX-YYYYMMDD-0001), retried on a unique clash.
    const startOfDayIst = new Date(createdAt.getTime());
    startOfDayIst.setUTCHours(startOfDayIst.getUTCHours() + 5, startOfDayIst.getUTCMinutes() + 30, 0, 0);
    const dayStart = new Date(Date.UTC(startOfDayIst.getUTCFullYear(), startOfDayIst.getUTCMonth(), startOfDayIst.getUTCDate()) - 5.5 * 3_600_000);
    // Counting needs to bypass row-level security: visitors have no read access to
    // leads, so an anon count always returns null and every lead would collide on
    // BSX-…-0001.
    let count: number | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const result = await supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString());
      count = result.count ?? null;
    } catch (cause) {
      console.error("Lead count failed:", cause);
    }

    let leadRef = leadRefFor((count ?? 0) + 1, createdAt);
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      const { error } = await client.from("leads").insert({
        source: data.source,
        // Required explicitly: the insert policy checks status, and relying on the
        // column default fails the row-level security check.
        status: "new",
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        company_name: data.companyName || null,
        designation: data.designation || null,
        website_url: data.websiteUrl || null,
        monthly_budget: data.monthlyBudget || null,
        platform: data.platform || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        message: data.message,
        lead_ref: leadRef,
        event_id: eventId,
        utm_source: attribution.lastTouch?.source || data.utmSource || null,
        utm_medium: attribution.lastTouch?.medium || data.utmMedium || null,
        utm_campaign: attribution.lastTouch?.campaign || data.utmCampaign || null,
        utm_adset: meta.adsetName || data.utmAdset || null,
        utm_ad: meta.adName || data.utmAd || null,
        utm_placement: meta.placement || data.utmPlacement || null,
        utm_device: device.deviceType || data.utmDevice || null,
        device_type: device.deviceType || null,
        operating_system: device.operatingSystem || null,
        browser: device.browser || null,
        screen_resolution: device.screenResolution || null,
        device_language: device.deviceLanguage || null,
        time_zone: device.timeZone || null,
        user_agent: device.userAgent || null,
        landing_page_url: attribution.landingPageUrl || null,
        first_page_url: attribution.firstPageUrl || null,
        last_page_url: attribution.lastPageUrl || null,
        referrer: attribution.referrer || null,
        fbclid: clicks.fbclid || null,
        gclid: clicks.gclid || null,
        wbraid: clicks.wbraid || null,
        gbraid: clicks.gbraid || null,
        msclkid: clicks.msclkid || null,
        first_touch: attribution.firstTouch ?? null,
        last_touch: attribution.lastTouch ?? null,
        meta_attribution: meta,
        extra_params: attribution.extraParams ?? {},
        lead_status: "New",
      });
      if (!error) {
        inserted = true;
        break;
      }
      if (error.code === "23505" || error.code === "23514" || /duplicate key/i.test(error.message)) {
        leadRef = leadRefFor((count ?? 0) + 2 + attempt, createdAt);
        continue;
      }
      console.error("Lead insert failed:", error);
      throw new Error("DBG insert: " + JSON.stringify(error));
    }
    if (!inserted) throw new Error("DBG not inserted");

    const record: LeadRecord = { ...data, leadRef, eventId, createdAt: createdAt.toISOString() };

    // Best-effort integrations — a sheet or mail failure must not block the lead.
    await appendToSheet(record).catch((cause) => console.error("Google Sheets sync error:", cause));
    await sendLeadEmail(record).catch((cause) => console.error("Lead email error:", cause));
    await sendThankYouEmail(record).catch((cause) => console.error("Thank-you email error:", cause));

    return { success: true, leadRef, eventId };
  });
