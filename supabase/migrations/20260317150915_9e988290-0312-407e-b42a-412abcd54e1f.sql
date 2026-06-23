
-- Add dedicated sync columns to rooms for real-time multiplayer
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS active_player_id text,
ADD COLUMN IF NOT EXISTS active_duelist_id text,
ADD COLUMN IF NOT EXISTS selected_district text,
ADD COLUMN IF NOT EXISTS current_bet integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS battle_participants text[] DEFAULT '{}';
