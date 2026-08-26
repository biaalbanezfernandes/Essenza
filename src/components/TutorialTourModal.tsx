import React, { useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, X } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  message: string;
  isGiantNpc?: boolean;
  npcImage?: string;
  npcName?: string;
  npcRole?: string;
  npcSpeech?: string;
}

export const tutorialSteps: TutorialStep[] = [
  { targetId: 'tutorial-cash',        message: '💵 1. CAIXA: Mantenha o saldo previsto sempre no azul!' },
  { targetId: 'tutorial-investments', message: '🎯 2. VERBA: Arraste os sliders para distribuir o capital nas 4 áreas.' },
  { targetId: 'tutorial-products',    message: '👗 3. PRODUTOS: Ajuste preço de venda e lotes a produzir de cada peça.' },
  { targetId: 'tutorial-ssis',        message: '🤖 4. IA SCORPIO: Avisos em tempo real. Se ficar vermelho, corrija antes de enviar!' },
  { targetId: 'tutorial-timer-info',  message: '⏱️ 5. DINÂMICA: Rodadas 2 e 3 têm timer de 1m30s e sirene aos 15s finais!' },
  { 
    targetId: 'tutorial-chaos-npc',   
    message: '👥 6. FUNCIONÁRIOS DO CAOS: Durante a simulação, funcionários vão invadir a tela. Basta clicar no X para fechar!',
    isGiantNpc: true,
    npcImage: '/characters/npc_manuel_cafe_essenza.png',
    npcName: 'Manuel do Café',
    npcRole: 'Barista & Copista',
    npcSpeech: 'Chefe! Nós vamos invadir a tela com dúvidas e imprevistos. Basta clicar no ❌ ou na gente para nos dispensar!'
  },
  { targetId: 'tutorial-submit',      message: '🎓 7. TUDO PRONTO! Ajuste seus dados e processe a rodada quando quiser.' },
];

