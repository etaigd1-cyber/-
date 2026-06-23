import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Gift, Lock, SkipForward, Users, Zap } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { PARTIES } from '@/types/game';
import { toast } from 'sonner';
import PowerActivatedOverlay from '@/components/game/PowerActivatedOverlay';
import { pushRoomState, pushPlayerState } from '@/lib/roomSync';
import { fetchCardData, type GameCard } from '@/lib/fetchGameData';

type KnownCardKey = 'jail' | 'skip_self' | 'skip_pick' | 'bonus_2' | 'bonus_3' | 'bonus_5' | 'global_mission';

const CARD_INFO: Record<KnownCardKey, { title: string; description: string; icon: React.ReactNode; color: string }> = {
  jail:           { title: '🔒 נשלחת לחקירה!', description: 'הוקפא לך 3 תורות. שב בשקט.', icon: <Lock size={32} />, color: 'bg-destructive/20 border-destructive/50' },
  skip_self:      { title: '⏭️ דילוג עצמי', description: 'התור שלך דולג אוטומטית.', icon: <SkipForward size={32} />, color: 'bg-muted border-muted-foreground/30' },
  skip_pick:      { title: '🎯 דלג על יריב', description: 'בחר שחקן אחר לדלג על התור שלו!', icon: <Users size={32} />, color: 'bg-accent/20 border-accent/50' },
  bonus_2:        { title: '🎁 בונוס +2', description: 'קיבלת 2 מנדטים בונוס!', icon: <Gift size={32} />, color: 'bg-coalition/20 border-coalition/50' },
  bonus_3:        { title: '🎁 בונוס +3', description: 'קיבלת 3 מנדטים בונוס!', icon: <Gift size={32} />, color: 'bg-coalition/20 border-coalition/50' },
  bonus_5:        { title: '💰 בונוס +5', description: 'קיבלת 5 מנדטים בונוס! מהלך ענק!', icon: <Zap size={32} />, color: 'bg-accent/20 border-accent/50' },
  global_mission: { title: '🌍 משימה גלובלית!', description: 'כל השחקנים מקבלים משימה – מי שמסיים ראשון מנצח!', icon: <AlertTriangle size={32} />, color: 'bg-primary/20 border-primary/50' },
};

