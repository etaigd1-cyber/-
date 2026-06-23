import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mic, Users, Timer, Radio } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

const WowEvent = () => {
  const { wowEvent, nextTurn, players } = useGameStore();
  const [countdown, setCountdown] = useState(wowEvent === 'screen-lock-debate' ? 3 : 30);
  const [phase, setPhase] = useState<'intro' | 'active' | 'done'>('intro');

  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('active'), 3000);
      return () => clearTimeout(t);
    }
    if (phase === 'active' && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'active' && countdown <= 0) {
      setPhase('done');
    }
  }, [phase, countdown]);

  const eventConfig = {
    'screen-lock-debate': {
      icon: <Mic size={56} className="text-secondary" />,
      title: 'נעילת מסך — נאום חי!',
      description: 'נושא מוצג למשך 3 שניות, אחר כך 10 שניות לנאום!',
      topic: 'האם צריך להוריד את גיל ההצבעה ל-16?',
    },
    'election-flash': {
      icon: <Zap size={56} className="text-accent" />,
      title: 'מבזק בחירות!',
      description: 'סבב טריוויה מהיר של 30 שניות לכל השחקנים!',
      topic: '',
    },
    'forced-team': {
      icon: <Users size={56} className="text-coalition" />,
      title: 'צוות כפוי!',
      description: `${players[0]?.name || 'שחקן 1'} ו-${players[1]?.name || 'שחקן 2'} חייבים לשתף פעולה באתגר הבא!`,
      topic: '',
    },
  };

  const config = eventConfig[wowEvent || 'screen-lock-debate'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 p-4 min-h-[70vh] relative"
    >
      {/* Full-screen dramatic overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-destructive/20 via-background to-background pointer-events-none"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* LIVE badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-2 rounded-lg">
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Radio size={16} />
          </motion.div>
          <span className="font-display font-black text-lg tracking-[0.2em]">LIVE</span>
        </div>
      </motion.div>

      {/* Breaking banner */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="breaking-banner rounded-lg text-lg">
          ⚡ חדשות מתפרצות ⚡
        </div>
      </motion.div>

      {/* Icon with dramatic animation */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', bounce: 0.4 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            filter: ['drop-shadow(0 0 10px transparent)', 'drop-shadow(0 0 20px hsl(var(--accent) / 0.5))', 'drop-shadow(0 0 10px transparent)']
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {config.icon}
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-2xl font-display font-black text-foreground text-center relative z-10"
      >
        {config.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-muted-foreground text-sm text-center relative z-10"
      >
        {config.description}
      </motion.p>

      {config.topic && phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="glass-panel p-5 w-full max-w-sm border-accent/30 border relative z-10"
        >
          <p className="font-display font-bold text-accent text-lg text-center">{config.topic}</p>
        </motion.div>
      )}

      {phase === 'active' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-2"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent"
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <div className="w-24 h-24 rounded-full bg-card border-2 border-accent flex items-center justify-center">
              <Timer size={20} className="text-accent absolute top-2" />
              <span className="text-4xl font-display font-black text-accent">{countdown}</span>
            </div>
          </div>
        </motion.div>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <Button
            onClick={nextTurn}
            size="lg"
            className="bg-primary text-primary-foreground font-display text-lg px-8"
          >
            חזרה לאולפן →
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WowEvent;
