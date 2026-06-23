import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, Skull, Shield } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

const CoalitionMenu = ({ onClose }: { onClose: () => void }) => {
  const { players, currentPlayerIndex, formAlliance, betray } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const others = players.filter((_, i) => i !== currentPlayerIndex);
  const [mode, setMode] = useState<'alliance' | 'betrayal' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-x-0 bottom-0 z-50 glass-panel rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-bold text-foreground">🏛️ קואליציה ובגידה</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Button
          variant={mode === 'alliance' ? 'default' : 'outline'}
          onClick={() => setMode('alliance')}
          className={mode === 'alliance' ? 'bg-coalition text-coalition-foreground' : 'border-border'}
        >
          <Handshake size={16} className="ml-1" /> ברית
        </Button>
        <Button
          variant={mode === 'betrayal' ? 'default' : 'outline'}
          onClick={() => setMode('betrayal')}
          className={mode === 'betrayal' ? 'bg-destructive text-destructive-foreground' : 'border-border'}
        >
          <Skull size={16} className="ml-1" /> בגידה
        </Button>
      </div>

      {mode && (
        <div className="grid gap-2">
          {others.map((player) => (
            <button
              key={player.id}
              onClick={() => {
                if (mode === 'alliance') formAlliance(currentPlayer.id, player.id);
                else betray(currentPlayer.id, player.id);
                onClose();
              }}
              className="party-card border-border hover:border-primary/50 flex items-center justify-between"
            >
              <div>
                <p className="font-display font-bold text-foreground text-sm">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  <Shield size={12} className="inline ml-1" />
                  מוניטין: {player.reputation}%
                </p>
              </div>
              <span className="text-sm">
                {mode === 'alliance' ? '🤝' : '🗡️'}
              </span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CoalitionMenu;
