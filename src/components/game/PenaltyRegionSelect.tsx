import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Minus, User, MapPin } from 'lucide-react';
import { useGameStore, type PendingPenalty } from '@/store/gameStore';
import { DISTRICTS, type DistrictId } from '@/types/game';
import { Button } from '@/components/ui/button';

interface Props {
  penalty: PendingPenalty;
}

const PenaltyRegionSelect = ({ penalty }: Props) => {
  const { districtMandates, resolvePenalty, players } = useGameStore();
  const [mode, setMode] = useState<'choose' | 'personal' | 'district' | null>(null);

  const player = players.find(p => p.id === penalty.playerId);
  const personalMandates = player?.mandates ?? 0;

  // Find districts where this player has mandates
  const playerDistricts = Object.entries(districtMandates)
    .filter(([, conquests]) => conquests.some(c => c.playerId === penalty.playerId && c.mandates > 0))
    .map(([districtId, conquests]) => {
      const district = DISTRICTS.find(d => d.id === districtId);
      const playerConquest = conquests.find(c => c.playerId === penalty.playerId);
      return {
        districtId: districtId as DistrictId,
        district,
        mandates: playerConquest?.mandates || 0,
      };
    })
    .filter(d => d.district);

  const hasDistricts = playerDistricts.length > 0;
  const hasPersonal = personalMandates >= 2;

  // If no choice possible, auto-resolve from personal
  if (!hasDistricts && !hasPersonal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 p-4"
      >
        <div className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 px-4 py-2 rounded-lg">
          <AlertTriangle size={18} className="text-destructive" />
          <p className="font-display font-bold text-destructive text-sm">אין מנדטים להפסיד</p>
        </div>
        <Button onClick={() => resolvePenalty(penalty.playerId, null, 'personal')} className="font-display">
          המשך
        </Button>
      </motion.div>
    );
  }

  // Step 1: Choose deduction source
  if (!mode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-4 w-full max-w-sm mx-auto"
      >
        <div className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 px-4 py-2 rounded-lg w-full">
          <AlertTriangle size={18} className="text-destructive" />
          <div>
            <p className="font-display font-bold text-destructive text-sm">קנס הפסד!</p>
            <p className="text-[10px] text-muted-foreground">
              {penalty.playerName} — בחר/י מקור לניכוי 2 מנדטים
            </p>
          </div>
        </div>

        <div className="w-full space-y-3">
          {hasPersonal && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('personal')}
              className="district-card w-full text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-accent" />
                  <div>
                    <span className="font-display font-bold text-foreground text-sm">מאגר אישי</span>
                    <p className="text-[10px] text-muted-foreground">{personalMandates} מנדטים</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                  <Minus size={12} />
                  <span className="text-[10px] font-display font-bold">2</span>
                </div>
              </div>
            </motion.button>
          )}

          {hasDistricts && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('district')}
              className="district-card w-full text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <div>
                    <span className="font-display font-bold text-foreground text-sm">ויתור על מחוז</span>
                    <p className="text-[10px] text-muted-foreground">החזר מחוז לניטרלי</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                  <Minus size={12} />
                  <span className="text-[10px] font-display font-bold">מחוז</span>
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // Step 2a: Personal pool — confirm
  if (mode === 'personal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-4 w-full max-w-sm mx-auto"
      >
        <p className="font-display font-bold text-foreground text-sm">ניכוי 2 מנדטים מהמאגר האישי?</p>
        <div className="flex gap-3">
          <Button onClick={() => setMode(null)} variant="outline" className="font-display">חזרה</Button>
          <Button
            onClick={() => resolvePenalty(penalty.playerId, null, 'personal')}
            className="bg-destructive text-destructive-foreground font-display"
          >
            אשר ניכוי
          </Button>
        </div>
      </motion.div>
    );
  }

  // Step 2b: District selection
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 p-4 w-full max-w-sm mx-auto"
    >
      <div className="flex items-center justify-between w-full">
        <p className="font-display font-bold text-foreground text-sm">בחר מחוז לוויתור:</p>
        <Button onClick={() => setMode(null)} variant="ghost" size="sm" className="font-display text-xs">חזרה</Button>
      </div>

      <div className="w-full space-y-2">
        {playerDistricts.map(({ districtId, district, mandates }) => (
          <motion.button
            key={districtId}
            whileTap={{ scale: 0.97 }}
            onClick={() => resolvePenalty(penalty.playerId, districtId, 'district')}
            className="district-card w-full text-right"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{district?.emoji}</span>
                <span className="font-display font-bold text-foreground text-sm">{district?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-display">
                  {mandates} מנדטים
                </span>
                <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                  <Minus size={12} />
                  <span className="text-[10px] font-display font-bold">הכל</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default PenaltyRegionSelect;
