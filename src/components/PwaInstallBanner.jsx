import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    
    if (isStandalone) return;

    // Check if dismissed recently (don't show again for 24 hours)
    const dismissedAt = localStorage.getItem('pwa-banner-dismissed');
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    if (isIosDevice) {
      setShowBanner(true);
      return;
    }

    // Check if prompt was already captured globally (before React loaded)
    if (window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
      setShowBanner(true);
      return;
    }

    // Also listen for future events (in case it fires after mount)
    const handler = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Fallback for mobile browsers: show banner after 2 seconds anyway
    const fallbackTimer = setTimeout(() => {
      const isMobile = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // Re-check if prompt arrived during timeout
        if (window.deferredPwaPrompt) {
          setDeferredPrompt(window.deferredPwaPrompt);
        }
        setShowBanner(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    // Try global prompt first, then local state
    const prompt = deferredPrompt || window.deferredPwaPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      window.deferredPwaPrompt = null;
      setDeferredPrompt(null);
      setShowBanner(false);
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const hasPrompt = deferredPrompt || window.deferredPwaPrompt;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '12px',
      right: '12px',
      background: 'rgba(255, 255, 255, 0.97)',
      backdropFilter: 'blur(12px)',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999,
      border: '1px solid rgba(0,0,0,0.06)',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--green-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <Download size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#1a1a2e' }}>Install Prep App</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {isIos ? 'Add to home screen for app experience' : 'Install for faster access & offline use'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#999',
            padding: '4px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <X size={20} />
        </button>
      </div>

      {isIos ? (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '12px 14px', 
          borderRadius: '12px',
          fontSize: '13px',
          color: '#444',
          lineHeight: 1.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, color: '#1a1a2e' }}>
            <Share size={14} /> How to install:
          </div>
          <div>1. Tap the <strong>Share</strong> button <span style={{ fontSize: '16px' }}>⬆</span> at the bottom</div>
          <div>2. Scroll down & tap <strong>"Add to Home Screen"</strong></div>
          <div>3. Tap <strong>"Add"</strong> — Done! 🎉</div>
        </div>
      ) : (
        <button 
          onClick={hasPrompt ? handleInstallClick : undefined}
          disabled={!hasPrompt}
          style={{
            width: '100%',
            background: hasPrompt ? 'var(--green-500)' : '#ccc',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: hasPrompt ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Download size={16} /> {hasPrompt ? 'Install Now' : 'Loading...'}
        </button>
      )}
    </div>
  );
}
