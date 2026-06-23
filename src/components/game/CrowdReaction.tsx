import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const CrowdReaction = () => {
  const { players, currentPlayerIndex, crowdReaction, addCrowdReaction } = useGameStore();
  const otherPlayers = players.filter((_, i) => i !== currentPlayerIndex);

  // Only show for non-active players (in a real multiplayer scenario, each device would show this)
  // For local play, we show reaction buttons for all non-active players
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto mt-4"
    >
      <div className="glass-panel p-3">
        <p className="text-xs text-muted-foreground text-center mb-2 font-display">תגובת הקהל</p>

        {/* Reaction counters */}
        <div className="flex items-center justify-center gap-6 mb-3">
          <div className="text-center">
            <span className="text-2xl">👏</span>
            <motion.p
              key={crowdReaction.claps}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-lg font-display font-black text-coalition"
            >
              {crowdReaction.claps}
            </motion.p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="text-2xl">👎</span>
            <motion.p
              key={crowdReaction.boos}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-lg font-display font-black text-destructive"
            >
              {crowdReaction.boos}
            </motion.p>
          </div>
        </div>

        {/* Reaction bar */}
        {(crowdReaction.claps + crowdReaction.boos > 0) && (
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-coalition rounded-full"
              initial={{ width: '50%' }}
              animate={{
                width: `${(crowdReaction.claps / (crowdReaction.claps + crowdReaction.boos)) * 100}%`
              }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        )}

        {/* Buttons for each non-active player */}
        <div className="space-y-2">
          {otherPlayers.map((player) => {
            const hasVoted = crowdReaction.voters.includes(player.id);
            return (
              <div key={player.id} className="flex items-center gap-2">
                <span className="text-xs font-display text-foreground flex-1">{player.name}</span>
                {hasVoted ? (
                  <span className="text-xs text-muted-foreground">הצביע/ה ✓</span>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => addCrowdReaction(player.id, 'clap')}
                      className="px-4 py-2 rounded-lg bg-coalition/20 text-coalition font-bold text-lg hover:bg-coalition/30 transition-colors"
                    >
                      👏
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => addCrowdReaction(player.id, 'boo')}
                      className="px-4 py-2 rounded-lg bg-destructive/20 text-destructive font-bold text-lg hover:bg-destructive/30 transition-colors"
                    >
                      👎
                    </motion.button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Impact info */}
        {crowdReaction.claps >= 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-coalition text-center mt-2 font-display"
          >
            +{Math.floor(crowdReaction.claps / 5)} שניות בונוס לטיימר! ⏱️
          </motion.p>
        )}
        {crowdReaction.boos > crowdReaction.claps && crowdReaction.boos > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-destructive text-center mt-2 font-display"
          >
            🔥 לחץ קהל! רעידת מסך!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default CrowdReaction;
