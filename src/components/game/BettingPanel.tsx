import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Minus, Plus, Radio } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { DISTRICTS } from '@/types/game';

const BettingPanel = () => {
  const { setBet, selectedDistrict, getAvailableMandates } = useGameStore();
  const district = DISTRICTS.find(d => d.id === selectedDistrict);
  const maxBet = selectedDistrict ? getAvailableMandates(selectedDistrict) : 12;
  const [bet, setLocalBet] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-4"
    >
      {/* News-style header */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg">
          <TrendingUp size={16} />
          <span className="font-display font-black text-sm">הימורי מנדטים</span>
          {district && (
            <span className="text-xs opacity-80 mr-auto">| {district.emoji} {district.name}</span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        {district ? `נחתם ב${district.name} (עד ${district.maxMandates} מנדטים). כמה מהמרים?` : 'כמה מנדטים אתה מהמר?'}
      </p>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocalBet(Math.max(1, bet - 1))}
          className="border-border"
        >
          <Minus size={18} />
        </Button>

        <motion.div
          key={bet}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-6xl font-display font-black text-accent w-20 text-center"
        >
          {bet}
        </motion.div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocalBet(Math.min(maxBet, bet + 1))}
          className="border-border"
        >
          <Plus size={18} />
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {[1, 3, 5, 8, 12].filter(v => v <= maxBet).map((v) => (
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

      <Button
        onClick={() => setBet(bet)}
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg px-8"
      >
        אני מהמר! 🔥
      </Button>
    </motion.div>
  );
};

export default BettingPanel;
