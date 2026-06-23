import { motion } from 'framer-motion';
import { Battery, Zap } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const PowerBankDisplay = () => {
  const { players, currentPlayerIndex } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const codes = currentPlayer.powerBank;
  if (codes.length === 0) return null;

  return (
    <div className="glass-panel p-3 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Battery size={14} className="text-accent" />
        <span className="text-xs font-display font-bold text-foreground">בנק כוח</span>
        <span className="text-[10px] text-muted-foreground">({codes.filter(c => !c.used).length} זמינים)</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {codes.map((code, i) => (
          <motion.div
            key={code.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`relative w-9 h-12 rounded-md flex flex-col items-center justify-center text-xs font-display font-black border ${
              code.used
                ? 'bg-muted/50 border-border text-muted-foreground opacity-40'
                : code.value >= 8
                ? 'bg-accent/20 border-accent text-accent'
                : code.value <= 3
                ? 'bg-coalition/20 border-coalition text-coalition'
                : 'bg-primary/20 border-primary text-primary'
            }`}
          >
            {code.value >= 8 && !code.used && (
              <Zap size={8} className="absolute top-0.5 right-0.5 text-accent" />
            )}
            <span className="text-base">{code.value}</span>
            {code.used && <span className="text-[8px]">✗</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PowerBankDisplay;
