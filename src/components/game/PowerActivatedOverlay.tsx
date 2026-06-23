import { motion, AnimatePresence } from 'framer-motion';
import { Lock, SkipForward, Users, Gift, Zap, AlertTriangle } from 'lucide-react';

type CardType = 'jail' | 'skip_self' | 'skip_pick' | 'bonus_2' | 'bonus_3' | 'bonus_5' | 'global_mission';

const CARD_STYLE: Record<CardType, { bg: string; icon: React.ReactNode; label: string }> = {
  jail:           { bg: 'from-destructive/80 to-destructive/40', icon: <Lock size={64} />, label: '🔒 נשלחת לחקירה!' },
  skip_self:      { bg: 'from-muted-foreground/60 to-muted/40', icon: <SkipForward size={64} />, label: '⏭️ דילוג עצמי' },
  skip_pick:      { bg: 'from-accent/80 to-accent/40', icon: <Users size={64} />, label: '🎯 דילוג על יריב!' },
  bonus_2:        { bg: 'from-coalition/80 to-coalition/40', icon: <Gift size={64} />, label: '🎁 בונוס +2 מנדטים!' },
  bonus_3:        { bg: 'from-coalition/80 to-coalition/40', icon: <Gift size={64} />, label: '🎁 בונוס +3 מנדטים!' },
  bonus_5:        { bg: 'from-accent/80 to-accent/40', icon: <Zap size={64} />, label: '💰 בונוס +5 מנדטים!' },
  global_mission: { bg: 'from-primary/80 to-primary/40', icon: <AlertTriangle size={64} />, label: '🌍 משימה גלובלית!' },
};

const DEFAULT_STYLE = { bg: 'from-primary/80 to-primary/40', icon: <Zap size={64} />, label: '' };

interface Props {
  cardType: string | null;
  cardLabel?: string;
  onComplete: () => void;
}

const PowerActivatedOverlay = ({ cardType, cardLabel, onComplete }: Props) => {
  if (!cardType) return null;
  const style = CARD_STYLE[cardType as CardType] ?? { ...DEFAULT_STYLE, label: cardLabel || `⚡ ${cardType}` };
  const displayLabel = cardLabel || style.label;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => {
          setTimeout(onComplete, 2000);
        }}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b ${style.bg} backdrop-blur-md`}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
          className="text-white mb-6"
        >
          {style.icon}
        </motion.div>
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-display font-black text-white text-center px-6"
        >
          {displayLabel}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/70 text-sm font-display mt-4"
        >
          פקודה בוצעה בהצלחה ⚡
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};

export default PowerActivatedOverlay;
