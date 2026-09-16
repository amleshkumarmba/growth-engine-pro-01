import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const SHEET_ID = "1NLoxTRP9UmnTBYOFvsAFVZbbYQq2SfBtgYGzAa6EiAI";
const SHEET_RANGE = "Sheet1!A:R";

const leadSchema = z.object({
  source: z.enum(["growth_audit", "contact"]),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  companyName: z.string().trim().max(120).optional(),
  websiteUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).optional(),
  monthlyBudget: z.string().trim().max(80).optional(),
  platform: z.string().trim().max(80).optional(),
  city: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(1500),
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmAdset: z.string().trim().max(200).optional(),
  utmAd: z.string().trim().max(200).optional(),
  utmPlacement: z.string().trim().max(200).optional(),
  utmDevice: z.string().trim().max(100).optional(),
});

async function appendToSheet(data: z.infer<typeof leadSchema>) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lovableKey || !connectionKey) return;

  const asSheetText = (value: string | undefined) => {
    const text = value ?? "";
    // Prevent Google Sheets from interpreting +91... as a formula.
    return text.startsWith("+") ? `'${text}` : text;
  };
  const row = [
    new Date().toISOString(),
    data.source,
    data.fullName,
    data.email,
    asSheetText(data.phone),
    data.companyName ?? "",
    data.websiteUrl ?? "",
    data.monthlyBudget ?? "",
    data.platform ?? "",
    data.city ?? "",
    data.message,
    data.utmSource ?? "",
    data.utmMedium ?? "",
    data.utmCampaign ?? "",
    data.utmAdset ?? "",
    data.utmAd ?? "",
    data.utmPlacement ?? "",
    data.utmDevice ?? "",
  ];

  const response = await fetch(
    `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ majorDimension: "ROWS", values: [row] }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    console.error(`Google Sheets sync failed [${response.status}]: ${body}`);
  }
}

const LEAD_NOTIFICATION_TO = "bharat.hudadalli@gmail.com";

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

async function sendGmailMessage(to: string, subject: string, htmlBody: string) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !connectionKey) return;

  const raw = [
    `To: ${to}`,
    `Subject: ${mimeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    htmlBody,
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

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/FkuBkYpKFZO2MmzMayll8E";
const SITE_URL = "https://workshop.bscalex.com/";
const WEBINAR_DATE_LABEL = "27th September 2026";

async function sendThankYouEmail(data: z.infer<typeof leadSchema>) {
  const firstName = escapeHtml(data.fullName.trim().split(/\s+/)[0] ?? data.fullName);
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
    <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
      <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none;">workshop.bscalex.com</a>
    </p>
  </div>
</body>
</html>`;

  await sendGmailMessage(data.email, "Your Free Seat Is Confirmed - BscaleX Webinar (27th Sep)", html);
}

async function sendLeadEmail(data: z.infer<typeof leadSchema>) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !connectionKey) return;

  const rows: Array<[string, string]> = [
    ["Name", data.fullName],
    ["Email", data.email],
    ["WhatsApp / Phone", data.phone ?? "-"],
    ["City", data.city ?? "-"],
    ["Platform interest", data.platform ?? "-"],
    ["Company", data.companyName ?? "-"],
    ["Website", data.websiteUrl ?? "-"],
    ["Monthly budget", data.monthlyBudget ?? "-"],
    ["Message", data.message],
    ["Form", data.source],
    ["UTM source", data.utmSource ?? "-"],
    ["UTM medium", data.utmMedium ?? "-"],
    ["UTM campaign", data.utmCampaign ?? "-"],
    ["UTM ad set", data.utmAdset ?? "-"],
    ["UTM ad", data.utmAd ?? "-"],
    ["UTM placement", data.utmPlacement ?? "-"],
    ["UTM device", data.utmDevice ?? "-"],
    ["Received at", new Date().toISOString()],
  ];

  const body = ["New Lead Received", "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\r\n");
  const raw = [
    `To: ${LEAD_NOTIFICATION_TO}`,
    `Subject: ${mimeHeader("New Lead Received")}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
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
    console.error(`Lead email send failed [${response.status}]: ${errorBody}`);
  }
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Lead capture is not configured.");

    const client = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client.from("leads").insert({
      source: data.source,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      company_name: data.companyName || null,
      website_url: data.websiteUrl || null,
      monthly_budget: data.monthlyBudget || null,
      platform: data.platform || null,
      city: data.city || null,
      message: data.message,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      utm_adset: data.utmAdset || null,
      utm_ad: data.utmAd || null,
      utm_placement: data.utmPlacement || null,
      utm_device: data.utmDevice || null,
    });
    if (error) throw new Error("Your request could not be submitted. Please try again.");

    // Best-effort sheet sync — a sheet failure must not block the lead.
    await appendToSheet(data).catch((cause) => console.error("Google Sheets sync error:", cause));

    // Best-effort email alert — a mail failure must not block the lead.
    await sendLeadEmail(data).catch((cause) => console.error("Lead email error:", cause));

    // Best-effort thank-you email to the registrant with the WhatsApp community link.
    await sendThankYouEmail(data).catch((cause) => console.error("Thank-you email error:", cause));

    return { success: true };
  });
