/**
 * Mandate transaction logger — logs every mandate change to Supabase
 */
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';

export type TransactionType = 'win' | 'loss' | 'penalty' | 'treasury_transfer' | 'bonus' | 'skip_collect';

export const logMandateTransaction = async (
  playerId: string,
  playerName: string,
  amount: number,
  type: TransactionType,
  description?: string,
) => {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;

  await supabase.from('mandate_transactions').insert({
    room_id: roomId,
    player_id: playerId,
    player_name: playerName,
    amount,
    transaction_type: type,
    description: description || null,
  });
};

export const updatePublicTreasury = async (amount: number) => {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;

  // Fetch current treasury and update
  const { data } = await supabase
    .from('rooms')
    .select('public_treasury')
    .eq('id', roomId)
    .single();

  const current = (data as any)?.public_treasury ?? 0;

  await supabase
    .from('rooms')
    .update({ public_treasury: Math.max(0, current + amount) } as any)
    .eq('id', roomId);
};
