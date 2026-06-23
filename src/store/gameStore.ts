import { create } from 'zustand';
import { cleanAnswerText } from '@/lib/fetchGameData';
import type { GameState, GamePhase, Player, ChallengeCategory, Challenge, PartyId, Interest, WowEvent, DistrictId, NewsHeadline, ChallengeDifficulty, SecretMemo as SecretMemoType, AgeGroup, DifficultyLevel } from '@/types/game';
import { DISTRICTS, betToDifficulty, DIFFICULTY_ORDER, getInitialMandates } from '@/types/game';
import { getRandomMission } from '@/lib/challengeBank';
import { logMandateTransaction, updatePublicTreasury } from '@/lib/mandateLogger';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { connectRealtime, pushRoomState, pushPlayerState, syncPlayersFromCloud } from '@/lib/roomSync';
import {
  generateDistrictHeadline, generateAllianceHeadline, generateBetrayalHeadline,
  generateChallengeHeadline, generateWowHeadline, generateAmbientHeadline,
  generatePlayerJoinHeadline, generateBattleJoinHeadline,
} from '@/lib/headlineGenerator';

const generateRoomCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const initialCategoryStats = (): Record<ChallengeCategory, { won: number; lost: number }> => ({
  knowledge: { won: 0, lost: 0 },
  mission: { won: 0, lost: 0 },
  debate: { won: 0, lost: 0 },
});

const makeHeadline = (text: string, type: NewsHeadline['type'] = 'update'): NewsHeadline => ({
  id: crypto.randomUUID(), text, type, timestamp: Date.now(),
});

const pushHeadline = (headlines: NewsHeadline[], text: string, type: NewsHeadline['type'] = 'update') =>
  [makeHeadline(text, type), ...headlines].slice(0, 25);

const VICTORY_MANDATES = 61;

/** Battle invite data broadcast to all devices */
export interface BattleInviteData {
  initiatorId: string;
  initiatorName: string;
  districtId: DistrictId;
  districtName: string;
  districtEmoji: string;
  bet: number;
  expiresAt: number; // timestamp
}

/** Duel state synced across all devices */
export interface DuelState {
  participants: DuelParticipant[];
  activeDuelistId: string;
  currentQuestion: Challenge | null;
  questionIndex: number;
  isRevealed: boolean;
  selectedAnswer: string | null;
  winnerId: string | null;
  isOver: boolean;
  /** Pending penalty selections for losers */
  pendingPenalties: PendingPenalty[];
}

export interface PendingPenalty {
  playerId: string;
  playerName: string;
  resolved: boolean;
  /** Which district they chose to lose 2 mandates from */
  selectedDistrict: DistrictId | null;
}

export interface DuelParticipant {
  playerId: string;
  playerName: string;
  partyId: PartyId;
  bet: number;
  eliminated: boolean;
}

interface GameStore extends GameState {
  // Local device identity
  localPlayerId: string | null;
  setLocalPlayerId: (id: string) => void;

  // Battle invite
  battleInviteData: BattleInviteData | null;

  // Duel state
  duelState: DuelState | null;

  // Active player/duelist IDs (synced via room columns)
  activePlayerId: string | null;
  activeDuelistId: string | null;

  // Synced timer end timestamp
  timerEndAt: string | null;

  // Anti-repeat tracking
  _askedQuestionIds: Set<number>;

  // Debounce guard
  _lastNextTurnAt: number;

  setPhase: (phase: GamePhase) => void;
  startGame: () => Promise<void>;
  createRoom: () => Promise<boolean>;
  joinRoom: (code: string) => Promise<boolean>;
  addPlayer: (name: string, age: number, interests: Interest[], party: PartyId) => void;
  removePlayer: (id: string) => void;
  rollDice: () => void;
  setBet: (amount: number) => void;
  joinBattle: (playerId: string) => void;
  selectCategory: (cat: ChallengeCategory) => void;
  selectDistrict: (district: DistrictId) => void;
  setCurrentChallenge: (c: Challenge | null) => void;
  setTimer: (s: number) => void;
  setTimerEndAt: (ts: string | null) => void;
  castVote: (playerId: string, success: boolean) => void;
  resolveRound: (winnerId: string) => void;
  nextTurn: () => void;
  setChallenges: (c: Challenge[]) => void;
  triggerWowEvent: () => void;
  usePower: (playerId: string) => void;
  formAlliance: (p1: string, p2: string) => void;
  betray: (betrayerId: string, targetId: string) => void;
  getFilteredChallenges: (playerAge: number, category: ChallengeCategory, interests?: Interest[], bet?: number) => Challenge[];
  resetBattle: () => void;
  addNewsHeadline: (text: string, type?: NewsHeadline['type']) => void;
  addMandates: (playerId: string, amount: number) => void;
  sendMemo: (fromId: string, toId: string, message: string) => void;
  markMemosRead: (playerId: string) => void;
  addCodeToBank: (playerId: string, value: number) => void;
  useCode: (playerId: string, codeId: string) => void;
  addCrowdReaction: (playerId: string, type: 'clap' | 'boo') => void;
  triggerNationalCrisis: () => void;
  getAvailableMandates: (districtId: DistrictId) => number;

