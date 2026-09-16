-- Schema already exists on project wijcuubjktydztxtnkcv
-- (regions, cities, places, categories, cultural_zones, eco_tags, phrases, …)
--
-- This migration is intentionally a no-op so local `supabase db push`
-- does not conflict with the remote schema.
--
-- App reads from: public.places (+ joins cities/regions/cultural_zones/categories)

select 1;
