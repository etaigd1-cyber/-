import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, AlertTriangle, Gift, Lock, SkipForward, Users, Zap, Loader2 } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useGameStore } from '@/store/gameStore';
import { PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PowerActivatedOverlay from '@/components/game/PowerActivatedOverlay';
import { pushRoomState, pushPlayerState } from '@/lib/roomSync';
import { fetchCardData, type GameCard } from '@/lib/fetchGameData';

/** Known card keys and their visual metadata */
type KnownCardKey = 'jail' | 'skip_self' | 'skip_pick' | 'bonus_2' | 'bonus_3' | 'bonus_5' | 'global_mission';

const CARD_VISUALS: Record<KnownCardKey, { title: string; description: string; icon: React.ReactNode; color: string }> = {
  jail:           { title: '🔒 נשלחת לחקירה!', description: 'הוקפא לך 3 תורות. שב בשקט.', icon: <Lock size={28} />, color: 'border-destructive/40 bg-destructive/10' },
  skip_self:      { title: '⏭️ דילוג עצמי', description: 'התור שלך דולג אוטומטית.', icon: <SkipForward size={28} />, color: 'border-muted-foreground/30 bg-muted/50' },
  skip_pick:      { title: '🎯 דלג על יריב', description: 'בחר שחקן אחר לדלג על התור שלו!', icon: <Users size={28} />, color: 'border-accent/40 bg-accent/10' },
  bonus_2:        { title: '🎁 בונוס +2', description: 'קיבלת 2 מנדטים בונוס!', icon: <Gift size={28} />, color: 'border-coalition/40 bg-coalition/10' },
  bonus_3:        { title: '🎁 בונוס +3', description: 'קיבלת 3 מנדטים בונוס!', icon: <Gift size={28} />, color: 'border-coalition/40 bg-coalition/10' },
  bonus_5:        { title: '💰 בונוס +5', description: 'קיבלת 5 מנדטים בונוס! מהלך ענק!', icon: <Zap size={28} />, color: 'border-accent/40 bg-accent/10' },
  global_mission: { title: '🌍 משימה גלובלית!', description: 'כל השחקנים מקבלים משימה – מי שמסיים ראשון מנצח!', icon: <AlertTriangle size={28} />, color: 'border-primary/40 bg-primary/10' },
};

const CARD_ALIASES: Record<string, string> = {
  jail: 'jail', skip_self: 'skip_self', skipself: 'skip_self',
  skip_pick: 'skip_pick', pick_skip: 'skip_pick', skip_pick_player: 'skip_pick',
  bonus_2: 'bonus_2', bonus2: 'bonus_2', bonus_3: 'bonus_3', bonus3: 'bonus_3',
  bonus_5: 'bonus_5', bonus5: 'bonus_5',
  global_mission: 'global_mission', globalmission: 'global_mission',
};

function normalizeCardKey(value: string): string | null {
  const token = value.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
  return CARD_ALIASES[token] ?? (token || null);
}

function extractCardKeyFromUrl(raw: string): string | null {
  const cleaned = raw.trim();

  // Direct token
  const direct = normalizeCardKey(cleaned);
  if (direct && CARD_VISUALS[direct as KnownCardKey]) return direct;

  // URL ?card= param
  try {
    const url = new URL(cleaned.startsWith('www.') ? `https://${cleaned}` : cleaned);
    const cardParam = url.searchParams.get('card');
    if (cardParam) {
      const match = normalizeCardKey(cardParam);
      if (match) return match;
    }
  } catch { /* not a URL */ }

  // Regex fallback
  const cardMatch = cleaned.match(/[?&#]card=([^&#\s]+)/i);
  if (cardMatch) {
    const match = normalizeCardKey(decodeURIComponent(cardMatch[1]));
    if (match) return match;
  }

  // Keyword search
  const keywordMatch = cleaned.match(/(jail|skip_self|skip_pick|pick_skip|bonus_2|bonus_3|bonus_5|global_mission)/i);
  if (keywordMatch) {
    const match = normalizeCardKey(keywordMatch[1]);
    if (match) return match;
  }

  return null;
}

/** Get visual info for a card, falling back to sheet data for unknown cards */
function getCardVisuals(cardKey: string, sheetCard?: GameCard) {
  const known = CARD_VISUALS[cardKey as KnownCardKey];
  if (known) return known;
  return {
    title: `⚡ ${sheetCard?.action || cardKey}`,
    description: sheetCard?.description || 'פקודת כרטיס',
    icon: <Zap size={28} />,
    color: 'border-primary/40 bg-primary/10',
  };
}

/** Execute a card effect — returns a satirical headline for the breaking news */
function handleCardEffect(
  cardKey: string,
  currentPlayer: ReturnType<typeof useGameStore.getState>['players'][number],
  pickTarget: string | null,
  sheetCard?: GameCard,
): { headline: string; headlineType: 'breaking' | 'alert' | 'update'; toastMsg: string } | null {
  const store = useGameStore.getState();
  const { players, addMandates, nextTurn, addNewsHeadline } = store;

  const syncAllPlayers = () => {
    store.players.forEach(p => void pushPlayerState(p));
    void pushRoomState();
  };

  switch (cardKey) {
    case 'jail':
      useGameStore.setState((s) => ({
        players: s.players.map(p => p.id === currentPlayer.id ? { ...p, freezeTurns: 3 } : p),
      }));
      syncAllPlayers();
      return {
        headline: `🚔 חקירה פלילית! ${currentPlayer.name} נעצר/ה ע"י המשטרה! 3 תורות הקפאה!`,
        headlineType: 'breaking',
        toastMsg: 'פקודה בוצעה: לך לכלא 🔒',
      };

    case 'skip_self':
      nextTurn();
      return {
        headline: `😴 פחדנות! ${currentPlayer.name} ברח/ה מהמשימה אבל גבה/תה מסים בדרך`,
        headlineType: 'update',
        toastMsg: 'פקודה בוצעה: דילוג עצמי ⏭️',
      };

    case 'skip_pick':
    case 'pick_skip': {
      if (!pickTarget) return null;
      const target = players.find(p => p.id === pickTarget);
      useGameStore.setState((s) => ({
        players: s.players.map(p => p.id === pickTarget ? { ...p, freezeTurns: 1 } : p),
      }));
      syncAllPlayers();
      return {
        headline: `🎯 התנקשות פוליטית! ${currentPlayer.name} חיסל/ה את התור של ${target?.name}!`,
        headlineType: 'alert',
        toastMsg: 'פקודה בוצעה: דילוג על יריב 🎯',
      };
    }

    case 'bonus_2':
      addMandates(currentPlayer.id, 2);
      return {
        headline: `🎁 שוחד מוצלח! ${currentPlayer.name} קיבל/ה 2 מנדטים תחת השולחן!`,
        headlineType: 'update',
        toastMsg: 'פקודה בוצעה: בונוס +2 מנדטים 🎁',
      };

    case 'bonus_3':
      addMandates(currentPlayer.id, 3);
      return {
        headline: `💼 עסקה פוליטית! ${currentPlayer.name} סגר/ה דיל ל-3 מנדטים!`,
        headlineType: 'alert',
        toastMsg: 'פקודה בוצעה: בונוס +3 מנדטים 🎁',
      };

    case 'bonus_5':
      addMandates(currentPlayer.id, 5);
      return {
        headline: `💰 מהפכה! ${currentPlayer.name} הוביל/ה קמפיין שטח ענק! +5 מנדטים!`,
        headlineType: 'breaking',
        toastMsg: 'פקודה בוצעה: בונוס +5 מנדטים 💰',
      };

    case 'global_mission':
      useGameStore.setState({ phase: 'national-crisis' });
      return {
        headline: `🌍 אזעקה כללית! משימה גלובלית הופעלה! כל חברי הכנסת למשימה!`,
        headlineType: 'breaking',
        toastMsg: 'פקודה בוצעה: משימה גלובלית 🌍',
      };

    default:
      // Unknown card from sheet — log and show generic feedback
      console.warn('[QR] Unknown card key:', cardKey, sheetCard);
      return {
        headline: `⚡ כרטיס מיוחד! ${currentPlayer.name} הפעיל/ה: ${sheetCard?.action || cardKey}`,
        headlineType: 'alert',
        toastMsg: `פקודה בוצעה: ${sheetCard?.action || cardKey} ⚡`,
      };
  }
}

// Resolve redirect URLs
async function resolveRedirectUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (response.url !== url) return response.url;
  } catch {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.url !== url) return response.url;
      const text = await response.text();
      const metaMatch = text.match(/url=["']?([^"'\s>]+)/i);
      if (metaMatch) return metaMatch[1];
    } catch { /* failed */ }
  }
  return null;
}

const QrScannerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [matchedCardKey, setMatchedCardKey] = useState<string | null>(null);
  const [matchedSheetCard, setMatchedSheetCard] = useState<GameCard | undefined>(undefined);
  const [executed, setExecuted] = useState(false);
  const [pickTarget, setPickTarget] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [showPowerOverlay, setShowPowerOverlay] = useState<string | null>(null);
  const [sheetCards, setSheetCards] = useState<GameCard[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processedRef = useRef(false);
  const readerDivId = 'qr-reader-region';

  const { players, currentPlayerIndex, addNewsHeadline } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  // Fetch card definitions from Google Sheet on mount
  useEffect(() => {
    fetchCardData().then(cards => {
      setSheetCards(cards);
      console.log('[QR] Loaded', cards.length, 'card definitions from sheet');
    });
  }, []);

  /** Match scanned value against sheet cards, then fall back to URL parsing */
  const matchCard = useCallback((value: string): { key: string; card?: GameCard } | null => {
    // 1. Try to extract card key from scanned value
    const extractedKey = extractCardKeyFromUrl(value);

    // 2. Match against sheet cards
    if (sheetCards.length > 0) {
      const sheetMatch = sheetCards.find(c => {
        if (extractedKey && c.cardKey === extractedKey) return true;
        // Also try matching the full URL
        if (value.includes(c.url)) return true;
        return false;
      });
      if (sheetMatch) return { key: sheetMatch.cardKey, card: sheetMatch };
    }

    // 3. Fall back to extracted key (for hardcoded cards not needing sheet)
    if (extractedKey) return { key: extractedKey };

    return null;
  }, [sheetCards]);

  const handleScannedValue = useCallback(async (decodedText: string) => {
    if (processedRef.current) return;
    setLastScanned(decodedText);

    const match = matchCard(decodedText);
    if (match) {
      processedRef.current = true;
      setMatchedCardKey(match.key);
      setMatchedSheetCard(match.card);
      stopScanner();
      return;
    }

    // If URL but no match, try resolving redirects
    if (decodedText.startsWith('http')) {
      processedRef.current = true;
      setResolving(true);
      setScanError('מעקב אחרי הפניה...');
      stopScanner();

      const resolvedUrl = await resolveRedirectUrl(decodedText);
      setResolving(false);

      if (resolvedUrl) {
        const resolvedMatch = matchCard(resolvedUrl);
        if (resolvedMatch) {
          setMatchedCardKey(resolvedMatch.key);
          setMatchedSheetCard(resolvedMatch.card);
          return;
        }
      }

      processedRef.current = false;
      setScanError('הקישור לא מכיל פקודת כרטיס. נסה להזין ידנית.');
    } else {
      setScanError('קוד לא מזוהה');
    }
  }, [matchCard]);

  const startScanner = async () => {
    setScanError(null);
    setLastScanned(null);
    processedRef.current = false;
    setScanning(true);

    await new Promise(r => setTimeout(r, 300));

    try {
      const scanner = new Html5Qrcode(readerDivId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
            return { width: Math.floor(size), height: Math.floor(size) };
          },
          aspectRatio: 1,
        },
        (decodedText) => handleScannedValue(decodedText),
        () => {}
      );
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || '';
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setScanError('נא לאשר גישה למצלמה בהגדרות הדפדפן');
      } else if (msg.includes('NotFoundError')) {
        setScanError('לא נמצאה מצלמה במכשיר');
      } else {
        setScanError('לא ניתן לפתוח מצלמה. נסה להזין קוד ידנית.');
      }
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* safe to ignore */ }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const executeCard = () => {
    if (!matchedCardKey || !currentPlayer || executed) return;

    const result = handleCardEffect(matchedCardKey, currentPlayer, pickTarget, matchedSheetCard);
    if (!result) return; // e.g. skip_pick without target

    // Broadcast breaking news to all players
    addNewsHeadline(result.headline, result.headlineType);

    setShowPowerOverlay(matchedCardKey);
    toast.success(result.toastMsg);
    setExecuted(true);
    void pushRoomState();
  };

  const handleClose = () => {
    stopScanner();
    setIsOpen(false);
    setMatchedCardKey(null);
    setMatchedSheetCard(undefined);
    setExecuted(false);
    setPickTarget(null);
    setScanError(null);
    setResolving(false);
    setLastScanned(null);
    setShowPowerOverlay(null);
    processedRef.current = false;
  };

  const [manualInput, setManualInput] = useState('');
  const handleManualSubmit = () => {
    const match = matchCard(manualInput);
    if (match) {
      setMatchedCardKey(match.key);
      setMatchedSheetCard(match.card);
      setScanError(null);
    } else {
      setScanError('קוד לא תקין. נסה: jail, bonus_2, skip_self...');
    }
  };

  const visuals = matchedCardKey ? getCardVisuals(matchedCardKey, matchedSheetCard) : null;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[76px] left-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
      >
        <Camera size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground">📷 סרוק כרטיס</h3>
                <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              {!matchedCardKey ? (
                <div className="space-y-3">
                  <div id={readerDivId} className="w-full rounded-lg overflow-hidden bg-muted min-h-[200px]" />

                  {!scanning && !resolving && (
                    <Button onClick={startScanner} className="w-full font-display gap-2">
                      <Camera size={16} /> פתח מצלמה לסריקה
                    </Button>
                  )}

                  {resolving && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>מעקב אחרי הפניה...</span>
                    </div>
                  )}

                  {scanError && (
                    <p className="text-destructive text-xs text-center font-display">{scanError}</p>
                  )}

                  {lastScanned && (
                    <p className="text-[10px] text-muted-foreground text-center font-mono break-all" dir="ltr">
                      נקרא: {lastScanned}
                    </p>
                  )}

                  <div className="border-t border-border pt-3 space-y-2">
                    <p className="text-[10px] text-muted-foreground text-center">או הזן קוד / קישור ידנית</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="bonus_3, jail, או קישור מלא..."
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground font-display placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        dir="ltr"
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                      />
                      <Button onClick={handleManualSubmit} size="sm" disabled={!manualInput.trim()}>
                        אמת
                      </Button>
                    </div>
                  </div>
                </div>
              ) : !executed ? (
                <div className="space-y-4">
                  {visuals && (
                    <div className={`rounded-xl border-2 p-5 text-center ${visuals.color}`}>
                      <div className="text-accent mb-2 flex justify-center">{visuals.icon}</div>
                      <h4 className="text-lg font-display font-black text-foreground">{visuals.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{visuals.description}</p>
                      {matchedSheetCard && (
                        <p className="text-xs text-muted-foreground/70 mt-2 italic">{matchedSheetCard.description}</p>
                      )}
                    </div>
                  )}

                  {(matchedCardKey === 'skip_pick' || matchedCardKey === 'pick_skip') && (
                    <div className="space-y-2">
                      <p className="text-xs font-display font-bold text-foreground">בחר שחקן לדילוג:</p>
                      {players
                        .filter(p => p.id !== currentPlayer?.id)
                        .map(p => {
                          const party = PARTIES.find(pt => pt.id === p.party);
                          return (
                            <button
                              key={p.id}
                              onClick={() => setPickTarget(p.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                pickTarget === p.id
                                  ? 'border-accent bg-accent/15'
                                  : 'border-border bg-muted/30 hover:bg-muted/50'
                              }`}
                            >
                              <span>{party?.emoji}</span>
                              <span className="font-display font-bold text-foreground">{p.name}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}

                  <Button
                    onClick={executeCard}
                    className="w-full font-display"
                    disabled={(matchedCardKey === 'skip_pick' || matchedCardKey === 'pick_skip') && !pickTarget}
                  >
                    הפעל כרטיס ⚡
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">✅</motion.div>
                  <p className="text-coalition font-display font-bold">בוצע!</p>
                  <Button onClick={handleClose} className="w-full font-display">סגור</Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PowerActivatedOverlay
        cardType={showPowerOverlay}
        cardLabel={matchedSheetCard?.action}
        onComplete={() => setShowPowerOverlay(null)}
      />
    </>
  );
};

export default QrScannerModal;
