import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, MapPin, ArrowLeft } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DISTRICTS, PARTIES } from '@/types/game';
import { toast } from 'sonner';

const SKIP_QUIPS = [
  '🐔 פחדנות מזוהה! דילגת על המשימה אבל גבית את המיסים.',
  '😏 איזו אומץ… לברוח. לפחות תגבה מנדטים פסיביים.',
  '🏃 נמלט מהקרב! אבל הארנק עדיין פתוח...',
  '🤡 בוחר בדרך הקלה? לפחות תבדוק אם נחתת בעיר שלך.',
  '💤 דילגת? השקט הזה מחשיד. בטח תכננת משהו.',
];

const SkipTurnPanel = () => {
  const {
    players, currentPlayerIndex, districtMandates, localPlayerId,
    activePlayerId, addMandates, addNewsHeadline, nextTurn, selectedDistrict,
  } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const isActivePlayer = localPlayerId === activePlayerId || localPlayerId === currentPlayer?.id;

  const [phase, setPhase] = useState<'confirm' | 'city-check' | 'done'>('confirm');

  if (!isActivePlayer || !currentPlayer) return null;

  // Find districts owned by current player
  const ownedDistricts = Object.entries(districtMandates)
    .filter(([, conquests]) => conquests.some(c => c.playerId === currentPlayer.id && c.mandates > 0))
    .map(([districtId]) => DISTRICTS.find(d => d.id === districtId)!)
    .filter(Boolean);

  const handleSkip = () => {
    const quip = SKIP_QUIPS[Math.floor(Math.random() * SKIP_QUIPS.length)];
    toast(quip, { duration: 4000 });
    addNewsHeadline(`⏭️ ${currentPlayer.name} מדלג/ת על התור! ${quip.split(' ').slice(1, 5).join(' ')}...`, 'alert');
    setPhase('city-check');
  };

  const handleLandedInMyCity = (districtId: string) => {
    // Passive mandate collection: +1 for each owned district landed on
    const conquest = (districtMandates[districtId] || []).find(c => c.playerId === currentPlayer.id);
    if (conquest && conquest.mandates > 0) {
      const bonus = 1; // passive collection rule
      addMandates(currentPlayer.id, bonus);
      const district = DISTRICTS.find(d => d.id === districtId);
      toast.success(`+${bonus} מנדט פסיבי מ${district?.name}!`);
      addNewsHeadline(`🏠 ${currentPlayer.name} גובה מנדט פסיבי מ${district?.name}`, 'update');
    }
    setPhase('done');
    setTimeout(() => nextTurn(), 1500);
  };

  const handleFinishTurn = () => {
    setPhase('done');
    nextTurn();
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'confirm' && (
        <motion.div
          key="skip-confirm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-20 left-0 right-0 flex flex-col items-center gap-3 px-4 z-50"
        >
          <button
            onClick={handleSkip}
            className="w-[85%] py-3.5 rounded-full text-white font-bold text-base transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(30, 30, 30, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <SkipForward size={18} />
              דלג תור
            </span>
          </button>
        </motion.div>
      )}

      {phase === 'city-check' && (
        <motion.div
          key="city-check"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-20 left-0 right-0 flex flex-col items-center gap-3 px-4 z-50"
        >
          {ownedDistricts.length > 0 && (
            <>
              <p className="text-xs text-white/70 font-display">נחתת בעיר שלך? בחר מחוז לגביית מנדט פסיבי:</p>
              <div className="flex flex-wrap gap-2 justify-center w-[85%]">
                {ownedDistricts.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleLandedInMyCity(d.id)}
                    className="px-4 py-2.5 rounded-full text-white font-bold text-sm transition-all active:scale-[0.98]"
                    style={{
                      background: 'rgba(30, 30, 30, 0.7)',
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {d.emoji} {d.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleFinishTurn}
            className="w-[85%] py-3.5 rounded-full text-white font-bold text-base transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(30, 30, 30, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft size={18} />
              סיים תור
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkipTurnPanel;
