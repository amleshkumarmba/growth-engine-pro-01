import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const leadSchema = z.object({
  source: z.enum(["growth_audit", "contact"]),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  companyName: z.string().trim().max(120).optional(),
  websiteUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).optional(),
  monthlyBudget: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(1500),
});

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
      message: data.message,
    });
    if (error) throw new Error("Your request could not be submitted. Please try again.");
    return { success: true };
  });