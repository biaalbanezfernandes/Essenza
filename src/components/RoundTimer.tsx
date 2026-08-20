import React, { useState, useEffect, useRef } from 'react';
import { Clock, Siren, ShieldAlert } from 'lucide-react';

interface RoundTimerProps {
  currentRound: number;
  totalSeconds?: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export const RoundTimer: React.FC<RoundTimerProps> = ({
  currentRound,
  totalSeconds = 90, // 1 minute and 30 seconds (1m30s)
  onTimeUp,
  isPaused = false
}) => {
  // Round 1 is free-time tutorial
  const isTimedRound = currentRound > 1;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Reset timer when round changes
  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [currentRound, totalSeconds]);

  useEffect(() => {
    if (!isTimedRound || isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimedRound, isPaused]);

  // If round 1, show a clean tutorial mode badge
  if (!isTimedRound) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        padding: '0.5rem 1.25rem',
        borderRadius: '30px',
        color: 'var(--accent-success)',
        fontSize: '0.9rem',
        fontWeight: 700,
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
      }}>
        <Clock size={18} />
        <span>Rodada 1 • Tempo Livre (Tutorial)</span>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isEmergency = secondsLeft <= 15;
  const progressPct = (secondsLeft / totalSeconds) * 100;

  return (
    <>
      {/* Fullscreen Police Flashing Siren Strobe overlay when <= 15s */}
      {isEmergency && (
        <div
          className="police-strobe-overlay"
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9990,
            animation: 'policeStrobe 0.45s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* Big Centered Timer Widget */}
      <div
        className={isEmergency ? 'police-alarm-active' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: isEmergency
            ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.45) 0%, rgba(15, 23, 42, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)',
          border: `2px solid ${isEmergency ? '#ef4444' : 'var(--accent-gold)'}`,
          padding: '0.65rem 1.75rem',
          borderRadius: '20px',
          boxShadow: isEmergency
            ? '0 0 40px rgba(239, 68, 68, 0.9), inset 0 0 20px rgba(239, 68, 68, 0.5)'
            : '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(212, 175, 55, 0.25)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Left: Digital Clock Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
            <Clock size={16} style={{ color: isEmergency ? '#ff8a8a' : 'var(--accent-gold)' }} />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isEmergency ? '#ff8a8a' : 'var(--text-secondary)'
            }}>
              TEMPO RESTANTE
            </span>
          </div>

          <div style={{
            fontSize: '2rem',
            fontFamily: 'monospace',
            fontWeight: 900,
            color: isEmergency ? '#ff4d4d' : '#ffffff',
            textShadow: isEmergency ? '0 0 20px rgba(255, 77, 77, 1)' : '0 0 10px rgba(255, 255, 255, 0.2)',
            lineHeight: 1.1,
            letterSpacing: '0.05em'
          }}>
            {formattedTime}
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{
          width: '1px',
          height: '42px',
          background: isEmergency ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.12)'
        }} />

        {/* Right: Police Alarm Indicator (Off when > 15s, Flashing when <= 15s) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '130px' }}>
          {isEmergency ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#ef4444',
              color: '#fff',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.78rem',
              letterSpacing: '0.05em',
              animation: 'sirenFlash 0.35s infinite alternate',
              boxShadow: '0 0 20px #ef4444'
            }}>
              <Siren size={18} style={{ animation: 'sirenRotate 0.4s linear infinite' }} />
              <span>SIRENE ATIVA!</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.72rem',
              letterSpacing: '0.05em'
            }}>
              <ShieldAlert size={15} style={{ opacity: 0.4 }} />
              <span>Alarme: Desligado</span>
            </div>
          )}

          {/* Mini progress bar */}
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '0.45rem'
          }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: isEmergency ? '#ef4444' : 'var(--accent-gold)',
              transition: 'width 1s linear'
            }} />
          </div>
        </div>
      </div>
    </>
  );
};
