import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { Users, Plus, Play, Radio, Star } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PARTIES, INTERESTS, type PartyId, type Interest } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadLegacy, saveLegacy, getLegacyBonus, type LegacyProfile } from '@/lib/localStorage';
import { AVATAR_MAP } from '@/lib/avatarMap';

import LobbyVideoBackground from '@/components/game/LobbyVideoBackground';
import CharacterSeats from '@/components/game/CharacterSeats';
import LobbySatiricalTicker from '@/components/game/LobbySatiricalTicker';

const AVATAR_SLOTS = [
  { partyId: 'blue' as PartyId, label: 'הישנוניים' },
  { partyId: 'red' as PartyId, label: 'המיוזעים' },
  { partyId: 'orange' as PartyId, label: 'הזחוחים' },
  { partyId: 'green' as PartyId, label: 'המצחיקולים' },
  { partyId: 'purple' as PartyId, label: 'המבוהלים' },
  { partyId: 'yellow' as PartyId, label: 'המיוסרים' },
];

/* ── Glass card wrapper ── */
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-xl border border-border/40 ${className}`}
    style={{
      background: 'rgba(15, 15, 20, 0.55)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 0 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}
  >
    {children}
  </div>
);

const Lobby = () => {
  const navigate = useNavigate();
  const { roomCode, players, addPlayer, startGame: startGameAction, localPlayerId, phase } = useGameStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [selectedParty, setSelectedParty] = useState<PartyId | null>(null);
  const [showForm, setShowForm] = useState(false);

  const takenParties = players.map(p => p.party);
  const hasRegistered = !!localPlayerId && players.some(p => p.id === localPlayerId);
  const [legacyProfile, setLegacyProfile] = useState<LegacyProfile | null>(null);

  useEffect(() => {
    const legacy = loadLegacy();
    if (legacy) setLegacyProfile(legacy);
  }, []);

  const handleAddPlayer = () => {
    if (!name || !age || selectedInterests.length === 0 || !selectedParty) return;
    addPlayer(name, parseInt(age), selectedInterests, selectedParty);

    const legacy: LegacyProfile = {
      name,
      age: parseInt(age),
      interests: selectedInterests,
      party: selectedParty,
      avatarIndex: AVATAR_SLOTS.findIndex(s => s.partyId === selectedParty),
      totalGames: legacyProfile?.totalGames ?? 0,
      totalWins: legacyProfile?.totalWins ?? 0,
      totalMandates: legacyProfile?.totalMandates ?? 0,
      bestMandates: legacyProfile?.bestMandates ?? 0,
      lastPlayed: Date.now(),
    };
    saveLegacy(legacy);

    setName('');
    setAge('');
    setSelectedInterests([]);
    setSelectedParty(null);
    setShowForm(false);
  };

  const toggleInterest = (interest: Interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 3
        ? [...prev, interest]
        : prev
    );
  };

  useEffect(() => {
    if (phase === 'district-select' || phase === 'betting' || phase === 'battle') {
      navigate('/game');
    }
  }, [phase, navigate]);

  const startGame = () => { void startGameAction(); };

  const legacyBonus = getLegacyBonus();

  if (!roomCode) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen relative flex flex-col pb-[72px]" dir="rtl">
      {/* Video background with gradient */}
      <LobbyVideoBackground />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* ON AIR Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 pb-4 px-4"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Radio size={16} className="text-destructive" />
            </motion.div>
            <span className="text-xs font-display font-bold text-destructive tracking-widest">ON AIR</span>
          </div>
          <h1 className="text-2xl font-display font-black text-accent drop-shadow-lg">הכיסא ה-61</h1>
          <p className="text-muted-foreground/70 text-xs font-display">אולפן הבחירות הסוער</p>
        </motion.div>

        <div className="flex-1 px-4 pb-6 flex flex-col gap-4 max-w-lg mx-auto w-full">
          {/* Room Code */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="p-4 text-center border-t-2 border-destructive/40">
              <p className="text-[10px] text-muted-foreground/60 mb-1 font-display">קוד חדר</p>
              <p className="text-4xl font-display font-black tracking-[0.4em] text-accent drop-shadow-lg">
                {roomCode}
              </p>
            </GlassCard>
          </motion.div>

          {/* Legacy Badge */}
          {legacyBonus > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="p-2.5 flex items-center justify-center gap-2 border-accent/20">
                <Star size={13} className="text-accent" />
                <span className="text-[10px] font-display font-bold text-accent">
                  בונוס חוזרים: +{legacyBonus} מנדטים
                </span>
              </GlassCard>
            </motion.div>
          )}

          {/* Players List */}
          {players.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground/60 flex items-center gap-1 font-display">
                <Users size={13} /> מתמודדים ({players.length})
              </p>
              {players.map((player, i) => {
                const party = PARTIES.find(p => p.id === player.party);
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <GlassCard className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={AVATAR_MAP[player.party]}
                          alt={party?.name}
                          className="w-9 h-9 rounded-full object-cover border border-border/40"
                        />
                        <div>
                          <p className="font-display font-bold text-foreground text-sm">{player.name}</p>
                          <p className="text-[10px] text-muted-foreground/60">גיל {player.age} • {party?.name}</p>
                        </div>
                      </div>
                      <span className="text-xs font-display text-accent font-bold">{player.mandates} מנדטים</span>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Add Player */}
          {!hasRegistered && !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="py-3 rounded-xl border-2 border-dashed border-border/40 text-muted-foreground font-display text-sm hover:border-muted-foreground/60 transition-colors"
              style={{ background: 'rgba(15,15,20,0.3)' }}
            >
              <Plus size={15} className="inline ml-1 -mt-0.5" /> הוסף מתמודד/ת
            </button>
          ) : hasRegistered && !showForm ? (
            <GlassCard className="p-3 text-center border-accent/20">
              <span className="text-xs font-display font-bold text-accent">✅ נרשמת! ממתין לשחקנים נוספים...</span>
            </GlassCard>
          ) : null}

          {/* Registration Form */}
          {showForm && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <GlassCard className="p-5 space-y-4">
                  <Input
                    placeholder="שם המתמודד/ת"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-background/20 border-border/40 text-foreground font-body placeholder:text-muted-foreground/40"
                  />
                  <Input
                    placeholder="גיל"
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="bg-background/20 border-border/40 text-foreground font-body placeholder:text-muted-foreground/40"
                  />

                  {/* Interests */}
                  <div>
                    <p className="text-[10px] text-muted-foreground/60 mb-2 font-display">תחומי עניין (עד 3)</p>
                    <div className="flex gap-2 flex-wrap">
                      {INTERESTS.map(interest => (
                        <button
                          key={interest.id}
                          onClick={() => toggleInterest(interest.id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-display font-bold transition-all duration-300 border ${
                            selectedInterests.includes(interest.id)
                              ? 'bg-primary/20 text-primary border-primary/40'
                              : 'bg-background/10 text-muted-foreground/60 border-border/30 hover:border-muted-foreground/40'
                          }`}
                        >
                          {interest.emoji} {interest.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character Seat Selection */}
                  <CharacterSeats
                    selectedParty={selectedParty}
                    takenParties={takenParties}
                    onSelect={setSelectedParty}
                  />

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      className="flex-1 border-border/40 bg-background/10 text-muted-foreground hover:bg-background/20"
                    >
                      ביטול
                    </Button>
                    <Button
                      onClick={handleAddPlayer}
                      disabled={!name || !age || selectedInterests.length === 0 || !selectedParty}
                      className="flex-1 bg-accent/90 text-accent-foreground font-display hover:bg-accent"
                    >
                      הוסף ✓
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Start Game */}
          {players.length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-auto pt-4">
              <Button
                onClick={startGame}
                size="lg"
                className="w-full bg-accent text-accent-foreground font-display text-xl py-6 shadow-[0_0_30px_rgba(var(--accent),0.3)]"
              >
                <Play size={24} className="ml-2" />
                עולים לשידור!
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Satirical Ticker */}
      <LobbySatiricalTicker />
    </div>
  );
};

export default Lobby;
