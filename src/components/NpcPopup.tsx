import React, { useState, useEffect, useCallback } from 'react';
import { characters, type NpcCharacter } from '../data/characters';
import { X, MessageSquareWarning } from 'lucide-react';

interface NpcPopupProps {
  currentRound: number;
  disabled?: boolean;
}

export const NpcPopup: React.FC<NpcPopupProps> = ({ currentRound, disabled = false }) => {
  const [activeNpc, setActiveNpc] = useState<NpcCharacter | null>(null);
  const [dialogue, setDialogue] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // Trigger next random NPC popup
  const scheduleNextNpc = useCallback(() => {
    if (disabled) return;

    // Random interval between 10s and 20s
    const delay = Math.floor(Math.random() * 10000) + 10000;
    
    const timer = setTimeout(() => {
      const randomNpc = characters[Math.floor(Math.random() * characters.length)];
      const randomDialogue = randomNpc.dialogues[Math.floor(Math.random() * randomNpc.dialogues.length)];
      
      setActiveNpc(randomNpc);
      setDialogue(randomDialogue);
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [disabled]);

  useEffect(() => {
    if (disabled) {
      setIsVisible(false);
      return;
    }

    // Schedule initial NPC on mount (5s in rounds 2/3, 8s in round 1)
    const initialDelay = currentRound === 1 ? 8000 : 5000;
    const timer = setTimeout(() => {
      const randomNpc = characters[Math.floor(Math.random() * characters.length)];
      const randomDialogue = randomNpc.dialogues[Math.floor(Math.random() * randomNpc.dialogues.length)];
      setActiveNpc(randomNpc);
      setDialogue(randomDialogue);
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(4, 7, 18, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.25s ease-out forwards',
        padding: '1rem',
      }}
      onClick={(e) => {
        // Dismiss if clicking on backdrop
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      {/* Giant Character Container Covering Center Screen */}
      <div
        className="giant-npc-wrapper"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'giantNpcPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 40px rgba(212, 175, 55, 0.5))',
          maxWidth: '650px',
          width: '100%',
        }}
      >
        {/* Floating Comic Speech Bubble */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(145deg, rgba(16, 24, 48, 0.98) 0%, rgba(8, 12, 26, 0.98) 100%)',
          border: '3px solid var(--accent-gold)',
          borderRadius: '20px',
          padding: '1.25rem 2rem',
          marginBottom: '-35px',
          zIndex: 20,
          boxShadow: '0 15px 40px rgba(0,0,0,0.9), 0 0 35px rgba(212, 175, 55, 0.6)',
          maxWidth: '480px',
          width: '90%',
          textAlign: 'center',
        }}>
          {/* GIGANTIC RED [X] CLOSE BUTTON */}
          <button
            onClick={handleDismiss}
            aria-label="Fechar e dispensar funcionário"
            title="Dispensar e voltar ao trabalho (X ou ESC)"
            style={{
              position: 'absolute',
              top: '-18px',
              right: '-18px',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              border: '3.5px solid #ffffff',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 25px rgba(239, 68, 68, 1), 0 0 20px rgba(255, 255, 255, 0.8)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 30,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.25) rotate(90deg)';
              e.currentTarget.style.boxShadow = '0 8px 35px rgba(239, 68, 68, 1), 0 0 25px #fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(239, 68, 68, 1), 0 0 20px rgba(255, 255, 255, 0.8)';
            }}
          >
            <X size={32} strokeWidth={4} />
          </button>

          {/* NPC Name Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span className="badge-pill badge-gold" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', fontWeight: 800 }}>
              <MessageSquareWarning size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {activeNpc.role}
            </span>
          </div>

          <strong style={{ fontSize: '1.25rem', color: '#fff', display: 'block', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
            {activeNpc.name}
          </strong>

          <p style={{
            fontSize: '1.05rem',
            color: '#fef08a',
            fontWeight: 700,
            margin: '0.25rem 0 0.5rem',
            lineHeight: 1.4,
          }}>
            "{dialogue}"
          </p>

          <button
            onClick={handleDismiss}
            style={{
              marginTop: '0.5rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1.5px solid rgba(239, 68, 68, 0.6)',
              color: '#ff8a8a',
              borderRadius: '8px',
              padding: '0.4rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#ff8a8a';
            }}
          >
            <X size={16} strokeWidth={3} /> Dispensar da Sala [X]
          </button>
        </div>

        {/* GIGANTIC Cutout PNG Image Covering the Screen */}
        <div style={{
          height: '580px',
          maxHeight: '68vh',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          userSelect: 'none',
        }}>
          <img
            src={activeNpc.image}
            alt={activeNpc.name}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
            }}
          />
        </div>
      </div>
    </div>
  );
};
