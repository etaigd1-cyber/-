import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Challenge } from '@/types/game';
import israelMap from '@/assets/israel-map-bg.png';
import { playCorrect, playWrong } from '@/lib/audioEffects';

/**
 * Approximate km represented by 1% of the map image (either axis).
 * The image is a stylized district cartogram, not a true geographic projection,
 * so this is a tuned approximation, not a survey-grade conversion — see אפיון_מצבי_משחק.docx.
 */
const KM_PER_PCT = 4.5;

interface ScoreTier {
  label: string;
  rewardPct: number;
  colorClass: string;
}

function getTier(distanceKm: number): ScoreTier {
  if (distanceKm < 5) return { label: 'קליעה מדויקת! 🎯', rewardPct: 1, colorClass: 'text-coalition' };
  if (distanceKm < 20) return { label: 'קרוב מאוד!', rewardPct: 0.75, colorClass: 'text-primary' };
  if (distanceKm < 50) return { label: 'באזור הנכון', rewardPct: 0.5, colorClass: 'text-accent' };
  return { label: 'רחוק מדי...', rewardPct: 0, colorClass: 'text-destructive' };
}

interface MapPinChallengeProps {
  challenge: Challenge;
  bet: number;
  timedOut: boolean;
  onResolved: (rewardMandates: number) => void;
}

const MapPinChallenge = ({ challenge, bet, timedOut, onResolved }: MapPinChallengeProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [guess, setGuess] = useState<{ xPct: number; yPct: number } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const target = challenge.mapTarget;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (revealed || timedOut || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setGuess({ xPct, yPct });
  };

  const handleConfirm = () => {
    if (!guess || !target) return;
    setRevealed(true);
    const dx = (guess.xPct - target.xPct) * KM_PER_PCT;
    const dy = (guess.yPct - target.yPct) * KM_PER_PCT;
    const distanceKm = Math.sqrt(dx * dx + dy * dy);
    const tier = getTier(distanceKm);
    if (tier.rewardPct > 0) playCorrect(); else playWrong();
  };

  const distanceKm = guess && target
    ? Math.sqrt(((guess.xPct - target.xPct) * KM_PER_PCT) ** 2 + ((guess.yPct - target.yPct) * KM_PER_PCT) ** 2)
    : null;
  const tier = distanceKm !== null ? getTier(distanceKm) : null;
  const rewardMandates = tier ? Math.round(bet * tier.rewardPct) : 0;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      {challenge.imageUrl && (
        <div className="glass-panel p-2 w-full overflow-hidden rounded-lg">
          <img src={challenge.imageUrl} alt={challenge.question} className="w-full h-40 object-cover rounded" />
        </div>
      )}
      <p className="text-sm text-muted-foreground font-display">איפה נמצא/ת <span className="font-bold text-foreground">{challenge.question}</span>? לחצו על המפה כדי לנעוץ סיכה</p>

      <div
        ref={mapRef}
        onClick={handleMapClick}
        className="relative w-full max-w-[220px] mx-auto rounded-lg overflow-hidden border-2 border-border cursor-crosshair select-none"
      >
        <img src={israelMap} alt="מפת ישראל" className="w-full h-auto pointer-events-none" draggable={false} />

        {guess && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${guess.xPct}%`, top: `${guess.yPct}%` }}
          >
            <MapPin size={24} className="text-primary drop-shadow" fill="currentColor" />
          </motion.div>
        )}

        {revealed && target && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${target.xPct}%`, top: `${target.yPct}%` }}
          >
            <Target size={22} className="text-coalition drop-shadow" />
          </motion.div>
        )}
      </div>

      {!revealed && !timedOut && (
        <Button onClick={handleConfirm} disabled={!guess} className="bg-primary text-primary-foreground font-display px-8">
          אשר מיקום
        </Button>
      )}

      {timedOut && !revealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <div className="px-6 py-3 rounded-xl font-display font-black text-lg bg-destructive/20 text-destructive border border-destructive">⏰ נגמר הזמן!</div>
          <Button onClick={() => onResolved(0)} className="bg-primary text-primary-foreground font-display text-lg px-8">המשך ▶</Button>
        </motion.div>
      )}

      <AnimatePresence>
        {revealed && tier && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
            <p className={`font-display font-black text-lg ${tier.colorClass}`}>{tier.label}</p>
            <p className="text-xs text-muted-foreground">מרחק משוער: כ-{Math.round(distanceKm ?? 0)} ק"מ מהמיקום המדויק</p>
            <Button onClick={() => onResolved(rewardMandates)} className="bg-primary text-primary-foreground font-display text-lg px-8">
              {rewardMandates > 0 ? `🏆 קבל ${rewardMandates} מנדטים` : 'המשך ▶'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPinChallenge;
