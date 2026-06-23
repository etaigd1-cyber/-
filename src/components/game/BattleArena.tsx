import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Radio, Zap, Shield, Hand } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { DISTRICTS, PARTIES } from '@/types/game';
import CrowdReaction from '@/components/game/CrowdReaction';
import { playTick, playBuzzer, playCorrect, playWrong } from '@/lib/audioEffects';
import { cleanAnswerText } from '@/lib/fetchGameData';
const BattleArena = () => {
  const {
    currentChallenge, timerSeconds, setPhase, selectedCategory,
    selectedDistrict, challengeDifficulty, crowdReaction,
    players, currentPlayerIndex, resolveRound, currentBet,
    addNewsHeadline, nextTurn,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const lastTickRef = useRef(-1);

  const district = DISTRICTS.find(d => d.id === selectedDistrict);
  const shouldShake = crowdReaction.boos > crowdReaction.claps && crowdReaction.boos > 0;
  const isKnowledge = selectedCategory === 'knowledge';
  const isMission = selectedCategory === 'mission';
  const currentPlayer = players[currentPlayerIndex];
  const currentParty = PARTIES.find(p => p.id === currentPlayer?.party);

  // Timer countdown with audio
  useEffect(() => {
    if (revealed || timedOut) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      if (isKnowledge) setRevealed(true);
      playBuzzer();
      return;
    }
    if (timeLeft !== lastTickRef.current) {
      lastTickRef.current = timeLeft;
      if (timeLeft <= 5) playTick(true);
      else if (timeLeft <= 15) playTick(false);
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, revealed, timedOut, isKnowledge]);

  useEffect(() => {
    if (!revealed && !timedOut) setTimeLeft(prev => Math.max(prev, timerSeconds));
  }, [timerSeconds, revealed, timedOut]);

  const answersMatch = (selected: string, correct: string) =>
    cleanAnswerText(selected) === cleanAnswerText(correct);

  const handleAnswer = useCallback((option: string) => {
    if (revealed || selectedAnswer) return;
    setSelectedAnswer(option);
    setRevealed(true);
    if (isKnowledge && currentChallenge) {
      answersMatch(option, currentChallenge.correctAnswer) ? playCorrect() : playWrong();
    }
  }, [revealed, selectedAnswer, isKnowledge, currentChallenge]);

  const isCorrect = selectedAnswer && currentChallenge
    ? answersMatch(selectedAnswer, currentChallenge.correctAnswer)
    : false;

  // 1:1 ratio — reward equals exact bet
  const mandateReward = currentBet;

  const handleKnowledgeResult = () => {
    if (timedOut || !isCorrect) {
      // Initiator (turn player) is NEVER penalized for failure — turn just ends
      addNewsHeadline(`📉 ${currentParty?.name} לא הצליחו בסבב הזה — התור עובר`, 'update');
    } else {
      resolveRound(currentPlayer.id);
      addNewsHeadline(`⚡ ${currentParty?.name} צדקו בעובדות וזכו ב-${mandateReward} מנדטים!`, 'breaking');
      return;
    }
    nextTurn();
  };

  const handleMissionComplete = () => {
    setMissionCompleted(true);
    playCorrect();
  };

  const handleProceedToVoting = () => setPhase('voting');

  const timerProgress = timeLeft / timerSeconds;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - timerProgress);

  // ─── NO CHALLENGE AVAILABLE ───
  if (!currentChallenge) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 p-6">
        <h2 className="text-xl font-display font-bold text-foreground">אין אתגר זמין</h2>
        <p className="text-muted-foreground text-center text-sm">נסו קטגוריה אחרת</p>
      </motion.div>
    );
  }

  // ─── KNOWLEDGE MODE ───
  if (isKnowledge) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={shouldShake ? { opacity: 1, scale: 1, x: [0, -3, 3, -3, 3, 0] } : { opacity: 1, scale: 1 }}
        transition={shouldShake ? { x: { repeat: Infinity, duration: 0.4 } } : undefined}
        className="flex flex-col items-center gap-4 p-4"
      >
        <DifficultyBadge difficulty={challengeDifficulty} />
        <div className="px-3 py-1 rounded-full text-[10px] font-display font-bold bg-primary/20 text-primary border border-primary/30">
          🤖 שיפוט אוטומטי — ידע
        </div>
        <LiveHeader district={district} />
        <CircularTimer timeLeft={timeLeft} timerSeconds={timerSeconds} circumference={circumference} strokeDashoffset={strokeDashoffset} />

        <div className="glass-panel p-5 w-full max-w-sm text-center border-t-2 border-accent/50">
          <p className="text-lg font-display font-bold text-foreground leading-relaxed">{currentChallenge.question}</p>
        </div>

        <div className="grid gap-3 w-full max-w-sm">
          <AnimatePresence>
            {currentChallenge.options.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = revealed && answersMatch(option, currentChallenge.correctAnswer);
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(option)}
                  disabled={revealed}
                  className={`party-card text-right transition-all ${
                    isCorrectOption ? 'border-coalition bg-coalition/20'
                      : isSelected && !isCorrect ? 'border-destructive bg-destructive/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body text-foreground">{option}</span>
                    {revealed && isCorrectOption && <CheckCircle2 size={20} className="text-coalition" />}
                    {revealed && isSelected && !isCorrect && <XCircle size={20} className="text-destructive" />}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {revealed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`px-6 py-3 rounded-xl font-display font-black text-lg ${
                timedOut || !isCorrect ? 'bg-destructive/20 text-destructive border border-destructive' : 'bg-coalition/20 text-coalition border border-coalition'
              }`}>
              {timedOut ? '⏰ נגמר הזמן!' : isCorrect ? '✅ תשובה נכונה!' : '❌ תשובה שגויה!'}
            </motion.div>
            <Button onClick={handleKnowledgeResult} className="bg-primary text-primary-foreground font-display text-lg px-8">
              {isCorrect ? `🏆 קבל ${mandateReward} מנדטים` : 'המשך ▶'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ─── MISSION MODE ───
  if (isMission) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={shouldShake ? { opacity: 1, scale: 1, x: [0, -3, 3, -3, 3, 0] } : { opacity: 1, scale: 1 }}
        transition={shouldShake ? { x: { repeat: Infinity, duration: 0.4 } } : undefined}
        className="flex flex-col items-center gap-4 p-4"
      >
        <DifficultyBadge difficulty={challengeDifficulty} />
        <div className="px-3 py-1 rounded-full text-[10px] font-display font-bold bg-accent/20 text-accent border border-accent/30">
          🗳️ שיפוט שולחן — משימה
        </div>
        <LiveHeader district={district} />
        <CircularTimer timeLeft={timeLeft} timerSeconds={timerSeconds} circumference={circumference} strokeDashoffset={strokeDashoffset} />

        <div className="glass-panel p-6 w-full max-w-sm text-center border-t-2 border-accent/50">
          {currentChallenge.difficultyLabel && (
            <p className="text-[10px] text-accent font-display font-bold mb-1">⚡ רמה: {currentChallenge.difficultyLabel}</p>
          )}
          {currentChallenge.title && (
            <p className="text-sm text-muted-foreground mb-2 font-display">💪 {currentChallenge.title}</p>
          )}
          {!currentChallenge.title && <p className="text-xs text-muted-foreground mb-2 font-display">💪 משימה</p>}
          <p className="text-xl font-display font-bold text-foreground leading-relaxed">{currentChallenge.question}</p>
        </div>

        <CrowdReaction />

        {!timedOut ? (
          !missionCompleted ? (
            <Button onClick={handleMissionComplete} size="lg"
              className="bg-coalition text-coalition-foreground font-display text-xl px-10 py-7 animate-pulse">
              <Hand size={24} className="ml-2" />
              ביצעתי את המשימה!
            </Button>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3">
              <div className="px-6 py-3 rounded-xl font-display font-black text-lg bg-coalition/20 text-coalition border border-coalition">✅ המשימה הושלמה!</div>
              <Button onClick={handleProceedToVoting} className="bg-primary text-primary-foreground font-display text-lg px-8">
                המשך להצבעת שולחן →
              </Button>
            </motion.div>
          )
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
            <div className="px-6 py-3 rounded-xl font-display font-black text-lg bg-destructive/20 text-destructive border border-destructive">⏰ נגמר הזמן!</div>
            <Button onClick={handleProceedToVoting} className="bg-primary text-primary-foreground font-display text-lg px-8">
              המשך להצבעת שולחן →
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ─── DEBATE MODE DISABLED ───
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-display font-bold text-foreground">מודול הדיבייט מושבת זמנית</h2>
      <p className="text-muted-foreground text-center text-sm">חזרו ובחרו קטגוריה אחרת</p>
    </motion.div>
  );
};

// ─── Sub-components ───

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  if (difficulty === 'normal') return null;
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-display font-bold ${
        difficulty === 'high-stakes' ? 'bg-accent/20 text-accent border border-accent' : 'bg-coalition/20 text-coalition border border-coalition'
      }`}>
      {difficulty === 'high-stakes' ? <Zap size={12} /> : <Shield size={12} />}
      {difficulty === 'high-stakes' ? 'הימור גבוה — 10+ מנדטים!' : 'מסלול בטוח — 2-3 מנדטים'}
    </motion.div>
  );
};

