import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PARTIES } from '@/types/game';

const PartyPowerButton = () => {
  const { players, currentPlayerIndex, usePower } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const party = PARTIES.find((p) => p.id === currentPlayer.party);
  if (!party || currentPlayer.powerUsed) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => usePower(currentPlayer.id)}
      className="fixed bottom-[132px] left-4 z-40 glass-panel px-4 py-3 flex items-center gap-2 shadow-neon-blue"
    >
      <Sparkles size={18} className="text-accent" />
      <div className="text-right">
        <p className="text-xs font-display font-bold text-foreground">{party.power}</p>
        <p className="text-[10px] text-muted-foreground">{party.powerDescription}</p>
      </div>
    </motion.button>
  );
};

export default PartyPowerButton;