  // Multiplayer actions
  broadcastBattleInvite: (bet: number) => void;
  joinBattleInvite: (playerId: string, bet: number) => void;
  startDuel: () => void;
  submitDuelAnswer: (answer: string) => void;
  advanceDuel: () => void;
  resolvePenalty: (playerId: string, districtId: DistrictId | null, mode: 'personal' | 'district') => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'landing',
  roomCode: '',
  roomId: null,
  players: [],
  currentPlayerIndex: 0,
  diceValues: [1, 1],
  currentBet: 0,
  battleParticipants: [],
  selectedCategory: null,
  selectedDistrict: null,
  currentChallenge: null,
  timerSeconds: 30,
  votes: {},
  wowEvent: null,
  challenges: [],
  crowdReaction: { claps: 0, boos: 0, voters: [] },
  challengeDifficulty: 'normal' as ChallengeDifficulty,
  activeCodeValue: null,
  crisisActive: false,
  districtMandates: {},
  newsHeadlines: [
    makeHeadline('The 61st Seat — מי יגיע ל-61 ראשון?', 'breaking'),
    makeHeadline('סקר: המרוץ ל-61 מנדטים מתחיל!', 'poll'),
    makeHeadline(generateAmbientHeadline(), 'update'),
  ],
  localPlayerId: null,
  battleInviteData: null,
  duelState: null,
  activePlayerId: null,
  activeDuelistId: null,
  timerEndAt: null,
  _askedQuestionIds: new Set<number>(),
  _lastNextTurnAt: 0,

  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  setTimerEndAt: (ts) => {
    set({ timerEndAt: ts });
    void pushRoomState();
  },

  setPhase: (phase) => {
    set({ phase });
    void pushRoomState();
  },

  startGame: async () => {
    const { players, roomId } = get();
    if (players.length < 2) return;

    const initial = getInitialMandates(players.length);

    // Update each player's starting mandates ("Party Base")
    const updatedPlayers: Player[] = players.map((p) => ({
      ...p,
      mandates: initial,
    }));

    set((s) => ({
      players: updatedPlayers,
      phase: 'district-select',
      newsHeadlines: pushHeadline(
        s.newsHeadlines,
        initial > 0
          ? `מימון מפלגתי הובטח: כל מפלגה פותחת עם ${initial} מנדטי בסיס 💰`
          : 'דו-קרב פוליטי: שתי מפלגות בלבד — מתחילים מאפס! ⚖️',
        'breaking',
      ),
    }));

    // Persist starting mandates per player + log transactions
    if (roomId && initial > 0) {
      await Promise.all(
        updatedPlayers.map(async (p) => {
          await pushPlayerState(p);
          await logMandateTransaction(
            p.id,
            p.name,
            initial,
            'bonus',
            `מנדטי בסיס (${players.length} שחקנים)`,
          );
        }),
      );
    } else if (roomId) {
      await Promise.all(updatedPlayers.map((p) => pushPlayerState(p)));
    }

    void pushRoomState();
  },


  createRoom: async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const roomCode = generateRoomCode();
      const { data, error } = await supabase
        .from('rooms')
        .insert({ room_code: roomCode, phase: 'lobby' })
        .select('id, room_code')
        .single();