interface MicroTooltipProps {
  stepIndex: number;
  step: TutorialStep;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const MicroTooltip: React.FC<MicroTooltipProps> = ({
  stepIndex,
  step,
  onNext,
  onPrev,
  onClose
}) => {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === tutorialSteps.length - 1;

  useEffect(() => {
    document.querySelectorAll('.tutorial-spotlight-active').forEach(el =>
      el.classList.remove('tutorial-spotlight-active')
    );
    const el = document.getElementById(step.targetId);
    if (el) {
      el.classList.add('tutorial-spotlight-active');
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    }
  }, [step.targetId]);

  const finish = () => {
    document.querySelectorAll('.tutorial-spotlight-active').forEach(el =>
      el.classList.remove('tutorial-spotlight-active')
    );
    onClose();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // ── ETAPA ESPECIAL COM PERSONAGEM GIGANTE + BALÃOZINHO ───────────────────
  if (step.isGiantNpc) {
    return (
      <div
        role="dialog"
        aria-label="Tutorial - Funcionários do Caos"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(4, 7, 18, 0.75)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          padding: '1rem',
          animation: 'fadeIn 0.25s ease-out forwards',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          {/* Giant Character Image Wrapper with Red [X] */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'giantNpcPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              filter: 'drop-shadow(0 20px 50px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px rgba(212, 175, 55, 0.5))',
            }}
          >
            {/* BIG RED [X] BUTTON */}
            <button
              onClick={onNext}
              aria-label="Fechar personagem"
              title="Clique para dispensar o funcionário (X)"
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
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
                boxShadow: '0 6px 30px rgba(239, 68, 68, 1), 0 0 25px rgba(255, 255, 255, 0.9)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 100,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2) rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
            >
              <X size={30} strokeWidth={4} />
            </button>

            {/* Giant Character PNG */}
            <img
              src={step.npcImage || '/characters/npc_manuel_cafe_essenza.png'}
              alt={step.npcName || 'Funcionário'}
              onClick={onNext}
              style={{
                height: '56vh',
                maxHeight: '520px',
                maxWidth: '82vw',
                objectFit: 'contain',
                userSelect: 'none',
                cursor: 'pointer',
              }}
            />

            {/* Balãozinho com pouco texto e navegação */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, rgba(16, 24, 48, 0.98) 0%, rgba(8, 14, 28, 0.98) 100%)',
                border: '2px solid #d4af37',
                borderRadius: '16px',
                padding: '0.85rem 1.25rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.95), 0 0 30px rgba(212, 175, 55, 0.5)',
                width: 'max-content',
                maxWidth: '92vw',
                minWidth: '290px',
                textAlign: 'center',
                zIndex: 90,
              }}
            >
              {/* Nome do funcionário e cargo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1rem' }}>☕</span>
                <strong style={{ color: '#d4af37', fontSize: '0.95rem' }}>{step.npcName || 'Manuel do Café'}</strong>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#f3f4f6',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {step.npcRole || 'Barista & Copista'}
                </span>
              </div>

              {/* Balão com pouco texto e direto */}
              <p style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.9rem',
                color: '#ffffff',
                lineHeight: 1.4,
                fontWeight: 600
              }}>
                "Chefe! Nós vamos invadir a tela com dúvidas da fábrica.<br />
                <span style={{ color: '#fcd34d' }}>Basta clicar no ❌ ou na gente para nos dispensar!</span>"
              </p>

              {/* Botões de navegação */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                <button
                  onClick={onPrev}
                  aria-label="Passo anterior"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>

                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--accent-gold)',
                  fontWeight: 800,
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '8px',
                }}>
                  {stepIndex + 1} / {tutorialSteps.length}
                </span>

                <button
                  onClick={onNext}
                  className="btn-primary"
                  style={{
                    padding: '0.45rem 1.15rem',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.6)',
                  }}
                >
                  Entendi! <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ETAPAS NORMAIS DO TUTORIAL ───────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      background: 'linear-gradient(135deg, rgba(16, 24, 48, 0.98) 0%, rgba(8, 14, 28, 0.98) 100%)',
      border: '2px solid var(--accent-gold)',
      borderRadius: '14px',
      padding: '0.85rem 1.4rem',
      margin: '0.75rem auto',
      maxWidth: '720px',
      width: '100%',
      boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 25px rgba(212, 175, 55, 0.4)',
      flexWrap: 'wrap',
    }}>
      {/* Message */}
      <span style={{
        fontSize: '0.95rem',
        color: '#ffffff',
        fontWeight: 700,
        flex: 1,
        minWidth: '240px',
        lineHeight: 1.45,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {step.message}
      </span>

      {/* Nav Buttons Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Passo anterior"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: isFirst ? 'var(--text-muted)' : '#fff',
            cursor: isFirst ? 'default' : 'pointer',
            padding: '0.55rem 0.9rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            opacity: isFirst ? 0.3 : 1,
            transition: 'all 0.2s',
          }}
        >
          <ChevronLeft size={20} /> Anterior
        </button>

        {/* Step Indicator */}
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--accent-gold)',
          fontWeight: 800,
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '0.45rem 0.75rem',
          borderRadius: '8px',
          minWidth: '48px',
          textAlign: 'center'
        }}>
          {stepIndex + 1} / {tutorialSteps.length}
        </span>

        {/* Big Next / Finish Button */}
        {isLast ? (
          <button
            onClick={finish}
            aria-label="Concluir tutorial"
            className="btn-primary"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.6)',
            }}
          >
            <CheckCircle2 size={18} /> Entendi!
          </button>
        ) : (
          <button
            onClick={onNext}
            aria-label="Próximo passo"
            className="btn-primary"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.6)',
            }}
          >
            Próximo <ChevronRight size={20} />
          </button>
        )}

        {/* Giant Close Button */}
        <button
          onClick={finish}
          aria-label="Fechar tutorial"
          title="Fechar tutorial"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ff8a8a',
            cursor: 'pointer',
            borderRadius: '8px',
            padding: '0.55rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '0.2rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#ff8a8a';
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
