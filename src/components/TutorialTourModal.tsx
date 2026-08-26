import React, { useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, X } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  message: string;
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
    message: '👥 6. FUNCIONÁRIOS DO CAOS: Durante a simulação, funcionários da empresa vão aparecer de surpresa para te atrapalhar com imprevistos reais da fábrica! Basta clicar no X vermelho (ou em qualquer parte do personagem) para fazê-los desaparecer.',
    npcImage: '/characters/npc_manuel_cafe_essenza.png',
    npcName: 'Manuel do Café',
    npcRole: 'Barista & Mestre Copista',
    npcSpeech: '☕ Chefe! Desculpa atrapalhar, mas durante as rodadas eu e outros 19 funcionários vamos invadir sua tela de surpresa com dúvidas e imprevistos! É só clicar no [X] vermelho ou na gente para nos mandar de volta ao trabalho!'
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

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      background: 'linear-gradient(135deg, rgba(16, 24, 48, 0.98) 0%, rgba(8, 14, 28, 0.98) 100%)',
      border: '2px solid var(--accent-gold)',
      borderRadius: '14px',
      padding: '1rem 1.4rem',
      margin: '0.75rem auto',
      maxWidth: '720px',
      width: '100%',
      boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 25px rgba(212, 175, 55, 0.4)',
    }}>
      {/* Balão com Personagem Ilustrativo (Quando houver NPC na etapa) */}
      {step.npcImage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1.5px solid rgba(212, 175, 55, 0.7)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          flexWrap: 'wrap'
        }}>
          {/* Foto/Avatar do Personagem */}
          <div style={{
            position: 'relative',
            flexShrink: 0,
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #d4af37',
            background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(6,9,19,0.95) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(212,175,55,0.45)'
          }}>
            <img 
              src={step.npcImage} 
              alt={step.npcName || 'Funcionário'} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center'
              }} 
            />
          </div>

          {/* Fala em Balão do Personagem */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <strong style={{ color: '#d4af37', fontSize: '0.95rem' }}>{step.npcName}</strong>
              <span style={{
                fontSize: '0.68rem',
                background: 'rgba(212, 175, 55, 0.15)',
                color: '#f3f4f6',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {step.npcRole}
              </span>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.88rem',
              color: '#ffffff',
              lineHeight: 1.45,
              fontStyle: 'italic',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              borderLeft: '3px solid #d4af37'
            }}>
              "{step.npcSpeech}"
            </p>
          </div>
        </div>
      )}

      {/* Main Content & Buttons Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
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

        {/* GIGANTIC Nav Buttons Cluster */}
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
    </div>
  );
};
