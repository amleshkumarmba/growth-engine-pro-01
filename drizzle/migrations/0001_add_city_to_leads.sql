ALTER TABLE public.leads ADD COLUMN city TEXT CHECK (city IS NULL OR char_length(city) <= 120);

GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;