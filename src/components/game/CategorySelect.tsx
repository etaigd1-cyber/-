import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Battery, Zap, Shield, AlertTriangle, Hourglass } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { CATEGORIES, PARTIES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PowerBankDisplay from '@/components/game/PowerBankDisplay';

const CategorySelect = () => {
  const {
    selectCategory, players, currentPlayerIndex, addCodeToBank, useCode,
    activeCodeValue, triggerNationalCrisis, localPlayerId, battleInviteData,
  } = useGameStore();
  const [codeInput, setCodeInput] = useState('');
  const currentPlayer = players[currentPlayerIndex];

  // Determine if this device is the active player (initiator)
  const isActivePlayer = localPlayerId === battleInviteData?.initiatorId
    || localPlayerId === currentPlayer?.id;

  // Non-active players see a waiting screen
  if (!isActivePlayer) {
    const initiator = players.find(p => p.id === (battleInviteData?.initiatorId || currentPlayer?.id));
    const party = initiator ? PARTIES.find(pt => pt.id === initiator.party) : null;

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
        <h2 className="text-xl font-display font-bold text-foreground">ממתין לבחירת קטגוריה</h2>
        <div className="glass-panel p-4 text-center w-full max-w-sm">
          <p className="text-sm text-foreground font-display">
            {party?.emoji} <span className="font-bold">{initiator?.name}</span> בוחר/ת קטגוריה...
          </p>
          {battleInviteData && (
            <p className="text-xs text-muted-foreground mt-2">
              {battleInviteData.districtEmoji} {battleInviteData.districtName} | הימור: {battleInviteData.bet} מנדטים
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">הקרב יתחיל אוטומטית כשתיבחר קטגוריה</p>
      </motion.div>
    );
  }

  const availableCodes = currentPlayer?.powerBank.filter(c => !c.used) || [];

  const handleScanCode = () => {
    const value = parseInt(codeInput);
    if (!currentPlayer || isNaN(value) || value < 1 || value > 99) return;

    if (value === 99) {
      triggerNationalCrisis();
      setCodeInput('');
      return;
    }

    const clampedValue = Math.min(10, value);
    addCodeToBank(currentPlayer.id, clampedValue);
    setCodeInput('');
  };

  const handleUseCode = (codeId: string) => {
    if (!currentPlayer) return;
    useCode(currentPlayer.id, codeId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-6"
    >
      <div className="flex items-center gap-2 text-primary">
        <QrCode size={28} />
        <h2 className="text-2xl font-display font-bold">בחר קטגוריה</h2>
      </div>

      {/* Code Entry */}
      <div className="glass-panel p-4 w-full max-w-sm space-y-3">
        <p className="text-xs text-muted-foreground font-display">הזן קוד מכרטיס (1-10) או קוד 99 למשבר:</p>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            max="99"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="הזן קוד..."
            className="bg-muted border-border text-foreground flex-1"
          />
          <Button onClick={handleScanCode} disabled={!codeInput} size="sm" className="bg-primary text-primary-foreground font-display">
            סרוק
          </Button>
        </div>
        {codeInput === '99' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs font-display flex items-center gap-1">
            <AlertTriangle size={12} /> קוד 99 — משבר לאומי!
          </motion.p>
        )}
      </div>

      {/* Power Bank */}
      <PowerBankDisplay />

      {/* Use Code Before Challenge */}
      {availableCodes.length > 0 && (
        <div className="glass-panel p-3 w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-2 font-display">בחר קוד להפעלה לפני האתגר:</p>
          <div className="flex gap-2 flex-wrap">
            {availableCodes.map((code) => (
              <motion.button
                key={code.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUseCode(code.id)}
                className={`px-3 py-2 rounded-lg border font-display font-bold text-sm flex items-center gap-1 transition-colors ${
                  code.value >= 8
                    ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                    : code.value <= 3
                    ? 'bg-coalition/20 border-coalition text-coalition hover:bg-coalition/30'
                    : 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
                }`}
              >
                {code.value >= 8 ? <Zap size={12} /> : code.value <= 3 ? <Shield size={12} /> : <Battery size={12} />}
                {code.value}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Active Code Indicator */}
      {activeCodeValue !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`px-4 py-2 rounded-lg font-display font-bold text-sm ${
            activeCodeValue >= 8
              ? 'bg-accent/20 text-accent border border-accent'
              : activeCodeValue <= 3
              ? 'bg-coalition/20 text-coalition border border-coalition'
              : 'bg-primary/20 text-primary border border-primary'
          }`}
        >
          {activeCodeValue >= 8 ? '⚡ מצב הימור גבוה — אתגר קשה, 10+ מנדטים!' :
           activeCodeValue <= 3 ? '🛡️ מצב בטוח — אתגר קל, 2-3 מנדטים' :
           '📋 קוד רגיל מופעל'}
        </motion.div>
      )}

      <p className="text-muted-foreground text-sm">סרוק QR או בחר קטגוריה</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {CATEGORIES.filter(cat => cat.id !== 'debate').map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectCategory(cat.id)}
            className="party-card border-border hover:border-primary/50 flex flex-col items-center gap-2 py-6"
          >
            <span className="text-3xl">{cat.emoji}</span>
            <span className="font-display font-bold text-foreground">{cat.name}</span>
            <span className="text-xs text-muted-foreground">{cat.timer} שניות</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default CategorySelect;
