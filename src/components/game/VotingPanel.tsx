import { motion } from 'framer-motion';
import { Radio, BarChart3 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { DISTRICTS, PARTIES } from '@/types/game';
const VotingPanel = () => {
  const {
    players, currentPlayerIndex, battleParticipants, votes, castVote, resolveRound,
    addNewsHeadline, nextTurn,
  } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const participants = [currentPlayer, ...players.filter(p => battleParticipants.includes(p.id))];
  const voters = players.filter((_, i) => i !== currentPlayerIndex && !battleParticipants.includes(players[i]?.id));

  const allVoted = voters.length > 0 ? voters.every(v => votes[v.id] !== undefined) : false;
  const totalVotes = Object.keys(votes).length;
  const successVotes = Object.values(votes).filter(Boolean).length;
  const failVotes = totalVotes - successVotes;
  const successPct = totalVotes > 0 ? Math.round((successVotes / totalVotes) * 100) : 0;
  const failPct = totalVotes > 0 ? 100 - successPct : 0;

  const handleResolve = () => {
    const succeeded = successVotes > Object.values(votes).length / 2;
    if (succeeded) {
      resolveRound(currentPlayer.id);
      return;
    }
    // Initiator never penalized — turn just ends
    const currentParty = PARTIES.find(p => p.id === currentPlayer?.party);
    addNewsHeadline(`📉 המשימה של ${currentParty?.name} נכשלה — התור עובר`, 'update');
    nextTurn();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-4"
    >
      {/* Live Poll Banner */}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-t-lg">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            <Radio size={14} />
          </motion.div>
          <span className="font-display font-black text-sm tracking-wider">סקר שולחן — תוצאות חיות</span>
        </div>

        {/* Poll Results Bar */}
        <div className="glass-panel rounded-t-none p-4">
          <p className="text-sm text-muted-foreground text-center mb-3">
            האם {currentPlayer?.name} הצליח/ה באתגר?
          </p>

          {/* Results visualization */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-display font-bold mb-1">
              <span className="text-coalition">✅ הצלחה {successPct}%</span>
              <span className="text-destructive">❌ נכשל {failPct}%</span>
            </div>
            <div className="w-full h-6 bg-muted rounded-full overflow-hidden flex">
              <motion.div
                className="h-full bg-coalition/80 flex items-center justify-center"
                initial={{ width: 0 }}
                animate={{ width: `${totalVotes > 0 ? successPct : 50}%` }}
                transition={{ duration: 0.5 }}
              >
                {totalVotes > 0 && successPct > 15 && (
                  <span className="text-[10px] font-bold text-coalition-foreground">{successVotes}</span>
                )}
              </motion.div>
              <motion.div
                className="h-full bg-destructive/80 flex items-center justify-center"
                initial={{ width: 0 }}
                animate={{ width: `${totalVotes > 0 ? failPct : 50}%` }}
                transition={{ duration: 0.5 }}
              >
                {totalVotes > 0 && failPct > 15 && (
                  <span className="text-[10px] font-bold text-destructive-foreground">{failVotes}</span>
                )}
              </motion.div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1">
              {totalVotes} מתוך {voters.length} הצביעו
            </p>
          </div>

          {/* Individual voter cards */}
          <div className="grid gap-2">
            {voters.map((voter) => {
              const voted = votes[voter.id] !== undefined;
              return (
                <div key={voter.id} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${voted ? (votes[voter.id] ? 'bg-coalition' : 'bg-destructive') : 'bg-muted-foreground/40'}`} />
                    <span className="font-display font-bold text-foreground text-sm">{voter.name}</span>
                  </div>
                  {voted ? (
                    <span className={`text-xs font-bold ${votes[voter.id] ? 'text-coalition' : 'text-destructive'}`}>
                      {votes[voter.id] ? '✅ הצלחה' : '❌ נכשל'}
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => castVote(voter.id, true)}
                        className="bg-coalition/20 hover:bg-coalition/40 text-coalition border border-coalition/30 h-8 px-3"
                      >
                        הצלחה
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => castVote(voter.id, false)}
                        className="bg-destructive/20 hover:bg-destructive/40 text-destructive border border-destructive/30 h-8 px-3"
                      >
                        נכשל
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(allVoted || voters.length === 0) && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Button
            onClick={handleResolve}
            size="lg"
            className="bg-accent text-accent-foreground font-display text-lg px-8"
          >
            <BarChart3 size={20} className="ml-2" />
            חשוף תוצאות סופיות
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VotingPanel;
