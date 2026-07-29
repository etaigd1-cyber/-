import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldAlert } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import {
  DISTRICTS, PARTIES, CATEGORIES, INTERESTS,
  type DistrictId, type ChallengeCategory, type GamePhase, type WowEvent,
} from '@/types/game';
import { handleCardEffect, CARD_VISUALS, KNOWN_CARD_KEYS, type KnownCardKey } from '@/components/game/QrScannerModal';
import DistrictIcon from '@/components/game/DistrictIcon';

const ADMIN_PASSWORD = '1311';
const STORAGE_KEY = 'admin-unlocked';

const PHASES: GamePhase[] = [
  'landing', 'lobby', 'district-select', 'betting', 'challenge-join', 'qr-select',
  'battle', 'voting', 'results', 'wow-event', 'dashboard', 'national-crisis', 'victory',
];

const WOW_EVENTS: WowEvent[] = ['screen-lock-debate', 'election-flash', 'forced-team'];

const TESTABLE_CATEGORIES: ChallengeCategory[] = ['knowledge', 'mission', 'quote', 'map', 'music', 'photo'];

type ViewState = 'hidden' | 'password' | 'panel';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { players, phase, currentBet, selectedDistrict, currentPlayerIndex, getAvailableMandates } = useGameStore();

  const [view, setView] = useState<ViewState>(
    typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1' ? 'panel' : 'hidden'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [mandateAmount, setMandateAmount] = useState(5);
  const [districtId, setDistrictId] = useState<DistrictId>('tel-aviv');
  const [districtAmount, setDistrictAmount] = useState(5);
  const [codeValue, setCodeValue] = useState(5);
  const [skipPickTarget, setSkipPickTarget] = useState('');

  const effectiveTargetId = targetPlayerId || players[0]?.id || '';
  const targetPlayer = players.find(p => p.id === effectiveTargetId);

  if (view === 'hidden') {
    return (
      <button
        onClick={() => setView('password')}
        className="fixed bottom-2 left-2 z-[60] w-10 h-10 flex items-center justify-center"
      >
        <span className="block w-2 h-2 rounded-full bg-white/10 hover:bg-white/30 transition-colors" />
      </button>
    );
  }

  const handleUnlock = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, '1');
      setPasswordError(false);
      setPasswordInput('');
      setView('panel');
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleLock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setView('hidden');
  };

  const goToGame = () => {
    if (location.pathname !== '/game') navigate('/game');
  };

  const ensureBet = () => {
    if (currentBet <= 0) useGameStore.setState({ currentBet: 5 });
  };

  const ensureDistrict = () => {
    if (!selectedDistrict) useGameStore.setState({ selectedDistrict: districtId });
  };

  const setActivePlayerIndex = () => {
    const idx = players.findIndex(p => p.id === effectiveTargetId);
    if (idx >= 0) useGameStore.setState({ currentPlayerIndex: idx, activePlayerId: effectiveTargetId });
  };

  const handleTestCategory = (cat: ChallengeCategory) => {
    if (!targetPlayer) return;
    ensureBet();
    ensureDistrict();
    setActivePlayerIndex();
    goToGame();
    setTimeout(() => useGameStore.getState().selectCategory(cat), 0);
  };

  const handleCard = (cardKey: KnownCardKey) => {
    if (!targetPlayer) return;
    if (cardKey === 'skip_pick' && !skipPickTarget) return;
    const result = handleCardEffect(cardKey, targetPlayer, skipPickTarget || null);
    if (result) useGameStore.getState().addNewsHeadline(result.headline, result.headlineType);
  };

  const handleApplyCode = () => {
    if (!targetPlayer) return;
    if (codeValue === 99) {
      useGameStore.getState().triggerNationalCrisis();
    } else {
      useGameStore.getState().addCodeToBank(targetPlayer.id, Math.min(10, Math.max(1, codeValue)));
    }
  };

  const handleAddTestPlayer = () => {
    const n = players.length + 1;
    const partyId = PARTIES[n % PARTIES.length].id;
    useGameStore.getState().addPlayer(`בדיקה ${n}`, 25, [INTERESTS[0].id], partyId);
  };

  return (
    <AnimatePresence>
      {view === 'password' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setView('hidden')}
        >
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-card border border-border rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-foreground">
              <Lock size={16} />
              <h3 className="font-display font-bold text-sm">גישת אדמין</h3>
            </div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="סיסמה"
              autoFocus
              className={`w-full bg-muted border rounded-lg px-3 py-2 text-sm text-foreground text-center tracking-widest focus:outline-none ${passwordError ? 'border-destructive' : 'border-border'}`}
            />
            {passwordError && <p className="text-destructive text-xs text-center">סיסמה שגויה</p>}
            <Button onClick={handleUnlock} className="w-full font-display" size="sm">כניסה</Button>
          </motion.div>
        </motion.div>
      )}

      {view === 'panel' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm overflow-y-auto"
        >
          <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <div className="flex items-center gap-2 text-accent">
                <ShieldAlert size={18} />
                <h2 className="font-display font-black">מצב אדמין</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleLock} className="text-xs text-muted-foreground hover:text-foreground font-display flex items-center gap-1">
                  <Lock size={12} /> נעל
                </button>
                <button onClick={() => setView('hidden')} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Target player picker */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">שחקן יעד</p>
              <div className="flex flex-wrap gap-2">
                {players.length === 0 && <p className="text-xs text-muted-foreground">אין שחקנים עדיין</p>}
                {players.map((p) => {
                  const party = PARTIES.find(pt => pt.id === p.party);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setTargetPlayerId(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-display flex items-center gap-1 ${
                        effectiveTargetId === p.id ? 'border-accent bg-accent/15 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {party?.emoji} {p.name} ({p.mandates})
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Mandates */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">מנדטים</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={mandateAmount}
                  onChange={(e) => setMandateAmount(parseInt(e.target.value) || 0)}
                  className="w-20 bg-muted border border-border rounded-lg px-2 py-1.5 text-sm text-foreground"
                />
                <Button size="sm" disabled={!targetPlayer} onClick={() => targetPlayer && useGameStore.getState().addMandates(targetPlayer.id, mandateAmount)}>
                  הוסף
                </Button>
                <Button size="sm" variant="outline" disabled={!targetPlayer} onClick={() => targetPlayer && useGameStore.getState().addMandates(targetPlayer.id, -mandateAmount)}>
                  הפחת
                </Button>
                <Button size="sm" variant="secondary" disabled={!targetPlayer} onClick={() => targetPlayer && useGameStore.getState().addMandates(targetPlayer.id, 61)}>
                  🏆 נצח מיידית
                </Button>
              </div>
            </section>

            {/* District conquest */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">כיבוש מחוז</p>
              <div className="flex flex-wrap gap-1.5">
                {DISTRICTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDistrictId(d.id)}
                    className={`px-2 py-1 rounded-md border text-[11px] font-display ${
                      districtId === d.id ? 'border-accent bg-accent/15' : 'border-border bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <DistrictIcon district={d} className="h-7 w-11" /> {d.name}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">זמינות נוכחית: {getAvailableMandates(districtId)} / {DISTRICTS.find(d => d.id === districtId)?.maxMandates}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={districtAmount}
                  onChange={(e) => setDistrictAmount(parseInt(e.target.value) || 0)}
                  className="w-20 bg-muted border border-border rounded-lg px-2 py-1.5 text-sm text-foreground"
                />
                <Button size="sm" disabled={!targetPlayer} onClick={() => targetPlayer && useGameStore.getState().adminConquerDistrict(targetPlayer.id, districtId, districtAmount)}>
                  כבוש
                </Button>
                <Button size="sm" variant="outline" disabled={!targetPlayer} onClick={() => targetPlayer && useGameStore.getState().adminConquerDistrict(targetPlayer.id, districtId, -districtAmount)}>
                  שחרר
                </Button>
              </div>
            </section>

            {/* Category / question testing */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">בדיקת שאלות וקטגוריות</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter(c => TESTABLE_CATEGORIES.includes(c.id)).map((c) => (
                  <Button key={c.id} size="sm" variant="outline" disabled={!targetPlayer} onClick={() => handleTestCategory(c.id)} className="text-xs">
                    {c.emoji} {c.name}
                  </Button>
                ))}
              </div>
            </section>

            {/* Card / QR simulation */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">סימולציית כרטיס/סריקה</p>
              {players.filter(p => p.id !== effectiveTargetId).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted-foreground self-center">מטרה לדילוג:</span>
                  {players.filter(p => p.id !== effectiveTargetId).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSkipPickTarget(p.id)}
                      className={`px-2 py-1 rounded-md border text-[10px] font-display ${skipPickTarget === p.id ? 'border-accent bg-accent/15' : 'border-border bg-muted/30 text-muted-foreground'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {KNOWN_CARD_KEYS.map((key) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="outline"
                    disabled={!targetPlayer || (key === 'skip_pick' && !skipPickTarget)}
                    onClick={() => handleCard(key)}
                    className="text-[11px]"
                  >
                    {CARD_VISUALS[key].title}
                  </Button>
                ))}
              </div>
            </section>

            {/* Numeric code */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">קוד מספרי (1-99, 99=משבר לאומי)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={codeValue}
                  onChange={(e) => setCodeValue(parseInt(e.target.value) || 0)}
                  className="w-20 bg-muted border border-border rounded-lg px-2 py-1.5 text-sm text-foreground"
                />
                <Button size="sm" disabled={!targetPlayer} onClick={handleApplyCode}>החל קוד</Button>
              </div>
            </section>

            {/* WOW events */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">אירוע WOW</p>
              <div className="flex flex-wrap gap-1.5">
                {WOW_EVENTS.map((ev) => (
                  <Button key={ev} size="sm" variant="outline" onClick={() => { goToGame(); useGameStore.setState({ wowEvent: ev, phase: 'wow-event' }); }} className="text-xs">
                    {ev}
                  </Button>
                ))}
              </div>
            </section>

            {/* Phase navigator */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">ניווט מסכים</p>
              <div className="flex flex-wrap gap-1.5">
                {PHASES.map((p) => (
                  <button
                    key={p}
                    onClick={() => { goToGame(); useGameStore.getState().setPhase(p); }}
                    className={`px-2 py-1 rounded-md border text-[11px] font-display ${phase === p ? 'border-accent bg-accent/15' : 'border-border bg-muted/30 text-muted-foreground'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            {/* Quick actions */}
            <section className="glass-panel p-3 space-y-2">
              <p className="text-xs font-display font-bold text-muted-foreground">פעולות מהירות</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleAddTestPlayer}>➕ הוסף שחקן בדיקה</Button>
              </div>
            </section>

            {/* State inspector */}
            <section className="glass-panel p-3 space-y-1">
              <p className="text-xs font-display font-bold text-muted-foreground">מצב נוכחי</p>
              <pre className="text-[10px] text-muted-foreground overflow-x-auto" dir="ltr">
{JSON.stringify({
  phase, currentPlayerIndex, selectedDistrict, currentBet,
  players: players.map(p => ({ name: p.name, mandates: p.mandates })),
}, null, 1)}
              </pre>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPanel;
