import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface IntroVideoProps {
  onEnd: () => void;
}

const IntroVideo = ({ onEnd }: IntroVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Set a timeout — if video hasn't started playing in 3s, skip intro
    const fallbackTimer = setTimeout(() => {
      if (v.paused || v.readyState < 2) {
        setShowFallback(true);
      }
    }, 3000);

    const tryPlay = () => {
      v.muted = true;
      v.play().catch(() => {
        // Last resort: user interaction needed
        setShowFallback(true);
      });
    };

    if (v.readyState >= 2) {
      tryPlay();
    } else {
      v.addEventListener('loadeddata', tryPlay, { once: true });
    }

    return () => clearTimeout(fallbackTimer);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !muted;
      videoRef.current.muted = next;
      setMuted(next);
    }
  };

  const handleTapToPlay = () => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().then(() => setShowFallback(false)).catch(() => onEnd());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        className="absolute inset-0 w-full h-full object-contain"
        src="/intro.mp4"
        onEnded={onEnd}
      />

      {/* Tap to play fallback for stubborn mobile browsers */}
      {showFallback && (
        <button
          onClick={handleTapToPlay}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/80"
        >
          <span className="text-white text-xl font-bold px-8 py-4 rounded-xl border border-white/30 bg-white/10">
            ▶ לחץ להפעלת הסרטון
          </span>
        </button>
      )}

      {/* Skip button */}
      <button
        onClick={onEnd}
        className="absolute top-4 left-4 z-50 px-4 py-2 text-sm font-bold rounded-lg transition-all hover:bg-white/20"
        style={{
          background: 'hsl(0 0% 0% / 0.5)',
          color: 'hsl(0 0% 100% / 0.8)',
          border: '1px solid hsl(0 0% 100% / 0.2)',
        }}
      >
        דלג ➜
      </button>

      {/* Volume toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-2 rounded-lg transition-all hover:bg-white/20"
        style={{
          background: 'hsl(0 0% 0% / 0.5)',
          border: '1px solid hsl(0 0% 100% / 0.2)',
        }}
      >
        {muted ? (
          <VolumeX className="w-5 h-5 text-white/80" />
        ) : (
          <Volume2 className="w-5 h-5 text-white/80" />
        )}
      </button>
    </div>
  );
};

export default IntroVideo;
