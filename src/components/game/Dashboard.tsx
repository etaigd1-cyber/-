import { motion } from 'framer-motion';
import { Trophy, BarChart3, Target, ArrowLeft, Radio } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { CATEGORIES, PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { players, setPhase } = useGameStore();

  const mvp = [...players].sort((a, b) => b.battlesWon - a.battlesWon)[0];
  const mandateLeader = [...players].sort((a, b) => b.mandates - a.mandates)[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 p-4 pb-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Radio size={10} />
            </motion.div>
            <span className="font-display font-black text-[10px] tracking-widest">LIVE</span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">לוח תוצאות</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPhase('district-select')}>
          <ArrowLeft size={16} /> חזרה
        </Button>
      </div>

      {/* MVP & Mandate Leader */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-4 text-center border-t-2 border-accent/50">
          <Trophy size={24} className="text-accent mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">MVP קרבות</p>
          <p className="font-display font-bold text-foreground">{mvp?.name || '—'}</p>
          <p className="text-sm text-accent">{mvp?.battlesWon || 0} ניצחונות</p>
        </div>
        <div className="glass-panel p-4 text-center border-t-2 border-primary/50">
          <Target size={24} className="text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">מוביל מנדטים</p>
          <p className="font-display font-bold text-foreground">{mandateLeader?.name || '—'}</p>
          <p className="text-sm text-primary">{mandateLeader?.mandates || 0} מנדטים</p>
        </div>
      </div>

      {/* Player Stats */}
      {[...players].sort((a, b) => b.mandates - a.mandates).map((player, i) => {
        const party = PARTIES.find(p => p.id === player.party);
        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{party?.emoji}</span>
                <div>
                  <p className="font-display font-bold text-foreground">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.mandates} מנדטים • {player.battlesWon}W / {player.battlesLost}L
                  </p>
                </div>
              </div>
              {/* Mandate progress bar toward 61 */}
              <div className="text-right">
                <span className="font-display font-bold text-accent text-lg">{player.mandates}</span>
                <span className="text-xs text-muted-foreground">/61</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div
                className="bg-accent rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, (player.mandates / 61) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const stats = player.categoryStats[cat.id];
                const total = stats.won + stats.lost;
                const pct = total > 0 ? Math.round((stats.won / total) * 100) : 0;
                return (
                  <div key={cat.id} className="text-center">
                    <span className="text-lg">{cat.emoji}</span>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary rounded-full h-1.5 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Dashboard;
