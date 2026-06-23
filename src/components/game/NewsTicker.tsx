import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Radio, Zap } from 'lucide-react';
import type { NewsHeadline } from '@/types/game';

const NewsTicker = () => {
  const { newsHeadlines } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const headlines = newsHeadlines.length > 0
    ? newsHeadlines
    : [{ id: '0', text: 'בדרך ל-61 — שידור חי מליל הבחירות!', type: 'update' as const, timestamp: Date.now() }];

  const current = headlines[currentIndex % headlines.length];

  // Typewriter effect
  useEffect(() => {
    const fullText = current.text;
    setDisplayText('');
    setIsTyping(true);
    setIsBreaking(current.type === 'breaking');
    let i = 0;

    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

    typeIntervalRef.current = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      }
    }, 40);

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [current.id, current.text]);

  // Cycle headlines
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentIndex, headlines.length]);

  // Flash effect for breaking news
  useEffect(() => {
    if (current.type === 'breaking') {
      setIsBreaking(true);
      const timeout = setTimeout(() => setIsBreaking(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [current.id, current.type]);

  const getTypeLabel = (type: NewsHeadline['type']) => {
    switch (type) {
      case 'breaking': return 'מבזק';
      case 'poll': return 'סקר';
      case 'alert': return 'עדכון';
      default: return 'חדשות';
    }
  };

  const getTypeBg = (type: NewsHeadline['type']) => {
    switch (type) {
      case 'breaking': return 'bg-destructive';
      case 'poll': return 'bg-primary';
      case 'alert': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Breaking flash overlay */}
      <AnimatePresence>
        {isBreaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-destructive pointer-events-none -top-4"
          />
        )}
      </AnimatePresence>

      {/* Main ticker bar */}
      <div className="relative">
        {/* Top accent line */}
        <motion.div
          className="h-[2px]"
          animate={isBreaking ? {
            background: [
              'linear-gradient(90deg, hsl(0 84% 60%), hsl(35 95% 55%), hsl(0 84% 60%))',
              'linear-gradient(90deg, hsl(35 95% 55%), hsl(0 84% 60%), hsl(35 95% 55%))',
            ]
          } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ background: 'linear-gradient(90deg, hsl(215 90% 52%), hsl(0 84% 60%), hsl(215 90% 52%))' }}
        />

        <div className="flex items-stretch bg-card/98 backdrop-blur-md">
          {/* LIVE badge */}
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-2.5">
            <motion.div
              animate={{ opacity: [1, 0.15, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Radio size={11} />
            </motion.div>
            <span className="font-display font-black text-[10px] tracking-[0.25em]">LIVE</span>
          </div>

          {/* Category badge */}
          <div className={`flex-shrink-0 flex items-center px-3 ${getTypeBg(current.type)}`}>
            <AnimatePresence mode="wait">
              <motion.span
                key={current.id + '-type'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-display font-black text-[11px] text-destructive-foreground tracking-wider"
              >
                {current.type === 'breaking' && <Zap size={10} className="inline ml-0.5 mb-0.5" />}
                {getTypeLabel(current.type)}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="w-px bg-border/50 my-1.5" />

          {/* Headline text with typewriter */}
          <div className="flex-1 flex items-center overflow-hidden px-3 py-2.5 min-h-[40px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <p className={`text-sm font-display font-bold leading-snug ${
                  current.type === 'breaking' ? 'text-destructive' :
                  current.type === 'poll' ? 'text-primary' :
                  current.type === 'alert' ? 'text-accent' :
                  'text-foreground'
                }`}>
                  {displayText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="inline-block w-0.5 h-4 bg-current mr-0.5 align-middle"
                    />
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Headline counter */}
          <div className="flex-shrink-0 flex items-center px-3 text-muted-foreground">
            <span className="text-[9px] font-display font-bold">
              {(currentIndex % headlines.length) + 1}/{Math.min(headlines.length, 10)}
            </span>
          </div>
        </div>

        {/* Scrolling secondary ticker */}
        <div className="bg-muted/80 overflow-hidden border-t border-border/30">
          <motion.div
            className="whitespace-nowrap py-1 px-4 text-[11px] text-muted-foreground font-body"
            animate={{ x: ['100%', '-100%'] }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {headlines.slice(0, 8).map((h, i) => (
              <span key={h.id}>
                {i > 0 && <span className="mx-3 text-border">◆</span>}
                {h.text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
