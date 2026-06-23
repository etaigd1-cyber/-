import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Radio } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

const NationalCrisis = () => {
  const { players, setPhase, addNewsHeadline, nextTurn } = useGameStore();
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentTapper, setCurrentTapper] = useState(0);
  const [tapsLeft, setTapsLeft] = useState(5);
  const [timeLeft, setTimeLeft] = useState(10);
  const [finished, setFinished] = useState(false);

  const moveTarget = useCallback(() => {
    setTargetPosition({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    });
  }, []);

  useEffect(() => {
    moveTarget();
    const interval = setInterval(moveTarget, 1200);
    return () => clearInterval(interval);
  }, [moveTarget]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const handleTap = () => {
    if (finished) return;
    const player = players[currentTapper];
    if (!player) return;

    setScores(prev => ({ ...prev, [player.id]: (prev[player.id] || 0) + 1 }));
    setTapsLeft(prev => {
      if (prev <= 1) {
        // Move to next player
        const nextIdx = currentTapper + 1;
        if (nextIdx >= players.length) {
          setFinished(true);
          return 0;
        }
        setCurrentTapper(nextIdx);
        return 5;
      }
      return prev - 1;
    });
    moveTarget();
  };

  const handleFinish = () => {
    // Find winner
    let winnerId = players[0]?.id || '';
    let maxScore = 0;
    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) { maxScore = score; winnerId = id; }
    });
    const winner = players.find(p => p.id === winnerId);
    addNewsHeadline(
      `מבזק: ${winner?.name} ניצח/ה במשבר הלאומי ומקבל/ת אשראי יציבות!`,
      'breaking'
    );
    nextTurn();
  };

  const currentPlayer = players[currentTapper];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      {/* Red overlay */}
      <motion.div
        animate={{ opacity: [0.6, 0.8, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute inset-0 bg-destructive/30"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-6 w-full max-w-sm">
        {/* Header */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg"
        >
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Radio size={16} />
          </motion.div>
          <AlertTriangle size={20} />
          <span className="font-display font-black text-lg tracking-wider">משבר לאומי!</span>
        </motion.div>

        <p className="text-foreground text-center text-sm font-display">
          קוד 99 — כל השחקנים חייבים להגיב!
        </p>
        <p className="text-muted-foreground text-xs text-center">
          לחצו על המטרה הנעה כמה שיותר מהר!
        </p>

        {!finished ? (
          <>
            {/* Timer */}
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-display font-black ${timeLeft <= 3 ? 'text-destructive' : 'text-accent'}`}
            >
              {timeLeft}
            </motion.span>

            {/* Current player */}
            <div className="glass-panel px-4 py-2">
              <p className="text-xs text-muted-foreground">תור:</p>
              <p className="font-display font-bold text-foreground">{currentPlayer?.name} ({tapsLeft} לחיצות נותרו)</p>
            </div>

            {/* Tap area */}
            <div className="relative w-full h-48 bg-muted/50 rounded-xl border border-border overflow-hidden">
              <motion.button
                animate={{
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={handleTap}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-destructive rounded-full flex items-center justify-center shadow-lg"
                whileTap={{ scale: 0.7 }}
              >
                <Zap size={24} className="text-destructive-foreground" />
              </motion.button>
            </div>
          </>
        ) : (
          /* Results */
          <div className="w-full space-y-3">
            <h3 className="font-display font-bold text-foreground text-center">תוצאות המשבר</h3>
            {players.map((player) => (
              <div key={player.id} className="glass-panel p-3 flex items-center justify-between">
                <span className="font-display font-bold text-foreground text-sm">{player.name}</span>
                <span className="text-accent font-display font-black">{scores[player.id] || 0} לחיצות</span>
              </div>
            ))}
            <Button
              onClick={handleFinish}
              className="w-full bg-primary text-primary-foreground font-display"
            >
              סיום המשבר — חזרה למשחק
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NationalCrisis;