const ScanCard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { players, currentPlayerIndex, addMandates, nextTurn, addNewsHeadline } = useGameStore();
  const [cardKey, setCardKey] = useState<string | null>(null);
  const [sheetCard, setSheetCard] = useState<GameCard | undefined>(undefined);
  const [executed, setExecuted] = useState(false);
  const [pickTarget, setPickTarget] = useState<string | null>(null);
  const [showPowerOverlay, setShowPowerOverlay] = useState<string | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  useEffect(() => {
    const card = searchParams.get('card');
    if (!card) return;

    const key = card.toLowerCase().trim();
    setCardKey(key);

    // Also try to match from sheet for extra metadata
    fetchCardData().then(cards => {
      const match = cards.find(c => c.cardKey === key);
      if (match) setSheetCard(match);
    });
  }, [searchParams]);

  const syncAllPlayers = () => {
    const state = useGameStore.getState();
    state.players.forEach(p => void pushPlayerState(p));
    void pushRoomState();
  };

  const executeCard = () => {
    if (!cardKey || !currentPlayer || executed) return;

    let headline = '';
    let headlineType: 'breaking' | 'alert' | 'update' = 'update';
    let toastMsg = '';

    switch (cardKey) {
      case 'jail':
        useGameStore.setState((s) => ({
          players: s.players.map(p => p.id === currentPlayer.id ? { ...p, freezeTurns: 3 } : p),
        }));
        headline = `🚔 חקירה פלילית! ${currentPlayer.name} נעצר/ה! 3 תורות הקפאה!`;
        headlineType = 'breaking';
        toastMsg = 'פקודה בוצעה: לך לכלא 🔒';
        syncAllPlayers();
        break;

      case 'skip_self':
        headline = `😴 פחדנות! ${currentPlayer.name} ברח/ה מהמשימה!`;
        headlineType = 'update';
        toastMsg = 'פקודה בוצעה: דילוג עצמי ⏭️';
        nextTurn();
        break;

      case 'skip_pick':
      case 'pick_skip':
        if (!pickTarget) return;
        const target = players.find(p => p.id === pickTarget);
        useGameStore.setState((s) => ({
          players: s.players.map(p => p.id === pickTarget ? { ...p, freezeTurns: 1 } : p),
        }));
        headline = `🎯 התנקשות פוליטית! ${currentPlayer.name} חיסל/ה את התור של ${target?.name}!`;
        headlineType = 'alert';
        toastMsg = 'פקודה בוצעה: דילוג על יריב 🎯';
        syncAllPlayers();
        break;

      case 'bonus_2':
        addMandates(currentPlayer.id, 2);
        headline = `🎁 שוחד! ${currentPlayer.name} קיבל/ה 2 מנדטים!`;
        toastMsg = 'פקודה בוצעה: בונוס +2 מנדטים 🎁';
        break;

      case 'bonus_3':
        addMandates(currentPlayer.id, 3);
        headline = `💼 עסקה פוליטית! ${currentPlayer.name} סגר/ה דיל ל-3 מנדטים!`;
        headlineType = 'alert';
        toastMsg = 'פקודה בוצעה: בונוס +3 מנדטים 🎁';
        break;

      case 'bonus_5':
        addMandates(currentPlayer.id, 5);
        headline = `💰 מהפכה! ${currentPlayer.name} הוביל/ה קמפיין ענק! +5 מנדטים!`;
        headlineType = 'breaking';
        toastMsg = 'פקודה בוצעה: בונוס +5 מנדטים 💰';
        break;

      case 'global_mission':
        headline = `🌍 אזעקה! משימה גלובלית הופעלה!`;
        headlineType = 'breaking';
        toastMsg = 'פקודה בוצעה: משימה גלובלית 🌍';
        useGameStore.setState({ phase: 'battle' });
        break;

      default:
        headline = `⚡ ${currentPlayer.name} הפעיל/ה: ${sheetCard?.action || cardKey}`;
        headlineType = 'alert';
        toastMsg = `פקודה בוצעה: ${sheetCard?.action || cardKey} ⚡`;
        break;
    }

    addNewsHeadline(headline, headlineType);
    setShowPowerOverlay(cardKey);
    toast.success(toastMsg);
    setExecuted(true);
    void pushRoomState();
  };

  if (!cardKey) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-destructive mb-4" />
        <h1 className="text-xl font-display font-bold text-foreground mb-2">כרטיס לא תקין</h1>
        <p className="text-muted-foreground mb-6">הקוד שנסרק לא זוהה. נסה שוב.</p>
        <Button onClick={() => navigate('/game')} className="font-display">חזרה למשחק</Button>
      </div>
    );
  }

  const known = CARD_INFO[cardKey as KnownCardKey];
  const info = known ?? {
    title: `⚡ ${sheetCard?.action || cardKey}`,
    description: sheetCard?.description || 'פקודת כרטיס',
    icon: <Zap size={32} />,
    color: 'bg-primary/20 border-primary/50',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className={`w-full max-w-sm rounded-2xl border-2 p-8 text-center ${info.color}`}
      >
        <div className="text-accent mb-4 flex justify-center">{info.icon}</div>
        <h1 className="text-2xl font-display font-black text-foreground mb-2">{info.title}</h1>
        <p className="text-muted-foreground font-display mb-1">{info.description}</p>
        {currentPlayer && (
          <p className="text-sm text-foreground font-display mb-6">
            שחקן: <span className="font-bold">{currentPlayer.name}</span>
          </p>
        )}

        {(cardKey === 'skip_pick' || cardKey === 'pick_skip') && !executed && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-display font-bold text-foreground">בחר שחקן לדילוג:</p>
            {players
              .filter(p => p.id !== currentPlayer?.id)
              .map(p => {
                const party = PARTIES.find(pt => pt.id === p.party);
                return (
                  <button
                    key={p.id}
                    onClick={() => setPickTarget(p.id)}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                      pickTarget === p.id
                        ? 'border-accent bg-accent/20'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <span>{party?.emoji}</span>
                    <span className="font-display font-bold text-foreground text-sm">{p.name}</span>
                  </button>
                );
              })}
          </div>
        )}

        {!executed ? (
          <Button
            onClick={executeCard}
            size="lg"
            disabled={(cardKey === 'skip_pick' || cardKey === 'pick_skip') && !pickTarget}
            className="w-full font-display text-lg bg-primary text-primary-foreground"
          >
            הפעל כרטיס ⚡
          </Button>
        ) : (
          <div className="space-y-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">✅</motion.div>
            <p className="text-coalition font-display font-bold">בוצע!</p>
            <Button onClick={() => navigate('/game')} className="w-full font-display">חזרה למשחק 🏛️</Button>
          </div>
        )}
      </motion.div>

      <PowerActivatedOverlay
        cardType={showPowerOverlay}
        cardLabel={sheetCard?.action}
        onComplete={() => setShowPowerOverlay(null)}
      />
    </div>
  );
};

export default ScanCard;
