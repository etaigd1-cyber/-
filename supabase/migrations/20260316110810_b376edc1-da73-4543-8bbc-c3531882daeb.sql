
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public can create room" ON public.rooms;
DROP POLICY IF EXISTS "Public can update room state" ON public.rooms;

DROP POLICY IF EXISTS "Public can read players in rooms" ON public.players;
DROP POLICY IF EXISTS "Public can insert players in rooms" ON public.players;
DROP POLICY IF EXISTS "Public can update players in rooms" ON public.players;
DROP POLICY IF EXISTS "Public can delete players in rooms" ON public.players;

-- Simple open policies for public game (no auth)
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete rooms" ON public.rooms FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Anyone can read players" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert players" ON public.players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE TO anon, authenticated USING (true);
