/**
 * Room-level realtime sync engine.
 * Subscribes to rooms + players tables and keeps the Zustand store in sync.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/store/gameStore';
import type { GamePhase, Player } from '@/types/game';
import type { Database } from '@/integrations/supabase/types';

type PlayerRow = Database['public']['Tables']['players']['Row'];
type RoomRow = Database['public']['Tables']['rooms']['Row'];

let roomChannel: RealtimeChannel | null = null;
let playersChannel: RealtimeChannel | null = null;

const mapPlayerRowToPlayer = (row: PlayerRow): Player =>
  row.player_state as unknown as Player;

// ── Sync players from DB into Zustand ──
export const syncPlayersFromCloud = async (roomId: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error || !data) return;

  useGameStore.setState({ players: data.map(mapPlayerRowToPlayer) });
};

// ── Sync room state from DB into Zustand ──
export const syncRoomFromCloud = async (roomId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error || !data) return;

  const gameState = (data.game_state || {}) as Record<string, unknown>;

  // Merge room columns + game_state JSON into Zustand
  const patch: Record<string, unknown> = {
    phase: data.phase as GamePhase,
  };

  if (data.selected_district !== undefined) patch.selectedDistrict = data.selected_district;
  if (data.current_bet !== undefined) patch.currentBet = data.current_bet ?? 0;
  if (data.battle_participants !== undefined) patch.battleParticipants = data.battle_participants ?? [];
  if (data.active_player_id !== undefined) patch.activePlayerId = data.active_player_id;
  if (data.active_duelist_id !== undefined) patch.activeDuelistId = data.active_duelist_id;
  if (data.timer_end_at !== undefined) patch.timerEndAt = data.timer_end_at;

  // Merge game_state JSON fields
  if (gameState.currentChallenge !== undefined) patch.currentChallenge = gameState.currentChallenge;
  if (gameState.currentPlayerIndex !== undefined) patch.currentPlayerIndex = gameState.currentPlayerIndex;
  if (gameState.districtMandates !== undefined) patch.districtMandates = gameState.districtMandates;
  if (gameState.newsHeadlines !== undefined) patch.newsHeadlines = gameState.newsHeadlines;
  if (gameState.selectedCategory !== undefined) patch.selectedCategory = gameState.selectedCategory;
  if (gameState.battleInviteData !== undefined) patch.battleInviteData = gameState.battleInviteData;
  if (gameState.duelState !== undefined) patch.duelState = gameState.duelState;

  useGameStore.setState(patch as any);
};

// ── Push room state TO Supabase ──
export const pushRoomState = async (partial?: Record<string, unknown>) => {
  const state = useGameStore.getState();
  if (!state.roomId) return;

  // JSON blob for complex state
  const gameState = {
    currentChallenge: state.currentChallenge,
    currentPlayerIndex: state.currentPlayerIndex,
    districtMandates: state.districtMandates,
    newsHeadlines: state.newsHeadlines,
    selectedCategory: state.selectedCategory,
    battleInviteData: (state as any).battleInviteData ?? null,
    duelState: (state as any).duelState ?? null,
  };

  await supabase
    .from('rooms')
    .update({
      phase: state.phase,
      selected_district: state.selectedDistrict,
      current_bet: state.currentBet,
      battle_participants: state.battleParticipants,
      active_player_id: (state as any).activePlayerId ?? null,
      active_duelist_id: (state as any).activeDuelistId ?? null,
      timer_end_at: (state as any).timerEndAt ?? null,
      game_state: gameState as any,
    })
    .eq('id', state.roomId);
};

// ── Push player state TO Supabase ──
export const pushPlayerState = async (player: Player) => {
  const { roomId } = useGameStore.getState();
  if (!roomId) return;

  await supabase
    .from('players')
    .update({ player_state: player as unknown as Database['public']['Tables']['players']['Update']['player_state'] })
    .eq('room_id', roomId)
    .eq('player_id', player.id);
};

// ── Connect realtime channels ──
export const connectRealtime = (roomId: string) => {
  disconnectRealtime();

  // Room channel
  roomChannel = supabase
    .channel(`room-sync-${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      () => { void syncRoomFromCloud(roomId); }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') void syncRoomFromCloud(roomId);
    });

  // Players channel
  playersChannel = supabase
    .channel(`room-players-${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
      () => { void syncPlayersFromCloud(roomId); }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') void syncPlayersFromCloud(roomId);
    });
};

export const disconnectRealtime = () => {
  if (roomChannel) { supabase.removeChannel(roomChannel); roomChannel = null; }
  if (playersChannel) { supabase.removeChannel(playersChannel); playersChannel = null; }
};
