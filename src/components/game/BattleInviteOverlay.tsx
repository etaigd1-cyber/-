import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';

const BattleInviteOverlay = () => {
  const {
    battleInviteData, localPlayerId, players, battleParticipants,
    joinBattleInvite, setPhase, timerEndAt,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(9);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);

  const isInitiator = battleInviteData?.initiatorId === localPlayerId;

  // Countdown timer synced from DB timestamp
  useEffect(() => {
    if (!battleInviteData) return;

    const endTime = timerEndAt ? new Date(timerEndAt).getTime() : battleInviteData.expiresAt;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (isInitiator) {
          setPhase('qr-select');
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [battleInviteData, timerEndAt, isInitiator, setPhase]);

  if (!battleInviteData) return null;

  const handleJoin = () => {
    if (!localPlayerId || hasJoined) return;
    joinBattleInvite(localPlayerId, battleInviteData?.bet ?? 1);
    setHasJoined(true);
  };

  const handleDecline = () => {
    setHasDeclined(true);
  };

  const handleSkipTimer = () => {
    if (isInitiator) {
      setPhase('qr-select');
    }
  };

  const myPlayer = players.find(p => p.id === localPlayerId);
  const myParty = myPlayer ? PARTIES.find(pt => pt.id === myPlayer.party) : null;

  // Initiator sees a waiting screen
  if (isInitiator) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 p-6"
      >
        <div className="flex items-center gap-2 text-accent">
          <Swords size={24} />
          <h2 className="text-xl font-display font-bold">ממתין למצטרפים...</h2>
        </div>

        <div className="glass-panel p-4 text-center w-full max-w-sm">
          <p className="text-sm text-foreground font-display">
            {battleInviteData.districtEmoji} <span className="font-bold">{battleInviteData.districtName}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            הימור: {battleInviteData.bet} מנדטים
          </p>
        </div>

        {/* Timer */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="w-20 h-20 rounded-full border-4 border-accent flex items-center justify-center"
            animate={{ borderColor: timeLeft <= 2 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))' }}
          >
            <span className="text-3xl font-display font-black text-foreground">{timeLeft}</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users size={14} />
          <span>{battleParticipants.length} מצטרפים</span>
        </div>

        {/* Show who joined */}
        <div className="flex gap-2 flex-wrap justify-center">
          {battleParticipants.map(pid => {
            const p = players.find(pl => pl.id === pid);
            const party = p ? PARTIES.find(pt => pt.id === p.party) : null;
            return (
              <div key={pid} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-display font-bold border border-coalition/50 bg-coalition/10 text-coalition">
                {party?.emoji} {p?.name} ✅
              </div>
            );
          })}
        </div>

        <Button onClick={handleSkipTimer} className="font-display">
          התחל עכשיו ⚔️
        </Button>
      </motion.div>
    );
  }

  // Other players see join invitation
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="flex flex-col items-center gap-4 p-6"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex items-center gap-2 text-destructive"
        >
          <Swords size={28} />
          <h2 className="text-xl font-display font-black">קרב פתוח!</h2>
        </motion.div>

        <div className="glass-panel p-4 text-center w-full max-w-sm border-t-2 border-destructive/50">
          <p className="text-sm text-foreground font-display">
            <span className="font-bold">{battleInviteData.initiatorName}</span> מאתגר/ת ב
          </p>
          <p className="text-lg font-display font-black text-accent mt-1">
            {battleInviteData.districtEmoji} {battleInviteData.districtName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            הימור: {battleInviteData.bet} מנדטים | מפסיד: -2 קנס
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Timer size={16} className={timeLeft <= 2 ? 'text-destructive' : 'text-accent'} />
          <span className={`text-2xl font-display font-black ${timeLeft <= 2 ? 'text-destructive' : 'text-accent'}`}>
            {timeLeft}
          </span>
        </div>

        {!hasJoined && !hasDeclined ? (
          <>
            <div className="flex gap-3">
              <Button
                onClick={handleJoin}
                size="lg"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-display text-lg px-8 gap-2"
              >
                <Swords size={18} />
                אני נכנס/ת! ⚔️
              </Button>
              <Button
                onClick={handleDecline}
                size="lg"
                variant="outline"
                className="font-display text-lg px-6"
              >
                לא הפעם 👋
              </Button>
            </div>
          </>
        ) : hasDeclined ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border">
            <span className="font-display font-bold text-muted-foreground text-sm">👋 ויתרת על הקרב. ממתין לסיום...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-coalition/15 border border-coalition/40">
            <span className="font-display font-bold text-coalition text-sm">✅ הצטרפת! ממתין לתחילת הקרב...</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BattleInviteOverlay;