      if (!error && data) {
        set({ roomCode: data.room_code, roomId: data.id, phase: 'lobby', players: [] });
        connectRealtime(data.id);
        return true;
      }
    }
    return false;
  },

  joinRoom: async (code) => {
    const normalized = code.trim();
    const { data, error } = await supabase
      .from('rooms')
      .select('id, room_code, phase')
      .eq('room_code', normalized)
      .maybeSingle();

    if (error || !data) return false;

    set({ roomCode: data.room_code, roomId: data.id, phase: (data.phase as GamePhase) || 'lobby' });
    connectRealtime(data.id);
    await syncPlayersFromCloud(data.id);
    return true;
  },

  addPlayer: (name, age, interests, party) => {
    const player: Player = {
      id: crypto.randomUUID(),
      name, age, interests, party,
      mandates: 0, battlesWon: 0, battlesLost: 0,
      categoryStats: initialCategoryStats(),
      powerUsed: false, reputation: 100,
      alliances: [], powerBank: [], memos: [], unreadMemos: 0, freezeTurns: 0,
    };

    const { roomId } = get();

    // Save local player identity
    set((s) => ({
      localPlayerId: player.id,
      players: [...s.players, player],
      newsHeadlines: pushHeadline(s.newsHeadlines, generatePlayerJoinHeadline(name, party), 'breaking'),
    }));

    if (roomId) {
      void supabase
        .from('players')
        .insert({
          room_id: roomId,
          player_id: player.id,
          player_state: player as unknown as Database['public']['Tables']['players']['Insert']['player_state'],
        })
        .then(() => void syncPlayersFromCloud(roomId));
    }
  },

  removePlayer: (id) => {
    const { roomId } = get();
    if (roomId) {
      void supabase
        .from('players')
        .delete()
        .eq('room_id', roomId)
        .eq('player_id', id)
        .then(() => void syncPlayersFromCloud(roomId));
    }
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },

  rollDice: () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    set({ diceValues: [d1, d2], phase: 'betting' });
    void pushRoomState();
  },

  getAvailableMandates: (districtId) => {
    const { districtMandates } = get();
    const district = DISTRICTS.find(d => d.id === districtId);
    if (!district) return 0;
    const conquests = districtMandates[districtId] || [];
    const taken = conquests.reduce((sum, c) => sum + c.mandates, 0);
    return Math.max(0, district.maxMandates - taken);
  },

  selectDistrict: (districtId) => {
    const { players, currentPlayerIndex } = get();
    const player = players[currentPlayerIndex];
    set((s) => ({
      selectedDistrict: districtId,
      phase: 'betting',
      activePlayerId: player?.id ?? null,
      newsHeadlines: pushHeadline(s.newsHeadlines, generateDistrictHeadline(player?.name || '', player?.party || 'blue', districtId), 'update'),
    }));
    void pushRoomState();
  },

  setBet: (amount) => {
    const { selectedDistrict } = get();
    const available = get().getAvailableMandates(selectedDistrict!);
    set({ currentBet: Math.min(available, Math.max(1, amount)), phase: 'challenge-join' });
    // Broadcast battle invite
    get().broadcastBattleInvite(Math.min(available, Math.max(1, amount)));
  },

  broadcastBattleInvite: (bet) => {
    const { players, currentPlayerIndex, selectedDistrict } = get();
    const player = players[currentPlayerIndex];
    const district = DISTRICTS.find(d => d.id === selectedDistrict);
    if (!player || !district || !selectedDistrict) return;

    const expiresAt = Date.now() + 9000; // 9 seconds join window

    const inviteData: BattleInviteData = {
      initiatorId: player.id,
      initiatorName: player.name,
      districtId: selectedDistrict,
      districtName: district.name,
      districtEmoji: district.emoji,
      bet,
      expiresAt,
    };

    set({ battleInviteData: inviteData, phase: 'challenge-join', timerEndAt: new Date(expiresAt).toISOString() });
    void pushRoomState();
  },

  joinBattleInvite: (playerId, bet) => {
    set((s) => {
      if (s.battleParticipants.length >= 3 || s.battleParticipants.includes(playerId)) return s;
      const joiner = s.players.find(p => p.id === playerId);
      return {
        battleParticipants: [...s.battleParticipants, playerId],
        newsHeadlines: pushHeadline(s.newsHeadlines, generateBattleJoinHeadline(joiner?.name || '', joiner?.party || 'blue'), 'alert'),
      };
    });
    void pushRoomState();
  },

  joinBattle: (playerId) => {
    set((s) => {
      if (s.battleParticipants.length >= 3 || s.battleParticipants.includes(playerId)) return s;
      const joiner = s.players.find(p => p.id === playerId);
      return {
        battleParticipants: [...s.battleParticipants, playerId],
        newsHeadlines: pushHeadline(s.newsHeadlines, generateBattleJoinHeadline(joiner?.name || '', joiner?.party || 'blue'), 'alert'),
      };
    });
    void pushRoomState();
  },

  selectCategory: (cat) => {
    const { players, currentPlayerIndex, activeCodeValue } = get();
    const player = players[currentPlayerIndex];

    let difficulty: ChallengeDifficulty = 'normal';
    if (activeCodeValue !== null) {
      if (activeCodeValue >= 8) difficulty = 'high-stakes';
      else if (activeCodeValue <= 3) difficulty = 'safe';
    }

    // Knowledge battles are handled entirely by the duel engine.
    // startDuel() picks and tracks its own first question — no need to pick one here
    // (doing so would waste a question from the asked-IDs pool without ever showing it).
    if (cat === 'knowledge') {
      set({
        selectedCategory: cat, currentChallenge: null, timerSeconds: 30,
        phase: 'battle', challengeDifficulty: difficulty,
      });
      get().startDuel();
      return;
    }

    // Mission / debate: pick a challenge from the filtered pool
    const filtered = get().getFilteredChallenges(player?.age ?? 18, cat, player?.interests, get().currentBet);
    let challenge: Challenge | null = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : null;

    // Track asked question IDs to prevent repeats
    if (challenge) {
      set((s) => ({ _askedQuestionIds: new Set([...s._askedQuestionIds, challenge!.id]) }));
    }

    if (!challenge && cat === 'mission') {
      const ageGroup: AgeGroup = (player?.age ?? 18) < 12 ? 'ילד' : (player?.age ?? 18) < 18 ? 'נוער' : 'מבוגר';
      const m = getRandomMission(player?.age ?? 18);
      challenge = {
        id: -1, challengeType: 'mission', question: m.text, options: [],
        correctAnswer: '', ageGroup, interestTag: null, category: 'משימה',
        title: undefined, difficultyLabel: undefined,
      };
    }

    set({
      selectedCategory: cat, currentChallenge: challenge, timerSeconds: 60,
      phase: 'battle', challengeDifficulty: difficulty,
    });
    void pushRoomState();
  },

  startDuel: () => {
    const { players, currentPlayerIndex, battleParticipants, currentBet, challenges } = get();
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;

    const allIds = [currentPlayer.id, ...battleParticipants];
    const participants: DuelParticipant[] = allIds.map(id => {
      const p = players.find(pl => pl.id === id)!;
      return {
        playerId: p.id,
        playerName: p.name,
        partyId: p.party,
        bet: currentBet,
        eliminated: false,
      };
    });

    // Get first question for the first duelist
    const question = getQuestionForPlayer(currentPlayer, challenges, currentBet);

    const duelState: DuelState = {
      participants,
      activeDuelistId: currentPlayer.id,
      currentQuestion: question,
      questionIndex: 0,
      isRevealed: false,
      selectedAnswer: null,
      winnerId: null,
      isOver: false,
      pendingPenalties: [],
    };

    set({ duelState, activeDuelistId: currentPlayer.id });
    void pushRoomState();
  },

  submitDuelAnswer: (answer) => {
    const { duelState, localPlayerId } = get();
    if (!duelState || duelState.activeDuelistId !== localPlayerId) return;
    if (duelState.isRevealed || duelState.selectedAnswer) return;

    set({
      duelState: {
        ...duelState,
        selectedAnswer: answer,
        isRevealed: true,
      },
    });
    void pushRoomState();
  },

  advanceDuel: () => {
    const state = get();
    const { duelState, players, challenges, currentBet, selectedDistrict, currentPlayerIndex, districtMandates } = state;
    if (!duelState) return;

    const isCorrect = duelState.selectedAnswer && duelState.currentQuestion
      ? cleanAnswerText(duelState.selectedAnswer) === cleanAnswerText(duelState.currentQuestion.correctAnswer)
      : false;

    let updatedParticipants = [...duelState.participants];
    const currentDuelistIdx = updatedParticipants.findIndex(p => p.playerId === duelState.activeDuelistId);

    if (!isCorrect) {
      // Eliminate current duelist
      updatedParticipants = updatedParticipants.map(p =>
        p.playerId === duelState.activeDuelistId ? { ...p, eliminated: true } : p
      );
    }

    const remaining = updatedParticipants.filter(p => !p.eliminated);

    // Check for winner or all eliminated
    if (remaining.length <= 1) {
      const winner = remaining[0] || null;
      const initiator = players[currentPlayerIndex];
      const district = DISTRICTS.find(d => d.id === selectedDistrict);

      // Award bet mandates to winner from district pool
      const winnerBet = winner ? winner.bet : currentBet;

      // Identify losing INTERVENERS (everyone eliminated who is NOT the initiator)
      // Initiator is NEVER penalized for losing.
      const losingInterveners = updatedParticipants.filter(
        p => p.eliminated && p.playerId !== initiator?.id,
      );

      set({
        duelState: {
          ...duelState,
          participants: updatedParticipants,
          winnerId: winner?.playerId || null,
          isOver: true,
          selectedAnswer: null,
          isRevealed: false,
          pendingPenalties: [], // automatic — no manual selection
        },
      });

      // Award mandates from district pool to winner
      if (winner) {
        const conquests = state.districtMandates[selectedDistrict || ''] || [];
        const takenMandates = conquests.reduce((sum, c) => sum + c.mandates, 0);
        const maxAvailable = district ? Math.max(0, district.maxMandates - takenMandates) : winnerBet;
        const awarded = Math.min(winnerBet, maxAvailable);

        get().addMandates(winner.playerId, awarded);

        // Record district conquest using fresh state to avoid overwriting concurrent realtime updates
        set((s) => {
          const existing = s.districtMandates[selectedDistrict || ''] || [];
          const playerEntry = existing.find(e => e.playerId === winner.playerId);
          const updated = playerEntry
            ? existing.map(e => e.playerId === winner.playerId ? { ...e, mandates: e.mandates + awarded } : e)
            : [...existing, { playerId: winner.playerId, partyId: winner.partyId, mandates: awarded }];
          return { districtMandates: { ...s.districtMandates, [selectedDistrict || '']: updated } };
        });

        // Log winner transaction
        void logMandateTransaction(winner.playerId, winner.playerName, awarded, 'win', `כיבוש ${district?.name}`);

        get().addNewsHeadline(
          `👑 ${winner.playerName} כובש/ת את ${district?.name}! +${awarded} מנדטים!`,
          'breaking'
        );
      } else {
        // No winner at all (everyone failed)
        get().addNewsHeadline(`📉 ${initiator?.name || 'היוזם'} לא הצליח/ה — התור עובר`, 'update');
      }

      // Auto-collect 2-mandate penalty from each losing intervener → treasury
      // Personal pool first; if insufficient, fall back to district mandates.
      losingInterveners.forEach(p => {
        const PEN = 2;
        const playerLive = get().players.find(pl => pl.id === p.playerId);
        if (!playerLive) return;
        const personal = playerLive.mandates;

        if (personal >= PEN) {
          get().addMandates(p.playerId, -PEN);
          void updatePublicTreasury(PEN);
          void logMandateTransaction(p.playerId, p.playerName, -PEN, 'penalty', 'התערבות נכשלה — ניכוי אישי');
          void logMandateTransaction(p.playerId, p.playerName, PEN, 'treasury_transfer', 'העברה לאוצר המדינה');
          get().addNewsHeadline(`💸 ${p.playerName} נקנס/ה ב-2 מנדטים על התערבות כושלת → אוצר המדינה`, 'alert');
        } else {
          // Take what's available personally, then take rest from a district they own
          const fromPersonal = personal;
          let remainingDebt = PEN - fromPersonal;
          if (fromPersonal > 0) {
            get().addMandates(p.playerId, -fromPersonal);
          }

          // Find a district they own with mandates
          const dm = get().districtMandates;
          let takenDistrict: { districtId: string; amount: number } | null = null;
          for (const [dId, conquests] of Object.entries(dm)) {
            const entry = conquests.find(c => c.playerId === p.playerId && c.mandates > 0);
            if (entry) {
              const take = Math.min(entry.mandates, remainingDebt);
              const newAmount = entry.mandates - take;
              const updatedConquests = newAmount <= 0
                ? conquests.filter(c => c.playerId !== p.playerId)
                : conquests.map(c => c.playerId === p.playerId ? { ...c, mandates: newAmount } : c);
              set((s) => ({
                districtMandates: { ...s.districtMandates, [dId]: updatedConquests },
              }));
              takenDistrict = { districtId: dId, amount: take };
              remainingDebt -= take;
              break;
            }
          }

          const totalCollected = PEN - remainingDebt;
          if (totalCollected > 0) {
            void updatePublicTreasury(totalCollected);
            void logMandateTransaction(p.playerId, p.playerName, -totalCollected, 'penalty', 'התערבות נכשלה');
            void logMandateTransaction(p.playerId, p.playerName, totalCollected, 'treasury_transfer', 'העברה לאוצר המדינה');
          }
          if (takenDistrict) {
            const dName = DISTRICTS.find(d => d.id === takenDistrict!.districtId)?.name || '';
            get().addNewsHeadline(`💸 ${p.playerName} נקנס/ה — איבד/ה אחיזה ב-${dName} → אוצר המדינה`, 'alert');
          } else {
            get().addNewsHeadline(`💸 ${p.playerName} נקנס/ה ב-${totalCollected} מנדטים → אוצר המדינה`, 'alert');
          }
        }
      });

      // Sync player states to DB
      get().players.forEach(p => void pushPlayerState(p));
      void pushRoomState();
      return;
    }

    // Find next active duelist
    let nextIdx = (currentDuelistIdx + 1) % updatedParticipants.length;
    while (updatedParticipants[nextIdx].eliminated) {
      nextIdx = (nextIdx + 1) % updatedParticipants.length;
    }
    const nextDuelist = updatedParticipants[nextIdx];

    // Get question tailored to next duelist
    const nextPlayer = players.find(p => p.id === nextDuelist.playerId);
    const nextQuestion = nextPlayer
      ? getQuestionForPlayer(nextPlayer, challenges, currentBet)
      : duelState.currentQuestion;

    set({
      duelState: {
        ...duelState,
        participants: updatedParticipants,
        activeDuelistId: nextDuelist.playerId,
        currentQuestion: nextQuestion,
        questionIndex: duelState.questionIndex + 1,
        selectedAnswer: null,
        isRevealed: false,
      },
      activeDuelistId: nextDuelist.playerId,
    });
    void pushRoomState();
  },

  setCurrentChallenge: (c) => set({ currentChallenge: c }),
  setTimer: (s) => set({ timerSeconds: s }),

  castVote: (playerId, success) =>
    set((s) => ({ votes: { ...s.votes, [playerId]: success } })),

  addMandates: (playerId, amount) => {
    set((s) => {
      const updatedPlayers = s.players.map((p) =>
        p.id === playerId ? { ...p, mandates: Math.max(0, p.mandates + amount) } : p
      );
      const winner = updatedPlayers.find(p => p.mandates >= VICTORY_MANDATES);
      return {
        players: updatedPlayers,
        ...(winner ? {
          phase: 'victory' as GamePhase,
          newsHeadlines: pushHeadline(s.newsHeadlines, `🏆 ${winner.name} הגיע/ה ל-${VICTORY_MANDATES} מנדטים! ממשלה חדשה הוקמה!`, 'breaking'),
        } : {}),
      };
    });

    // Sync updated player to DB
    const player = get().players.find(p => p.id === playerId);
    if (player) void pushPlayerState(player);
  },

  resolveRound: (winnerId) =>
    set((s) => {
      const winner = s.players.find(p => p.id === winnerId);
      const cat = s.selectedCategory;
      // Cap reward to what the district can actually provide (mirrors advanceDuel logic)
      const districtObj = DISTRICTS.find(d => d.id === s.selectedDistrict);
      const conquests = s.selectedDistrict ? (s.districtMandates[s.selectedDistrict] || []) : [];
      const taken = conquests.reduce((sum, c) => sum + c.mandates, 0);
      const available = districtObj ? Math.max(0, districtObj.maxMandates - taken) : s.currentBet;
      const mandateReward = Math.min(s.currentBet, available);

      const updatedPlayers = s.players.map((p) => {
        if (p.id === winnerId) {
          const newStats = { ...p.categoryStats };
          if (cat) newStats[cat] = { ...newStats[cat], won: newStats[cat].won + 1 };
          return { ...p, battlesWon: p.battlesWon + 1, categoryStats: newStats, mandates: p.mandates + mandateReward };
        }
        if (s.battleParticipants.includes(p.id) && p.id !== winnerId) {
          const newStats = { ...p.categoryStats };
          if (cat) newStats[cat] = { ...newStats[cat], lost: newStats[cat].lost + 1 };
          return { ...p, battlesLost: p.battlesLost + 1, categoryStats: newStats };
        }
        return p;
      });

      // Log transaction
      if (winner) {
        void logMandateTransaction(winnerId, winner.name, mandateReward, 'win', `ניצחון ב${s.selectedDistrict || 'קרב'}`);
      }

      const victoryWinner = updatedPlayers.find(p => p.mandates >= VICTORY_MANDATES);
      let newDistrictMandates = { ...s.districtMandates };
      if (s.selectedDistrict && winner) {
        const existing = newDistrictMandates[s.selectedDistrict] || [];
        const playerEntry = existing.find(e => e.playerId === winnerId);
        if (playerEntry) {
          newDistrictMandates[s.selectedDistrict] = existing.map(e =>
            e.playerId === winnerId ? { ...e, mandates: e.mandates + mandateReward } : e
          );
        } else {
          newDistrictMandates[s.selectedDistrict] = [...existing, { playerId: winnerId, partyId: winner.party, mandates: mandateReward }];
        }
      }

      // Sync players to DB
      updatedPlayers.forEach(p => void pushPlayerState(p));

      return {
        players: updatedPlayers,
        phase: victoryWinner ? 'victory' as GamePhase : 'results' as GamePhase,
        districtMandates: newDistrictMandates,
        newsHeadlines: pushHeadline(
          s.newsHeadlines,
          victoryWinner
            ? `🏆 ${victoryWinner.name} הגיע/ה ל-${VICTORY_MANDATES} מנדטים! ממשלה חדשה הוקמה!`
            : generateChallengeHeadline(winner?.name || '', winner?.party || 'blue', cat || 'knowledge', true),
          'breaking'
        ),
      };
    }),

  nextTurn: () => {
    // Debounce: prevent double-turns within 1 second
    const now = Date.now();
    if (now - get()._lastNextTurnAt < 1000) return;
    set({ _lastNextTurnAt: now });

    set((s) => {
      let nextIdx = (s.currentPlayerIndex + 1) % s.players.length;
      let updatedPlayers = [...s.players];
      let headlines = s.newsHeadlines;

      let checked = 0;
      while (checked < s.players.length) {
        const nextPlayer = updatedPlayers[nextIdx];
        if (nextPlayer && nextPlayer.freezeTurns > 0) {
          updatedPlayers = updatedPlayers.map((p, i) =>
            i === nextIdx ? { ...p, freezeTurns: p.freezeTurns - 1 } : p
          );
          headlines = pushHeadline(headlines, `🔒 ${nextPlayer.name} עדיין בכלא! (${nextPlayer.freezeTurns - 1} תורות נותרו)`, 'alert');
          nextIdx = (nextIdx + 1) % s.players.length;
          checked++;
        } else break;
      }

      return {
        currentPlayerIndex: nextIdx,
        players: updatedPlayers,
        currentBet: 0, battleParticipants: [], selectedCategory: null, selectedDistrict: null,
        currentChallenge: null, votes: {}, wowEvent: null,
        crowdReaction: { claps: 0, boos: 0, voters: [] },
        challengeDifficulty: 'normal' as ChallengeDifficulty,
        activeCodeValue: null, crisisActive: false,
        phase: 'district-select' as GamePhase,
        battleInviteData: null, duelState: null, activeDuelistId: null,
        activePlayerId: updatedPlayers[nextIdx]?.id ?? null,
        timerEndAt: null,
        newsHeadlines: pushHeadline(headlines, generateAmbientHeadline(), 'update'),
      };
    });
    void pushRoomState();
  },

  setChallenges: (c) => set({ challenges: c }),

  triggerWowEvent: () => {
    const events: WowEvent[] = ['screen-lock-debate', 'election-flash', 'forced-team'];
    const event = events[Math.floor(Math.random() * events.length)];
    const { players } = get();
    set((s) => ({
      wowEvent: event,
      phase: 'wow-event' as GamePhase,
      newsHeadlines: pushHeadline(s.newsHeadlines, generateWowHeadline(event, players[0]?.name, players[1]?.name), 'breaking'),
    }));
    void pushRoomState();
  },

  usePower: (playerId) => {
    set((s) => {
      const player = s.players.find(p => p.id === playerId);
      return {
        players: s.players.map((p) => (p.id === playerId ? { ...p, powerUsed: true } : p)),
        newsHeadlines: pushHeadline(s.newsHeadlines, `${player?.name} הפעיל/ה כוח מפלגתי! מהלך טקטי מפתיע!`, 'alert'),
      };
    });
  },

  formAlliance: (p1, p2) =>
    set((s) => {
      const player1 = s.players.find(p => p.id === p1);
      const player2 = s.players.find(p => p.id === p2);
      return {
        players: s.players.map((p) => {
          if (p.id === p1) return { ...p, alliances: [...p.alliances, p2] };
          if (p.id === p2) return { ...p, alliances: [...p.alliances, p1] };
          return p;
        }),
        newsHeadlines: pushHeadline(s.newsHeadlines, generateAllianceHeadline(player1?.name || '', player1?.party || 'blue', player2?.name || '', player2?.party || 'red'), 'breaking'),
      };
    }),

  betray: (betrayerId, targetId) =>
    set((s) => {
      const betrayer = s.players.find(p => p.id === betrayerId);
      const target = s.players.find(p => p.id === targetId);
      return {
        players: s.players.map((p) => {
          if (p.id === betrayerId) return { ...p, reputation: p.reputation - 10, alliances: p.alliances.filter((a) => a !== targetId) };
          if (p.id === targetId) return { ...p, alliances: p.alliances.filter((a) => a !== betrayerId) };
          return p;
        }),
        newsHeadlines: pushHeadline(s.newsHeadlines, generateBetrayalHeadline(betrayer?.name || '', betrayer?.party || 'blue', target?.name || '', target?.party || 'red'), 'breaking'),
      };
    }),

  getFilteredChallenges: (playerAge, category, interests, bet) => {
    const { challenges, _askedQuestionIds } = get();
    const ageGroup: AgeGroup = playerAge < 12 ? 'ילד' : playerAge < 18 ? 'נוער' : 'מבוגר';

    // Filter out already-asked questions
    const notAsked = challenges.filter(c => !_askedQuestionIds.has(c.id));
    const pool = notAsked.length > 0 ? notAsked : challenges; // fallback to all if exhausted

    const byCat = pool.filter(c => c.challengeType === category);

    // Age filtering: ילד sees only ילד, נוער sees ילד+נוער, מבוגר sees all
    const ageOrder: AgeGroup[] = ['ילד', 'נוער', 'מבוגר'];
    const playerAgeIdx = ageOrder.indexOf(ageGroup);
    const byAge = byCat.filter(c => ageOrder.indexOf(c.ageGroup) <= playerAgeIdx);
    const agePool = byAge.length > 0 ? byAge : byCat;

    // Interest/topic filtering — skip if 'general' selected
    let interestPool = agePool;
    if (interests && interests.length > 0 && !interests.includes('general')) {
      const byInterest = agePool.filter(c => c.interestTag && interests.includes(c.interestTag));
      if (byInterest.length > 0) interestPool = byInterest;
    }

    // Difficulty filtering based on bet
    if (bet && bet > 0 && category === 'knowledge') {
      const targetDifficulty = betToDifficulty(bet);
      const exact = interestPool.filter(c => c.difficultyLevel === targetDifficulty);
      if (exact.length > 0) return exact;

      // Fallback: closest difficulty ±1
      const targetIdx = DIFFICULTY_ORDER.indexOf(targetDifficulty);
      const nearby = interestPool.filter(c => {
        if (!c.difficultyLevel) return false;
        const cIdx = DIFFICULTY_ORDER.indexOf(c.difficultyLevel);
        return Math.abs(cIdx - targetIdx) <= 1;
      });
      if (nearby.length > 0) return nearby;
    }

    if (interestPool.length > 0) return interestPool;
    if (agePool.length > 0) return agePool;
    return pool;
  },

  resetBattle: () => {
    set({
      currentBet: 0, battleParticipants: [], selectedCategory: null, selectedDistrict: null,
      currentChallenge: null, votes: {},
      crowdReaction: { claps: 0, boos: 0, voters: [] },
      battleInviteData: null, duelState: null,
    });
  },

  addNewsHeadline: (text, type = 'update') =>
    set((s) => ({ newsHeadlines: pushHeadline(s.newsHeadlines, text, type) })),

  sendMemo: (fromId, toId, message) =>
    set((s) => {
      const memo: SecretMemoType = {
        id: crypto.randomUUID(), fromPlayerId: fromId, toPlayerId: toId,
        message, timestamp: Date.now(), read: false,
      };
      return {
        players: s.players.map((p) =>
          p.id === toId ? { ...p, memos: [...p.memos, memo], unreadMemos: p.unreadMemos + 1 } : p
        ),
        newsHeadlines: pushHeadline(s.newsHeadlines, 'שמועה: נצפתה חילופי הודעות חשאיים בין פוליטיקאים...', 'poll'),
      };
    }),

  markMemosRead: (playerId) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, unreadMemos: 0, memos: p.memos.map(m => ({ ...m, read: true })) } : p
      ),
    })),

  addCodeToBank: (playerId, value) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, powerBank: [...p.powerBank, { id: crypto.randomUUID(), value, used: false }] } : p
      ),
    })),

  useCode: (playerId, codeId) =>
    set((s) => {
      const player = s.players.find(p => p.id === playerId);
      const code = player?.powerBank.find(c => c.id === codeId);
      if (!code) return s;
      let difficulty: ChallengeDifficulty = 'normal';
      if (code.value >= 8) difficulty = 'high-stakes';
      else if (code.value <= 3) difficulty = 'safe';
      return {
        activeCodeValue: code.value, challengeDifficulty: difficulty,
        players: s.players.map((p) =>
          p.id === playerId ? { ...p, powerBank: p.powerBank.filter(c => c.id !== codeId) } : p
        ),
        newsHeadlines: pushHeadline(s.newsHeadlines,
          difficulty === 'high-stakes' ? `⚡ ${player?.name} שולף קוד כוח גבוה! אתגר הימור גבוה!`
            : difficulty === 'safe' ? `🛡️ ${player?.name} בוחר במסלול הבטוח`
            : `${player?.name} מפעיל/ה קוד טקטי`, 'alert'),
      };
    }),

  addCrowdReaction: (playerId, type) =>
    set((s) => {
      if (s.crowdReaction.voters.includes(playerId)) return s;
      const newReaction = {
        claps: s.crowdReaction.claps + (type === 'clap' ? 1 : 0),
        boos: s.crowdReaction.boos + (type === 'boo' ? 1 : 0),
        voters: [...s.crowdReaction.voters, playerId],
      };
      return {
        crowdReaction: newReaction,
        timerSeconds: Math.min(120, s.timerSeconds + (type === 'clap' && newReaction.claps % 5 === 0 ? 1 : 0)),
      };
    }),

  triggerNationalCrisis: () => {
    set((s) => ({
      crisisActive: true,
      phase: 'national-crisis' as GamePhase,
      newsHeadlines: pushHeadline(s.newsHeadlines, '🚨 משבר לאומי! כל השחקנים מאבדים מנדטים!', 'breaking'),
    }));
    void pushRoomState();
  },

  resolvePenalty: (playerId, districtId, mode) => {
    const state = get();
    const { duelState, districtMandates, players } = state;
    if (!duelState) return;

    const loser = players.find(p => p.id === playerId);
    const penaltyAmount = 2;

    if (mode === 'personal') {
      // Deduct from personal pool → transfer to treasury
      get().addMandates(playerId, -penaltyAmount);
      void updatePublicTreasury(penaltyAmount);
      void logMandateTransaction(playerId, loser?.name || '', -penaltyAmount, 'penalty', 'ניכוי מהמאגר האישי');
      void logMandateTransaction(playerId, loser?.name || '', penaltyAmount, 'treasury_transfer', 'העברה לאוצר המדינה');
    } else if (mode === 'district' && districtId) {
      // Relinquish district — remove all mandates from this district for this player
      const conquests = districtMandates[districtId] || [];
      const playerConquest = conquests.find(c => c.playerId === playerId);
      const lostMandates = playerConquest?.mandates || 0;

      const updatedConquests = conquests.filter(c => c.playerId !== playerId);
      const newDistrictMandates = { ...districtMandates, [districtId]: updatedConquests };

      // Deduct all district mandates from player total → transfer to treasury
      get().addMandates(playerId, -lostMandates);
      void updatePublicTreasury(lostMandates);

      const district = DISTRICTS.find(d => d.id === districtId);
      void logMandateTransaction(playerId, loser?.name || '', -lostMandates, 'penalty', `ויתור על ${district?.name}`);
      void logMandateTransaction(playerId, loser?.name || '', lostMandates, 'treasury_transfer', `${district?.name} → אוצר המדינה`);

      set({ districtMandates: newDistrictMandates });
    }

    // Mark penalty as resolved
    const updatedPenalties = duelState.pendingPenalties.map(p =>
      p.playerId === playerId ? { ...p, resolved: true, selectedDistrict: districtId } : p
    );

    const district = districtId ? DISTRICTS.find(d => d.id === districtId) : null;

    set((s) => ({
      duelState: duelState ? { ...duelState, pendingPenalties: updatedPenalties } : null,
      newsHeadlines: pushHeadline(s.newsHeadlines,
        mode === 'district' && district
          ? `💸 ${loser?.name} מוותר/ת על ${district.name}! מחוז חוזר לניטרלי`
          : `💸 ${loser?.name} מפסיד/ת 2 מנדטים מהמאגר האישי → אוצר המדינה`,
        'alert'),
    }));

    // Sync
    get().players.forEach(p => void pushPlayerState(p));
    void pushRoomState();
  },
}));

// ── Helper: get question for a player based on age + bet difficulty ──
function getQuestionForPlayer(player: Player, challenges: Challenge[], currentBet: number): Challenge | null {
  const store = useGameStore.getState();
  const filtered = store.getFilteredChallenges(player.age, 'knowledge', player.interests, currentBet);
  
  // Filter out already-asked
  const notAsked = filtered.filter(c => !store._askedQuestionIds.has(c.id));
  const pool = notAsked.length > 0 ? notAsked : filtered;

  if (pool.length === 0) return null;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  // Track as asked
  useGameStore.setState((s) => ({ _askedQuestionIds: new Set([...s._askedQuestionIds, chosen.id]) }));

  return chosen;
}
