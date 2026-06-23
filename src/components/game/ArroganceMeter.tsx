import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Hourglass } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DISTRICTS, PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const getDifficultyLabel = (bet: number) => {
  if (bet <= 3) return { label: 'קל', emoji: '😎', color: 'text-coalition' };
  if (bet <= 7) return { label: 'בינוני', emoji: '😤', color: 'text-accent' };
  return { label: 'קשה מאוד', emoji: '🔥', color: 'text-destructive' };
};

const ArroganceMeter = () => {
  const { setBet, selectedDistrict, getAvailableMandates, localPlayerId, players, currentPlayerIndex, activePlayerId } = useGameStore();
  const district = DISTRICTS.find(d => d.id === selectedDistrict);
  const maxBet = selectedDistrict ? getAvailableMandates(selectedDistrict) : 12;
  const [bet, setLocalBet] = useState(1);
  const { label, emoji, color } = getDifficultyLabel(bet);
  const currentPlayer = players[currentPlayerIndex];

  // Only active player sees betting UI
  const isActivePlayer = localPlayerId === activePlayerId || localPlayerId === currentPlayer?.id;

  if (maxBet <= 0) return null;

  // Non-active players see waiting screen
  if (!isActivePlayer) {
    const activePlayer = players.find(p => p.id === (activePlayerId || currentPlayer?.id));
    const party = activePlayer ? PARTIES.find(pt => pt.id === activePlayer.party) : null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5 p-6"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Hourglass size={40} className="text-accent" />
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground">ממתין לבחירת הימור</h2>
        <div className="glass-panel p-4 text-center w-full max-w-sm">
          <p className="text-sm text-foreground font-display">
            {party?.emoji} <span className="font-bold">{activePlayer?.name}</span> בוחר/ת כמה מנדטים להמר...
          </p>
          {district && (
            <p className="text-xs text-muted-foreground mt-2">
              {district.emoji} {district.name}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">ההזמנה לקרב תגיע מיד אחרי</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-4"
    >
      {/* Header */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg">
          <TrendingUp size={16} />
          <span className="font-display font-black text-sm">מד זחיחות</span>
          {district && (
            <span className="text-xs opacity-80 mr-auto">| {district.emoji} {district.name}</span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        כמה מנדטים אתה מעז להמר? ככל שתהמר יותר — השאלות קשות יותר!
      </p>

      {/* Bet display */}
      <motion.div
        key={bet}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <span className="text-6xl font-display font-black text-accent">{bet}</span>
        <div className={`text-sm font-display font-bold ${color} mt-1`}>
          {emoji} {label}
        </div>
      </motion.div>

      {/* Slider */}
      <div className="w-full max-w-sm px-2">
        <Slider
          value={[bet]}
          min={1}
          max={maxBet}
          step={1}
          onValueChange={([v]) => setLocalBet(v)}
          className="w-full"
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-display">
          <span>1 — בטוח</span>
          <span>{maxBet} — זחוח לגמרי</span>
        </div>
      </div>

      {/* Quick picks */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[1, 3, 5, 8, 10].filter(v => v <= maxBet).map((v) => (
          <button
            key={v}
            onClick={() => setLocalBet(v)}
            className={`mandate-badge transition-all ${
              bet === v
                ? 'bg-accent text-accent-foreground scale-110'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Difficulty indicator bar */}
      <div className="w-full max-w-sm">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            animate={{ width: `${(bet / maxBet) * 100}%` }}
            className={`h-full rounded-full ${
              bet <= 3 ? 'bg-coalition' : bet <= 7 ? 'bg-accent' : 'bg-destructive'
            }`}
          />
        </div>
      </div>

      <Button
        onClick={() => setBet(bet)}
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg px-8 gap-2"
      >
        <Flame size={18} />
        אני מהמר {bet} מנדטים!
      </Button>
    </motion.div>
  );
};

export default ArroganceMeter;
