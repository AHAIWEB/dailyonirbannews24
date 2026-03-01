
CREATE OR REPLACE FUNCTION public.generate_reporter_id()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.reporters;
  new_id := 'BK-' || LPAD(counter::TEXT, 4, '0');
  WHILE EXISTS (SELECT 1 FROM public.reporters WHERE reporter_id = new_id) LOOP
    counter := counter + 1;
    new_id := 'BK-' || LPAD(counter::TEXT, 4, '0');
  END LOOP;
  RETURN new_id;
END;
$$;
