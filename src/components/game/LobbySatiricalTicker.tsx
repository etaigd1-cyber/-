import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

const TICKER_TEXT = 'דיון גורלי ב-Lobby: מי יתפוס את הכסא? | המועמדים ממתינים, המנחה מביטה | מנחם בגין מציע לכולם קפה שחור | יצחק רבין מפעיל את אפקט \'שירת הסטיקר\' כדי לנטרל את היריבים | משה דיין פוזל לכיוון הקארד \'תעלה\' | גולדה מאיר מפעילה את אפקט \'יוה"כ\' וכולם במתח | בחרת: יצחק רבין';

const LobbySatiricalTicker = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Top accent line */}
      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(215 90% 52%), hsl(0 84% 60%), hsl(215 90% 52%))' }} />

      <div className="flex items-stretch" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)' }}>
        {/* LIVE badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-2">
          <motion.div animate={{ opacity: [1, 0.15, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Radio size={11} />
          </motion.div>
          <span className="font-display font-black text-[10px] tracking-[0.25em]">LIVE</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden flex items-center">
          <motion.p
            className="whitespace-nowrap text-xs font-display font-bold text-muted-foreground px-4"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {TICKER_TEXT}
          </motion.p>
        </div>

        {/* FUNFINITY branding */}
        <div className="flex-shrink-0 flex items-center px-3">
          <span className="text-[9px] font-display text-muted-foreground/60 tracking-wider">FUNFINITY</span>
        </div>
      </div>
    </div>
  );
};

export default LobbySatiricalTicker;
