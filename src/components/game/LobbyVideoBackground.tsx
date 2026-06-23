import { useEffect, useRef } from 'react';

const LobbyVideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Force play on mobile browsers
    const tryPlay = () => {
      video.play().catch(() => {
        // If autoplay blocked, try again on first user interaction
        const handler = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', handler);
          document.removeEventListener('click', handler);
        };
        document.addEventListener('touchstart', handler, { once: true });
        document.addEventListener('click', handler, { once: true });
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        // @ts-ignore – webkit attribute for older iOS
        webkit-playsinline="true"
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        src="/lobby-bg.mp4"
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(20,20,20,0.3) 0%, rgba(20,20,20,0.3) 20%, rgba(10,10,10,0.6) 50%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%)',
        }}
      />
    </div>
  );
};

export default LobbyVideoBackground;
