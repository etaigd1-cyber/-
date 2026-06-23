import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

const ResultsPanel = () => {
  const { players, currentPlayerIndex, battleParticipants, currentBet, nextTurn, setPhase } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const allParticipants = [currentPlayer, ...players.filter(p => battleParticipants.includes(p.id))];

  // 1:1 ratio — reward equals exact bet
  const mandateReward = currentBet;

  const handleNext = () => {
    nextTurn();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <Trophy size={48} className="text-accent" />
      </motion.div>

      <h2 className="text-2xl font-display font-bold text-foreground">תוצאות הקרב</h2>
      <p className="text-sm text-accent font-display font-bold">+{mandateReward} מנדטים למנצח</p>

      <div className="grid gap-3 w-full max-w-sm">
        {allParticipants.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`glass-panel p-4 flex items-center justify-between ${
              i === 0 ? 'border border-accent/50' : ''
            }`}
          >
            <div>
              <p className="font-display font-bold text-foreground">{player.name}</p>
              <p className="text-xs text-muted-foreground">
                {player.mandates} מנדטים • {player.battlesWon}W / {player.battlesLost}L
              </p>
            </div>
            <div className="text-2xl">{i === 0 ? '🏆' : '⚔️'}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setPhase('dashboard')}
          variant="outline"
          className="border-border font-display"
        >
          📊 לוח תוצאות
        </Button>
        <Button
          onClick={handleNext}
          className="bg-primary text-primary-foreground font-display px-6"
        >
          תור הבא <ArrowLeft size={16} className="mr-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ResultsPanel;
