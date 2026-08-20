import React, { useState, useEffect, useCallback } from 'react';
import { characters, type NpcCharacter } from '../data/characters';
import { X } from 'lucide-react';

interface NpcPopupProps {
  currentRound: number;
  disabled?: boolean;
}

export const NpcPopup: React.FC<NpcPopupProps> = ({ currentRound, disabled = false }) => {
  const [activeNpc, setActiveNpc] = useState<NpcCharacter | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger next random NPC popup
  const scheduleNextNpc = useCallback(() => {
    if (disabled) return;

    // Random interval between 10s and 20s
    const delay = Math.floor(Math.random() * 10000) + 10000;
    
    const timer = setTimeout(() => {
      const randomNpc = characters[Math.floor(Math.random() * characters.length)];
      setActiveNpc(randomNpc);
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [disabled]);

  useEffect(() => {
    if (disabled) {
      setIsVisible(false);
      return;
    }

    // Schedule initial NPC on mount (4s in rounds 2/3, 8s in round 1)
    const initialDelay = currentRound === 1 ? 8000 : 4000;
    const timer = setTimeout(() => {
      const randomNpc = characters[Math.floor(Math.random() * characters.length)];
      setActiveNpc(randomNpc);
      setIsVisible(true);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [currentRound, disabled]);

  const handleDismiss = () => {
    setIsVisible(false);
    scheduleNextNpc();
  };

  // Keyboard shortcut: ESC to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible || !activeNpc) return null;

  return (
    <div
      role="dialog"
      aria-label={`Interrupção de ${activeNpc.name}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(4, 7, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out forwards',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        // Dismiss if clicking backdrop or image directly
        handleDismiss();
      }}
    >
      {/* Giant Character Image Wrapper with Red [X] on the Top-Right Corner */}
      <div
        className="giant-npc-image-box"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'giantNpcPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          filter: 'drop-shadow(0 20px 50px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px rgba(212, 175, 55, 0.45))',
          maxWidth: '85vw',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()} // Let clicks on the [X] or box handle dismiss
      >
        {/* BIG RED [X] BUTTON ON THE TOP-RIGHT CORNER */}
        <button
          onClick={handleDismiss}
          aria-label="Fechar personagem"
          title="Fechar e voltar ao jogo (X ou ESC)"
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-15px',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            border: '4px solid #ffffff',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 30px rgba(239, 68, 68, 1), 0 0 25px rgba(255, 255, 255, 0.9)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.25) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(239, 68, 68, 1), 0 0 30px #ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(239, 68, 68, 1), 0 0 25px rgba(255, 255, 255, 0.9)';
          }}
        >
          <X size={34} strokeWidth={4} />
        </button>

        {/* GIANT PURE PNG CUTOUT */}
        <img
          src={activeNpc.image}
          alt={activeNpc.name}
          onClick={handleDismiss}
          style={{
            height: '75vh',
            maxHeight: '750px',
            maxWidth: '85vw',
            objectFit: 'contain',
            userSelect: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
};
