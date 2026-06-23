import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { fetchGameData } from '@/lib/fetchGameData';
import { PARTIES } from '@/types/game';
import { AVATAR_MAP } from '@/lib/avatarMap';
import NewsTicker from '@/components/game/NewsTicker';
import DistrictSelect from '@/components/game/DistrictSelect';
import BattleInviteOverlay from '@/components/game/BattleInviteOverlay';
import CategorySelect from '@/components/game/CategorySelect';
import SuddenDeathBattle from '@/components/game/SuddenDeathBattle';
import BattleArena from '@/components/game/BattleArena';
import VotingPanel from '@/components/game/VotingPanel';
import ResultsPanel from '@/components/game/ResultsPanel';
import WowEvent from '@/components/game/WowEvent';
import Dashboard from '@/components/game/Dashboard';
import GlobalMission from '@/components/game/GlobalMission';
import VictoryScreen from '@/components/game/VictoryScreen';
import QrScannerModal from '@/components/game/QrScannerModal';
import ArroganceMeter from '@/components/game/ArroganceMeter';
import SkipTurnPanel from '@/components/game/SkipTurnPanel';

const GameRoom = () => {
  const navigate = useNavigate();
  const { phase, setChallenges, challenges, players, currentPlayerIndex, setPhase, selectedCategory } = useGameStore();

  useEffect(() => {
    if (challenges.length === 0) {
      fetchGameData()
        .then(setChallenges)
        .catch((err) => console.error('[GameRoom] fetchGameData failed:', err));
    }
  }, [challenges.length, setChallenges]);

  useEffect(() => {
    if (players.length === 0) {
      navigate('/');
    }
  }, [players, navigate]);

  const currentPlayer = players[currentPlayerIndex];
  const currentParty = PARTIES.find(p => p.id === currentPlayer?.party);

  const renderPhase = () => {
    switch (phase) {
      case 'district-select': return <DistrictSelect />;
      case 'betting': return <ArroganceMeter />;
      case 'challenge-join': return <BattleInviteOverlay />;
      case 'qr-select': return <CategorySelect />;
      case 'battle':
        if (selectedCategory === 'knowledge') return <SuddenDeathBattle />;
        return <BattleArena />;
      case 'voting': return <VotingPanel />;
      case 'results': return <ResultsPanel />;
      case 'wow-event': return <WowEvent />;
      case 'dashboard': return <Dashboard />;
      case 'national-crisis': return <GlobalMission />;
      case 'victory': return <VictoryScreen />;
      default: return <DistrictSelect />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[120px]">
      {phase !== 'victory' && (
        <div className="flex items-center justify-between px-4 py-2 bg-card/90 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-2">
            <img src={AVATAR_MAP[currentPlayer?.party || 'blue']} alt={currentParty?.name} className="w-8 h-8 rounded-full object-cover border border-border" />
            <div>
              <span className="font-display font-bold text-foreground text-sm">{currentPlayer?.name}</span>
              <span className="text-[10px] text-muted-foreground block">מתמודד/ת</span>
            </div>
            <span className="mandate-badge bg-accent/15 text-accent text-xs ml-2">
              {currentPlayer?.mandates || 0} מנדטים
            </span>
          </div>
          <button onClick={() => setPhase('dashboard')} className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
            <BarChart3 size={18} className="text-foreground" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-4">
        <AnimatePresence mode="wait">
          {renderPhase()}
        </AnimatePresence>
      </div>

      {phase !== 'victory' && <QrScannerModal />}
      {phase === 'district-select' && <SkipTurnPanel />}
      <NewsTicker />
    </div>
  );
};

export default GameRoom;
