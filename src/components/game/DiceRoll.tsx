import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const DiceRoll = () => {
  const { diceValues, rollDice, players, currentPlayerIndex } = useGameStore();
  const [rolling, setRolling] = useState(false);
  const currentPlayer = players[currentPlayerIndex];

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      rollDice();
      setRolling(false);
    }, 1000);
  };

  const D1Icon = diceIcons[diceValues[0] - 1];
  const D2Icon = diceIcons[diceValues[1] - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 p-6"
    >
      <h2 className="text-2xl font-display font-bold text-foreground">
        תור של {currentPlayer?.name}
      </h2>
      <p className="text-muted-foreground text-sm">הטל קוביות כדי להתקדם</p>

      <div className="flex gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={rolling ? 'rolling-1' : `dice-1-${diceValues[0]}`}
            animate={rolling ? { rotate: [0, 360, 720], scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1 }}
            className="dice-face bg-primary text-primary-foreground"
          >
            <D1Icon size={36} />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={rolling ? 'rolling-2' : `dice-2-${diceValues[1]}`}
            animate={rolling ? { rotate: [0, -360, -720], scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, delay: 0.1 }}
            className="dice-face bg-foreground text-background"
          >
            <D2Icon size={36} />
          </motion.div>
        </AnimatePresence>
      </div>

      {!rolling && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <p className="text-4xl font-display font-black text-accent mb-4">
            {diceValues[0] + diceValues[1]}
          </p>
        </motion.div>
      )}

      <Button
        onClick={handleRoll}
        disabled={rolling}
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg px-8"
      >
        {rolling ? '🎲 מגלגל...' : '🎲 הטל קוביות'}
      </Button>
    </motion.div>
  );
};

export default DiceRoll;
