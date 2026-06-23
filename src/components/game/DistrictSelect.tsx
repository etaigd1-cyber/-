import { motion } from 'framer-motion';
import { MapPin, Radio, Lock, Hourglass } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DISTRICTS, PARTIES, type DistrictId } from '@/types/game';

const DistrictSelect = () => {
  const { selectDistrict, players, currentPlayerIndex, districtMandates, localPlayerId, activePlayerId } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  // Only the active player can interact
  const isActivePlayer = localPlayerId === activePlayerId || localPlayerId === currentPlayer?.id;

  const getAvailableMandates = (districtId: DistrictId) => {
    const district = DISTRICTS.find(d => d.id === districtId)!;
    const conquests = districtMandates[districtId] || [];
    const taken = conquests.reduce((sum, c) => sum + c.mandates, 0);
    return Math.max(0, district.maxMandates - taken);
  };

  // Non-active players see waiting screen
  if (!isActivePlayer) {
    const activePlayer = players.find(p => p.id === (activePlayerId || currentPlayer?.id));
    const party = activePlayer ? PARTIES.find(pt => pt.id === activePlayer.party) : null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5 p-6"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Hourglass size={40} className="text-accent" />
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground">ממתין לבחירת מחוז</h2>
        <div className="glass-panel p-4 text-center w-full max-w-sm">
          <p className="text-sm text-foreground font-display">
            {party?.emoji} <span className="font-bold">{activePlayer?.name}</span> בוחר/ת מחוז...
          </p>
        </div>
        <p className="text-xs text-muted-foreground">המשחק ימשיך אוטומטית</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 p-4"
    >
      {/* Live Banner */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 bg-destructive/80 text-destructive-foreground px-4 py-2 rounded-lg">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <Radio size={14} />
          </motion.div>
          <span className="font-display font-black text-xs tracking-wider">שידור חי</span>
          <span className="text-[10px] opacity-80 mr-auto">| בחירת מחוז</span>
        </div>
      </motion.div>

      <div className="text-center">
        <h2 className="text-lg font-display font-bold text-foreground">
          תור של {currentPlayer?.name}
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          <MapPin size={12} className="inline ml-1" />
          בחר מחוז להתמודדות
        </p>
      </div>

      {/* District Cards List */}
      <div className="w-full max-w-md space-y-2">
        {DISTRICTS.map((district, i) => {
          const available = getAvailableMandates(district.id);
          const conquests = districtMandates[district.id] || [];
          const isFull = available === 0;

          return (
            <motion.button
              key={district.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isFull && selectDistrict(district.id)}
              disabled={isFull}
              className={`district-card w-full text-right ${
                isFull ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{district.emoji}</span>
                  <div>
                    <span className="font-display font-bold text-foreground text-sm block">
                      {district.name}
                    </span>
                    {conquests.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {conquests.map((c, j) => {
                          const party = PARTIES.find(p => p.id === c.partyId);
                          return (
                            <div
                              key={j}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-display font-bold"
                              style={{
                                backgroundColor: `hsl(var(--party-${c.partyId}) / 0.2)`,
                                color: `hsl(var(--party-${c.partyId}))`,
                              }}
                            >
                              {party?.emoji} {c.mandates}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left">
                  {isFull ? (
                    <div className="flex items-center gap-1 text-destructive">
                      <Lock size={12} />
                      <span className="text-[10px] font-display font-bold">0 מנדטים פנויים</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-display font-bold text-coalition text-sm">{available}</span>
                      <span className="text-muted-foreground text-[10px]">/{district.maxMandates}</span>
                      <span className="text-[9px] text-muted-foreground block">פנויים</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DistrictSelect;
