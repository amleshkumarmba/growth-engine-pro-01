CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL CHECK (source IN ('growth_audit', 'contact')),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 255),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
  company_name TEXT CHECK (company_name IS NULL OR char_length(company_name) <= 120),
  website_url TEXT CHECK (website_url IS NULL OR char_length(website_url) <= 500),
  monthly_budget TEXT CHECK (monthly_budget IS NULL OR char_length(monthly_budget) <= 80),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 1500),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed'))
);

GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can submit lead enquiries"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND source IN ('growth_audit', 'contact')
  AND char_length(full_name) BETWEEN 2 AND 100
  AND char_length(email) <= 255
);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_status_idx ON public.leads (status);