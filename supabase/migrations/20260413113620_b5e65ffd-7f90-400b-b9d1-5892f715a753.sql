
-- Create mandate transactions table
CREATE TABLE public.mandate_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('win', 'loss', 'penalty', 'treasury_transfer', 'bonus', 'skip_collect')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mandate_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read transactions" ON public.mandate_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.mandate_transactions FOR INSERT WITH CHECK (true);

CREATE INDEX idx_mandate_transactions_room ON public.mandate_transactions(room_id);
CREATE INDEX idx_mandate_transactions_player ON public.mandate_transactions(player_id);

-- Add public treasury to rooms
ALTER TABLE public.rooms ADD COLUMN public_treasury INTEGER NOT NULL DEFAULT 0;
