ALTER TABLE public.leads ADD COLUMN brand_name TEXT CHECK (brand_name IS NULL OR char_length(brand_name) <= 120);
COMMENT ON COLUMN public.leads.city IS 'DEPRECATED: replaced by brand_name';
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;