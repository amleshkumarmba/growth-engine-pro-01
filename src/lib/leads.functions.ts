import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const SHEET_ID = "1NLoxTRP9UmnTBYOFvsAFVZbbYQq2SfBtgYGzAa6EiAI";
const SHEET_RANGE = "Sheet1!A:Q";

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

  const row = [
    new Date().toISOString(),
    data.source,
    data.fullName,
    data.email,
    data.phone ?? "",
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

    return { success: true };
  });
