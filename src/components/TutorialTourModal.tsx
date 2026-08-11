import React, { useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  message: string;
}

export const tutorialSteps: TutorialStep[] = [
  { targetId: 'tutorial-cash',        message: '💵 Mantenha o Caixa Previsto positivo!' },
  { targetId: 'tutorial-investments', message: '🎯 Arraste os sliders para dividir a verba.' },
  { targetId: 'tutorial-products',    message: '👗 Defina preço e quantidade de cada roupa.' },
  { targetId: 'tutorial-ssis',        message: '🤖 Verde = tudo certo. Vermelho = corrija antes de enviar.' },
  { targetId: 'tutorial-submit',      message: '🎓 Tutorial concluído! Ajuste tudo e processe quando quiser.' },
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
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.6rem',
      background: 'rgba(8, 14, 28, 0.92)',
      border: '1px solid var(--accent-gold)',
      borderRadius: '8px',
      padding: '0.4rem 0.75rem',
      margin: '0.5rem 0',
      maxWidth: '480px',
      boxShadow: '0 0 14px rgba(212, 175, 55, 0.25)',
      flexWrap: 'wrap',
    }}>
      {/* Message */}
      <span style={{ fontSize: '0.82rem', color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
        {step.message}
      </span>

      {/* Nav cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
        <button
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Anterior"
          style={{
            background: 'transparent',
            border: 'none',
            color: isFirst ? 'var(--text-muted)' : '#fff',
            cursor: isFirst ? 'default' : 'pointer',
            padding: '0.15rem',
            display: 'flex',
            opacity: isFirst ? 0.3 : 1,
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, minWidth: '28px', textAlign: 'center' }}>
          {stepIndex + 1}/{tutorialSteps.length}
        </span>

        {isLast ? (
          <button
            onClick={finish}
            aria-label="Concluir tutorial"
            style={{
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              padding: '0.2rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <CheckCircle2 size={13} /> OK
          </button>
        ) : (
          <button
            onClick={onNext}
            aria-label="Próximo"
            style={{
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              padding: '0.2rem 0.45rem',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}

        <button
          onClick={finish}
          aria-label="Fechar tutorial"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '0.15rem',
            marginLeft: '0.1rem',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
