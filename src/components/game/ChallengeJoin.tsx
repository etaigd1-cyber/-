import { motion } from 'framer-motion';
import { Swords, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DISTRICTS, PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';

const ChallengeJoin = () => {
  const { players, currentPlayerIndex, battleParticipants, joinBattle, setPhase, selectedDistrict, districtMandates } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const otherPlayers = players.filter((_, i) => i !== currentPlayerIndex);
  const district = DISTRICTS.find(d => d.id === selectedDistrict);

  // Calculate available mandates
  const conquests = districtMandates[selectedDistrict || ''] || [];
  const takenMandates = conquests.reduce((sum, c) => sum + c.mandates, 0);
  const availableMandates = district ? Math.max(0, district.maxMandates - takenMandates) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 p-6"
    >
      <div className="flex items-center gap-2 text-accent">
        <Swords size={24} />
        <h2 className="text-xl font-display font-bold">מי נכנס לקרב?</h2>
      </div>

      <div className="glass-panel p-4 text-center w-full max-w-sm">
        <p className="text-sm text-foreground font-display">
          {district?.emoji} <span className="font-bold">{district?.name}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {availableMandates} מנדטים פנויים — הזוכה לוקח הכל!
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">מפסידים שמתמודדים: -2 מנדטים קנס</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users size={14} />
        <span>{battleParticipants.length} מצטרפים</span>
      </div>

      <div className="grid gap-2 w-full max-w-sm">
        {otherPlayers.map((player) => {
          const joined = battleParticipants.includes(player.id);
          const party = PARTIES.find(p => p.id === player.party);
          return (
            <motion.button
              key={player.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => !joined && joinBattle(player.id)}
              disabled={joined || battleParticipants.length >= 3}
              className={`district-card w-full flex items-center justify-between ${
                joined ? 'border-coalition/50 bg-coalition/10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{party?.emoji}</span>
                <div className="text-right">
                  <p className="font-display font-bold text-foreground text-sm">{player.name}</p>
                  <p className="text-[10px] text-muted-foreground">{player.mandates} מנדטים</p>
                </div>
              </div>
              <span className={`text-xs font-display font-bold ${joined ? 'text-coalition' : 'text-muted-foreground'}`}>
                {joined ? '✅ בפנים!' : '🤚 הצטרף!'}
              </span>
            </motion.button>
          );
        })}
      </div>

      <Button
        onClick={() => setPhase('qr-select')}
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-display text-base px-8"
      >
        התחל קרב ⚔️
      </Button>
    </motion.div>
  );
};

export default ChallengeJoin;
