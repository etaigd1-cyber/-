import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import studioImage from '@/assets/studio-entrance.jpg';
import { useGameStore } from '@/store/gameStore';
import { Input } from '@/components/ui/input';
import IntroVideo from '@/components/game/IntroVideo';

const TICKER_TEXT = 'דיון גורלי: מי יתפוס את הכסא ה-61 | המועמדים ההיסטוריים אפורים, מנחה סטטית | מנחם בגין מציע לכולם קפה שחור ודיון על סמכות | יצחק רבין נבחר וכל השאר אפורים כחורף בירושלים | משה דיין פוזל לכיוון הקארד \'תעלה\' שלו | גולדה מאיר מפעילה את אפקט \'יוה"כ\' וכולם במתח';

type ScreenState = 'intro' | 'entrance' | 'join';

const Index = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGameStore();
  const [screen, setScreen] = useState<ScreenState>('intro');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewGame = async () => {
    setLoading(true);
    const success = await createRoom();
    setLoading(false);
    if (success) {
      navigate('/lobby');
    } else {
      setJoinError('נכשל ביצירת חדר. נסה שוב.');
    }
  };

  const handleJoinSubmit = async () => {
    if (joinCode.length !== 6) {
      setJoinError('יש להזין קוד בן 6 ספרות');
      return;
    }
    setLoading(true);
    const success = await joinRoom(joinCode);
    setLoading(false);
    if (success) navigate('/lobby');
    else setJoinError('קוד חדר לא נמצא');
  };

  if (screen === 'intro') {
    return <IntroVideo onEnd={() => setScreen('entrance')} />;
  }

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col" dir="rtl">
      {/* Top: Studio image */}
      <div className="relative w-full flex-shrink-0">
        <img
          src={studioImage}
          alt="הכיסא ה-61 — The 61st Seat"
          className="w-full h-auto block"
          draggable={false}
        />
        {/* ON AIR indicator */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-400 tracking-widest">ON AIR</span>
        </div>
      </div>

      {/* Bottom: Buttons area */}
      <div className="flex-1 flex flex-col items-center justify-center px-[7.5%] py-6 gap-4">
        <AnimatePresence mode="wait">
          {screen === 'entrance' && (
            <motion.div
              key="entrance-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center gap-4"
            >
              <PillButton onClick={handleNewGame} disabled={loading}>
                משחק חדש
              </PillButton>
              <PillButton onClick={() => setScreen('join')} disabled={loading}>
                היכנס למשחק קיים
              </PillButton>
              {joinError && (
                <p className="text-red-400 text-sm font-bold">{joinError}</p>
              )}
            </motion.div>
          )}

          {screen === 'join' && (
            <motion.div
              key="join-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[400px] flex flex-col items-center gap-4"
            >
              <h2 className="text-white font-bold text-lg">הכנס קוד כניסה לחדר</h2>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={joinCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setJoinCode(val);
                  setJoinError('');
                }}
                placeholder="000000"
                className="text-center text-3xl font-black tracking-[0.4em] bg-white/10 border-white/20 text-white h-14 placeholder:text-white/30 rounded-full w-[85%]"
                dir="ltr"
              />
              {joinError && <p className="text-red-400 text-xs text-center">{joinError}</p>}
              <div className="flex gap-3 w-[85%]">
                <button
                  onClick={() => { setScreen('entrance'); setJoinError(''); setJoinCode(''); }}
                  className="flex-1 py-3.5 rounded-full text-white/70 border border-white/20 hover:bg-white/10 transition-all font-bold text-base"
                  style={{ fontFamily: '"Heebo", "Rubik", sans-serif' }}
                >
                  חזרה
                </button>
                <PillButton onClick={handleJoinSubmit} disabled={joinCode.length !== 6 || loading} className="flex-1">
                  הצטרף
                </PillButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Satirical news ticker — very bottom */}
      <div
        className="w-full flex-shrink-0 overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, hsl(210 80% 15% / 0.95), hsl(210 70% 20% / 0.9))',
          borderTop: '2px solid hsl(45 80% 55% / 0.6)',
          height: '34px',
        }}
      >
        <div className="flex items-center h-full animate-ticker whitespace-nowrap" dir="rtl">
          <span className="text-xs font-bold text-amber-300 px-4">
            {TICKER_TEXT} &nbsp;&nbsp;|&nbsp;&nbsp; {TICKER_TEXT}
          </span>
        </div>
      </div>
    </div>
  );
};

function PillButton({ children, onClick, disabled, className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-[85%] py-4 rounded-full text-white text-lg font-bold
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        background: 'rgba(30, 30, 30, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        fontFamily: '"Heebo", "Rubik", sans-serif',
      }}
    >
      {children}
    </button>
  );
}

export default Index;
