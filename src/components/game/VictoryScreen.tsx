import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, Star, Radio, Play, Award } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PARTIES, CATEGORIES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const VICTORY_VIDEO_URL = 'https://drive.google.com/file/d/1OQr-27e3jHzDhWX0C-GQhy1Ji01mO3Y6/preview';

const SATIRICAL_SENTENCES: Record<string, string[]> = {
  pm: [
    'העם אמר את דברו, ועכשיו העם יכול ללכת לישון. אני בקיסריה.',
    'תזמינו את המטוס הפרטי, ותוודאו שיש מספיק פיסטוקים.',
  ],
  opposition: [
    'הבחירות האלו נגנבו! אנחנו נמרר להם את החיים מהוועדות.',
    'הפסדתי בכבוד — דרך פוליטית לומר שלא היה לי סיכוי.',
  ],
  minister: [
    'לפחות יש לי רכב ולשכה. מישהו יודע מה המשרד שלי עושה?',
    'אני לשון המאזניים של הקפיטריה בכנסת.',
  ],
  junior: [
    'שלושה חודשים תליתי פוסטרים בגשם בשביל זה?',
    'אולי לא עברתי את החסימה, אבל הייתי הכי קרוב במצפון שלי.',
  ],
  penalty: [
    'הימרת על עתיד המדינה והפסדת. אפילו הלוביסטים כבר לא עונים לך.',
  ],
};

const getTitle = (mandates: number): { title: string; emoji: string; key: string } => {
  if (mandates >= 61) return { title: 'ראש הממשלה', emoji: '👑', key: 'pm' };
  if (mandates >= 45) return { title: 'ראש האופוזיציה', emoji: '⚔️', key: 'opposition' };
  if (mandates >= 20) return { title: 'שר בלי תיק', emoji: '💼', key: 'minister' };
  return { title: 'פעיל זוטר', emoji: '📋', key: 'junior' };
};

const getRandomSentence = (key: string): string => {
  const arr = SATIRICAL_SENTENCES[key] || SATIRICAL_SENTENCES.junior;
  return arr[Math.floor(Math.random() * arr.length)];
};

const VictoryScreen = () => {
  const { players } = useGameStore();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);

  const sorted = [...players].sort((a, b) => b.mandates - a.mandates);
  const winner = sorted[0];
  const winnerParty = PARTIES.find(p => p.id === winner?.party);

  const mvpBattles = [...players].sort((a, b) => b.battlesWon - a.battlesWon)[0];
  const bestCategory = winner ? Object.entries(winner.categoryStats)
    .sort(([, a], [, b]) => b.won - a.won)[0] : null;
  const bestCatInfo = bestCategory ? CATEGORIES.find(c => c.id === bestCategory[0]) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 p-4 min-h-screen bg-background"
    >
      {/* Video Overlay */}
      <AnimatePresence>
        {showVideo && !videoEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <iframe
              src={VICTORY_VIDEO_URL}
              width="100%"
              height="70%"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="max-w-2xl"
            />
            <Button
              onClick={() => setVideoEnded(true)}
              variant="outline"
              className="mt-4 text-white border-white/30 hover:bg-white/10"
            >
              דלג לתוצאות ⏭️
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breaking News Banner */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Radio size={16} />
          </motion.div>
          <span className="font-display font-black text-sm tracking-wider">מבזק — ממשלה חדשה הוקמה!</span>
        </div>
      </div>

      {/* Winner Crown */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
        className="relative"
      >
        <Crown size={64} className="text-accent" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2"
        >
          <Star size={20} className="text-accent fill-accent" />
        </motion.div>
      </motion.div>

      <div className="text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-display font-black text-gradient-primary mb-1"
        >
          מר ראש הממשלה
        </motion.h1>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="text-3xl">{winnerParty?.emoji}</span>
          <span className="text-2xl font-display font-black text-foreground">{winner?.name}</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-accent font-display font-bold text-lg mt-1"
        >
          {winner?.mandates} מנדטים!
        </motion.p>
      </div>

      {/* Ranked Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="glass-panel p-4 w-full max-w-sm space-y-3"
      >
        <h3 className="font-display font-bold text-foreground text-center flex items-center justify-center gap-2">
          <Award size={18} className="text-accent" />
          הרכב הממשלה החדשה
        </h3>

        <div className="space-y-2">
          {sorted.map((player, i) => {
            const party = PARTIES.find(p => p.id === player.party);
            const { title, emoji: titleEmoji, key } = getTitle(player.mandates);
            const sentence = getRandomSentence(key);
            const isWinner = i === 0;
            return (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                className={`rounded-lg px-3 py-3 ${
                  isWinner ? 'bg-accent/15 border border-accent/30' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-bold text-muted-foreground">#{i + 1}</span>
                    <span>{party?.emoji}</span>
                    <div>
                      <span className="font-display font-bold text-foreground text-sm block">{player.name}</span>
                      <span className="text-[10px] text-muted-foreground">{titleEmoji} {title}</span>
                    </div>
                  </div>
                  <span className={`font-display font-bold text-sm ${isWinner ? 'text-accent' : 'text-foreground'}`}>
                    {player.mandates}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground italic font-body pr-7">
                  "{sentence}"
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* MVP Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="glass-panel p-4 w-full max-w-sm"
      >
        <h3 className="font-display font-bold text-foreground text-center mb-3">📊 סטטיסטיקות</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Trophy size={18} className="text-accent mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">MVP קרבות</p>
            <p className="font-display font-bold text-foreground text-sm">{mvpBattles?.name}</p>
            <p className="text-xs text-accent">{mvpBattles?.battlesWon} ניצחונות</p>
          </div>
          {bestCatInfo && (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <span className="text-lg">{bestCatInfo.emoji}</span>
              <p className="text-[10px] text-muted-foreground">קטגוריה חזקה</p>
              <p className="font-display font-bold text-foreground text-sm">{bestCatInfo.name}</p>
              <p className="text-xs text-primary">{bestCategory?.[1]?.won} ניצחונות</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex gap-3">
        {!videoEnded && (
          <Button onClick={() => setShowVideo(true)} variant="outline" className="font-display">
            <Play size={16} className="ml-1" /> צפה בוידאו
          </Button>
        )}
        <Button
          onClick={() => navigate('/')}
          size="lg"
          className="bg-primary text-primary-foreground font-display text-lg px-8"
        >
          משחק חדש 🗳️
        </Button>
      </div>
    </motion.div>
  );
};

export default VictoryScreen;
