import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Radio, Camera, Check, SkipForward } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';

const GlobalMission = () => {
  const { players, challenges, addMandates, addNewsHeadline, nextTurn } = useGameStore();

  // Pick a random mission from sheets
  const missions = challenges.filter(c => c.challengeType === 'mission');
  const [mission] = useState(() =>
    missions.length > 0 ? missions[Math.floor(Math.random() * missions.length)] : null
  );

  const [completedBy, setCompletedBy] = useState<Set<string>>(new Set());
  const [skippedBy, setSkippedBy] = useState<Set<string>>(new Set());
  const [proofPhotos, setProofPhotos] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const allResponded = players.every(p => completedBy.has(p.id) || skippedBy.has(p.id));

  const handleComplete = (playerId: string) => {
    setCompletedBy(prev => new Set(prev).add(playerId));
    const player = players.find(p => p.id === playerId);
    addNewsHeadline(`✅ ${player?.name} ביצע/ה את המשימה הגלובלית!`, 'update');
  };

  const handleSkip = (playerId: string) => {
    setSkippedBy(prev => new Set(prev).add(playerId));
  };

  const handleUploadProof = (playerId: string) => {
    setUploadingFor(playerId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;
    const url = URL.createObjectURL(file);
    setProofPhotos(prev => ({ ...prev, [uploadingFor]: url }));
    setUploadingFor(null);
    e.target.value = '';
  };

  const handleFinish = () => {
    // First completer gets +3 bonus
    const completers = [...completedBy];
    if (completers.length > 0) {
      addMandates(completers[0], 3);
      const first = players.find(p => p.id === completers[0]);
      addNewsHeadline(`🏆 ${first?.name} סיים/ה ראשון/ה את המשימה! +3 בונוס!`, 'breaking');
    }
    setFinished(true);
    nextTurn();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 p-4"
    >
      {/* Breaking banner */}
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg">
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Radio size={16} />
          </motion.div>
          <AlertTriangle size={18} />
          <span className="font-display font-black text-sm">מבזק — משימה גלובלית!</span>
        </div>
      </motion.div>

      {/* Mission text */}
      <div className="glass-panel p-5 w-full max-w-sm text-center border-t-2 border-destructive/40">
        {mission?.title && (
          <p className="text-xs text-muted-foreground font-display mb-2">{mission.title}</p>
        )}
        <p className="text-base font-display font-bold text-foreground leading-relaxed">
          {mission?.question || 'כל השחקנים — בצעו את המשימה!'}
        </p>
      </div>

      {/* Player responses */}
      <div className="w-full max-w-sm space-y-2">
        {players.map(player => {
          const party = PARTIES.find(p => p.id === player.party);
          const done = completedBy.has(player.id);
          const skipped = skippedBy.has(player.id);
          const hasProof = proofPhotos[player.id];

          return (
            <div
              key={player.id}
              className={`rounded-lg border p-3 ${
                done ? 'border-coalition/40 bg-coalition/10'
                  : skipped ? 'border-muted-foreground/20 bg-muted/30 opacity-60'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{party?.emoji}</span>
                  <span className="font-display font-bold text-foreground text-sm">{player.name}</span>
                </div>
                {done && <Check size={16} className="text-coalition" />}
              </div>

              {!done && !skipped && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleComplete(player.id)} className="flex-1 font-display gap-1">
                    <Check size={14} /> ביצעתי
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSkip(player.id)} className="font-display gap-1">
                    <SkipForward size={14} /> דלג
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleUploadProof(player.id)} className="font-display">
                    <Camera size={14} />
                  </Button>
                </div>
              )}

              {hasProof && (
                <img src={hasProof} alt="הוכחה" className="w-full h-24 object-cover rounded-lg mt-2" />
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {allResponded && (
        <Button onClick={handleFinish} size="lg" className="font-display text-lg px-8">
          סיום משימה — המשך משחק ▶
        </Button>
      )}
    </motion.div>
  );
};

export default GlobalMission;
