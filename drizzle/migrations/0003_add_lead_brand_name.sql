ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS brand_name text;

COMMENT ON COLUMN public.leads.city IS 'DEPRECATED: the registration form now asks for brand name instead of city; use brand_name.';