const LiveHeader = ({ district }: { district?: { emoji: string; name: string } }) => (
  <div className="w-full max-w-sm">
    <div className="flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-t-lg">
      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        <Radio size={14} />
      </motion.div>
      <span className="font-display font-black text-sm tracking-wider">שידור חי</span>
      {district && <span className="text-xs opacity-80 mr-auto">| {district.emoji} {district.name}</span>}
    </div>
  </div>
);

const CircularTimer = ({ timeLeft, timerSeconds, circumference, strokeDashoffset }: {
  timeLeft: number; timerSeconds: number; circumference: number; strokeDashoffset: number;
}) => (
  <div className="relative flex items-center justify-center">
    <svg width="100" height="100" className="-rotate-90">
      <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
      <motion.circle cx="50" cy="50" r="40"
        stroke={timeLeft <= 5 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
        strokeWidth="6" fill="none" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        transition={{ duration: 0.3 }}
      />
    </svg>
    <motion.span key={timeLeft}
      initial={{ scale: timeLeft <= 5 ? 1.5 : 1.2 }}
      animate={{ scale: 1, opacity: timeLeft <= 5 ? [1, 0.3, 1] : 1 }}
      transition={timeLeft <= 5 ? { opacity: { repeat: Infinity, duration: 0.5 } } : undefined}
      className={`absolute text-3xl font-display font-black ${timeLeft <= 5 ? 'text-destructive' : 'text-accent'}`}>
      {timeLeft}
    </motion.span>
  </div>
);

export default BattleArena;
