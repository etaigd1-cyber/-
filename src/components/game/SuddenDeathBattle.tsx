import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Radio, Skull, Crown, Swords, Hourglass } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { DISTRICTS, PARTIES } from '@/types/game';
import { playTick, playBuzzer, playCorrect, playWrong } from '@/lib/audioEffects';
import { cleanAnswerText } from '@/lib/fetchGameData';
import PenaltyRegionSelect from './PenaltyRegionSelect';

const SuddenDeathBattle = () => {
  const {
    duelState, localPlayerId, selectedDistrict, currentBet, players,
    submitDuelAnswer, advanceDuel, nextTurn, districtMandates,
  } = useGameStore();

  const district = DISTRICTS.find(d => d.id === selectedDistrict);

  // Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const lastTickRef = useRef(-1);
  const [autoTransitionCount, setAutoTransitionCount] = useState<number | null>(null);

  const isMyTurn = duelState?.activeDuelistId === localPlayerId;
  const question = duelState?.currentQuestion;
  const isRevealed = duelState?.isRevealed ?? false;
  const selectedAnswer = duelState?.selectedAnswer ?? null;

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(30);
    lastTickRef.current = -1;
  }, [duelState?.questionIndex]);

  // Timer countdown
  useEffect(() => {
    if (!duelState || duelState.isOver || isRevealed) return;
    if (timeLeft <= 0) {
      playBuzzer();
      if (isMyTurn) {
        submitDuelAnswer('__timeout__');
      }
      return;
    }
    if (timeLeft !== lastTickRef.current) {
      lastTickRef.current = timeLeft;
      if (timeLeft <= 5) playTick(true);
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, duelState, isRevealed, isMyTurn, submitDuelAnswer]);

  // Auto-advance after answer is revealed (2 seconds)
  useEffect(() => {
    if (!isRevealed || !question || !selectedAnswer) return;
    const isCorrect = cleanAnswerText(selectedAnswer) === cleanAnswerText(question.correctAnswer);
    if (isCorrect) playCorrect();
    else playWrong();

    // Auto-advance after 2 seconds — only from the active duelist's device
    if (isMyTurn) {
      const timer = setTimeout(() => {
        advanceDuel();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, selectedAnswer, question, isMyTurn, advanceDuel]);

  // Auto-transition after duel ends and penalties resolved
  useEffect(() => {
    if (!duelState?.isOver) { setAutoTransitionCount(null); return; }
    const unresolvedPenalties = duelState.pendingPenalties.filter(p => !p.resolved);
    if (unresolvedPenalties.length > 0) { setAutoTransitionCount(null); return; }
    setAutoTransitionCount(3);
  }, [duelState?.isOver, duelState?.pendingPenalties]);

  useEffect(() => {
    if (autoTransitionCount === null || autoTransitionCount <= 0) return;
    const t = setTimeout(() => setAutoTransitionCount(c => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [autoTransitionCount]);

  useEffect(() => {
    if (autoTransitionCount === 0) {
      nextTurn();
    }
  }, [autoTransitionCount, nextTurn]);

  const handleAnswer = useCallback((option: string) => {
    if (!isMyTurn || isRevealed || selectedAnswer) return;
    submitDuelAnswer(option);
  }, [isMyTurn, isRevealed, selectedAnswer, submitDuelAnswer]);

  const handleAdvance = () => {
    advanceDuel();
  };

  if (!duelState) return null;

  const activeDuelist = duelState.participants.find(p => p.playerId === duelState.activeDuelistId);
  const activeDuelistPlayer = players.find(p => p.id === duelState.activeDuelistId);

  // ── Battle Over Screen ──
  if (duelState.isOver) {
    const winner = duelState.winnerId ? players.find(p => p.id === duelState.winnerId) : null;
    const isSoloPlay = duelState.participants.length === 1;

    // Check for unresolved penalties
    const unresolvedPenalties = duelState.pendingPenalties.filter(p => !p.resolved);
    const myPenalty = unresolvedPenalties.find(p => p.playerId === localPlayerId);

    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 p-6">
        {/* Large result announcement */}
        {isSoloPlay ? (
          winner ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              >
                <Crown size={72} className="text-accent" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-display font-black text-accent text-center"
              >
                הצלחה! 🎉
              </motion.h2>
              <p className="text-base text-foreground font-display text-center">
                +{currentBet} מנדטים ב{district?.name} {district?.emoji}
              </p>
            </>
          ) : (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <Skull size={72} className="text-destructive" />
              </motion.div>
              <h2 className="text-3xl font-display font-black text-destructive">נכשלת! 😵</h2>
              <p className="text-base text-muted-foreground">לא הצלחת לכבוש את המחוז</p>
            </>
          )
        ) : winner ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            >
              <Crown size={72} className="text-accent" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-black text-foreground text-center"
            >
              {winner.name} ניצח/ה! 👑
            </motion.h2>
            <p className="text-base text-foreground font-display text-center">
              כבש/ה {currentBet} מנדטים ב{district?.name} {district?.emoji}
            </p>
            {/* Eliminated players */}
            <div className="flex gap-2 flex-wrap justify-center">
              {duelState.participants.filter(p => p.eliminated).map(p => (
                <span key={p.playerId} className="text-xs font-display text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                  ❌ {p.playerName} הודח/ה
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
              <Skull size={72} className="text-destructive" />
            </motion.div>
            <h2 className="text-3xl font-display font-black text-destructive">אין מנצח! ☠️</h2>
            <p className="text-base text-muted-foreground">כל המתמודדים נפלו</p>
          </>
        )}

        {/* Penalty selection for the local loser */}
        {myPenalty && <PenaltyRegionSelect penalty={myPenalty} />}

        {/* Waiting for other penalties */}
        {!myPenalty && unresolvedPenalties.length > 0 && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="glass-panel p-4 text-center"
          >
            <p className="font-display font-bold text-foreground text-sm">
              ממתין ל{unresolvedPenalties.map(p => p.playerName).join(', ')} לבחור קנס...
            </p>
          </motion.div>
        )}

        {/* Auto-transition countdown */}
        {unresolvedPenalties.length === 0 && autoTransitionCount !== null && autoTransitionCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground font-display"
          >
            ממשיכים בעוד {autoTransitionCount}...
          </motion.p>
        )}
      </motion.div>
    );
  }

  if (!question) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 p-6">
        <p className="text-foreground font-display">אין שאלות זמינות</p>
        <Button onClick={() => nextTurn()} className="font-display">תור הבא</Button>
      </motion.div>
    );
  }

  const isCorrect = selectedAnswer
    ? cleanAnswerText(selectedAnswer) === cleanAnswerText(question.correctAnswer)
    : false;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - timeLeft / 30);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 p-4"
    >
      {/* Header */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 bg-destructive/80 text-destructive-foreground px-3 py-1.5 rounded-t-lg">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Radio size={12} />
          </motion.div>
          <span className="font-display font-black text-[10px] tracking-wider">SUDDEN DEATH</span>
          {district && <span className="text-[10px] opacity-80 mr-auto">| {district.emoji} {district.name}</span>}
        </div>
      </div>

      {/* Participants status */}
      <div className="flex gap-2 flex-wrap justify-center">
        {duelState.participants.map(p => {
          const party = PARTIES.find(pt => pt.id === p.partyId);
          const isActive = duelState.activeDuelistId === p.playerId;
          return (
            <div
              key={p.playerId}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-display font-bold border ${
                p.eliminated
                  ? 'border-destructive/30 bg-destructive/10 text-destructive line-through opacity-50'
                  : isActive
                    ? 'border-accent/50 bg-accent/15 text-accent'
                    : 'border-border bg-muted/30 text-muted-foreground'
              }`}
            >
              {party?.emoji} {p.playerName}
              {p.eliminated && ' ❌'}
              {isActive && !p.eliminated && ' 🎯'}
            </div>
          );
        })}
      </div>

      {/* Timer */}
      <div className="relative flex items-center justify-center">
        <svg width="90" height="90" className="-rotate-90">
          <circle cx="45" cy="45" r="40" stroke="hsl(var(--muted))" strokeWidth="5" fill="none" />
          <motion.circle
            cx="45" cy="45" r="40"
            stroke={timeLeft <= 5 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
            strokeWidth="5" fill="none" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.3 }}
          />
        </svg>
        <span className={`absolute text-2xl font-display font-black ${timeLeft <= 5 ? 'text-destructive' : 'text-accent'}`}>
          {timeLeft}
        </span>
      </div>

      {/* Current duelist indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30">
        <Swords size={14} className="text-accent" />
        <span className="text-xs font-display font-bold text-accent">
          תור של {activeDuelistPlayer?.name || activeDuelist?.playerName}
        </span>
      </div>

      {/* Question */}
      <div className="glass-panel p-4 w-full max-w-sm text-center border-t-2 border-accent/40">
        <p className="text-base font-display font-bold text-foreground leading-relaxed">{question.question}</p>
      </div>

      {/* Options — only active duelist can click */}
      {isMyTurn ? (
        <div className="grid gap-2 w-full max-w-sm">
          {question.options.map((option, i) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = isRevealed && cleanAnswerText(option) === cleanAnswerText(question.correctAnswer);
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(option)}
                disabled={isRevealed}
                className={`party-card text-right text-sm transition-all py-3 ${
                  isCorrectOption ? 'border-coalition bg-coalition/15'
                    : isSelected && !isCorrect ? 'border-destructive bg-destructive/15'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-foreground">{option}</span>
                  {isRevealed && isCorrectOption && <CheckCircle2 size={18} className="text-coalition" />}
                  {isRevealed && isSelected && !isCorrect && <XCircle size={18} className="text-destructive" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        /* Waiting screen for non-active players */
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          {!isRevealed ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="glass-panel p-6 w-full text-center"
            >
              <Hourglass size={32} className="text-accent mx-auto mb-2" />
              <p className="font-display font-bold text-foreground text-sm">
                ממתין לתשובה של {activeDuelistPlayer?.name}...
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">השאלה מוצגת על המסך שלהם</p>
            </motion.div>
          ) : (
            /* Show revealed answer to spectators too */
            <div className="grid gap-2 w-full">
              {question.options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = cleanAnswerText(option) === cleanAnswerText(question.correctAnswer);
                return (
                  <div
                    key={i}
                    className={`party-card text-right text-sm py-3 ${
                      isCorrectOption ? 'border-coalition bg-coalition/15'
                        : isSelected && !isCorrect ? 'border-destructive bg-destructive/15'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-body text-foreground">{option}</span>
                      {isCorrectOption && <CheckCircle2 size={18} className="text-coalition" />}
                      {isSelected && !isCorrect && <XCircle size={18} className="text-destructive" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Result + advance */}
      {isRevealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
          <div className={`px-4 py-2 rounded-lg font-display font-bold text-sm ${
            isCorrect ? 'bg-coalition/15 text-coalition border border-coalition/40' : 'bg-destructive/15 text-destructive border border-destructive/40'
          }`}>
            {isCorrect ? '✅ נכון!' : `❌ טעות! ${activeDuelistPlayer?.name} מודח/ת!`}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground font-display"
          >
            ממשיכים אוטומטית...
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SuddenDeathBattle;
