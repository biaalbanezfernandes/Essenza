import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Mail, User, BookOpen, Cpu, ChevronRight, ChevronLeft, Play, Clock, DollarSign, Tag, Award } from 'lucide-react';

interface BriefingSlide {
  label: string;
  icon: string;
  title: string;
  intro?: string;
  items: { icon?: string; title: string; desc: string }[];
}

const briefingSlides: BriefingSlide[] = [
  {
    label: 'A MISSÃO',
    icon: '🏭',
    title: 'Bem-vindo à Essenza',
    intro: 'Você assume como CEO com a missão de liderar o mercado de moda casual brasileira.',
    items: [
      { title: 'Capital Inicial', desc: 'R$ 500.000,00 disponíveis em caixa para gerenciar.' },
      { title: 'Objetivo Executivo', desc: 'Maximizar o lucro, construir reputação de marca e vencer a concorrência.' }
    ]
  },
  {
    label: 'A CONCORRÊNCIA',
    icon: '📊',
    title: 'O Mercado em Disputa',
    intro: 'Dois rivais com modelos de negócios distintos disputam os mesmos clientes:',
    items: [
      { icon: '⚔️', title: 'Rival A (Volume)', desc: 'Produção massiva com preços baixos e margens enxutas.' },
      { icon: '💎', title: 'Rival B (Premium)', desc: 'Preços altos ancorados em campanhas agressivas de marketing.' }
    ]
  },
  {
    label: 'AS ESTAÇÕES',
    icon: '🗓️',
    title: '3 Rodadas Estratégicas',
    intro: 'Cada rodada representa uma estação climática que muda os hábitos de consumo:',
    items: [
      { icon: '🍂', title: 'Rodada 1 (Outono)', desc: 'Fase de aprendizado e estabilização de caixa (tempo livre).' },
      { icon: '❄️', title: 'Rodada 2 (Inverno)', desc: 'Forte aumento na demanda por agasalhos e moletons.' },
      { icon: '☀️', title: 'Rodada 3 (Verão)', desc: 'Pico de vendas para vestidos de linho e peças leves.' }
    ]
  },
  {
    label: 'DECISÕES',
    icon: '💡',
    title: 'O Que Você Vai Definir',
    intro: 'A cada rodada, equilibre seus investimentos e sua capacidade produtiva:',
    items: [
      { title: '4 Investimentos', desc: 'Matéria-Prima, Produção & Salários, Marketing e Logística.' },
      { title: 'Mix de 6 Produtos', desc: 'Defina preço de venda e lotes a produzir para cada peça do catálogo.' }
    ]
  },
  {
    label: 'RITMO & ATENÇÃO',
    icon: '⏱️',
    title: 'Dinâmica de Jogo & Equipe',
    intro: 'Nas Rodadas 2 e 3, a pressão de mercado aumenta:',
    items: [
      { icon: '⏳', title: 'Cronômetro (1m30s)', desc: '1 minuto e meio por rodada para planejar e processar suas decisões.' },
      { icon: '🚨', title: 'Alarme aos 15s', desc: 'Alerta visual vermelho piscante avisando que o tempo está no fim.' },
      { icon: '👤', title: 'Recados da Equipe', desc: 'Colaboradores podem surgir na tela com recados. Clique no [X] no canto para dispensá-los e continuar!' }
    ]
  },
  {
    label: 'A IA S.S.I.S.',
    icon: '🤖',
    title: 'IA Scorpio & Conselho',
    intro: 'Suporte executivo contínuo durante toda a sua jornada:',
    items: [
      { icon: '⚡', title: 'Alertas em Tempo Real', desc: 'A IA avisa sobre margens e riscos de caixa antes de você enviar a rodada.' },
      { icon: '📋', title: 'Avaliação & Certificado', desc: 'Pareceres dos diretores ao fim de cada fase e certificado pedagógico oficial.' }
    ]
  }
];

export const StartScreen: React.FC = () => {
  const { startGame } = useGame();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingStep, setBriefingStep] = useState(0);
  const [pendingName, setPendingName] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [showBriefing, briefingStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, insira seu nome.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    setError('');
    setPendingName(name);
    setPendingEmail(email);
    setShowBriefing(true);
    setBriefingStep(0);
  };

  const handleNext = () => {
    if (briefingStep < briefingSlides.length - 1) {
      setBriefingStep(prev => prev + 1);
    } else {
      startGame(pendingName, pendingEmail);
    }
  };

  const handlePrev = () => {
    if (briefingStep > 0) setBriefingStep(prev => prev - 1);
  };

  const slide = briefingSlides[briefingStep];
  const isLast = briefingStep === briefingSlides.length - 1;

  return (
    <>
      {/* Briefing Modal Overlay */}
      {showBriefing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.88)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'var(--surface-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '620px',
            width: '100%',
            boxShadow: '0 0 100px rgba(212,175,55,0.18)',
          }} className="animate-fade-in">

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem' }}>
              {briefingSlides.map((_, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: '3px',
                  borderRadius: '4px',
                  background: i <= briefingStep ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s ease'
                }} />
              ))}
            </div>

            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge-pill badge-gold" style={{ fontSize: '0.65rem' }}>{slide.label}</span>
              <span style={{ fontSize: '1.3rem' }}>{slide.icon}</span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.75rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              marginBottom: '0.75rem',
              color: 'white'
            }}>
              {slide.title}
            </h2>

            {/* Intro */}
            {slide.intro && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {slide.intro}
              </p>
            )}

            {/* Structured Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '170px' }}>
              {slide.items.map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  {item.icon && (
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
                  )}
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.88rem', display: 'block' }}>
                      {item.title}
                    </strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.35 }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
              <button
                onClick={handlePrev}
                disabled={briefingStep === 0}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: briefingStep === 0 ? 'var(--text-muted)' : 'white',
                  borderRadius: '8px',
                  padding: '0.6rem 1.2rem',
                  cursor: briefingStep === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  opacity: briefingStep === 0 ? 0.4 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {briefingStep + 1} / {briefingSlides.length}
              </span>

              <button
                onClick={handleNext}
                className={isLast ? 'btn-primary' : ''}
                style={!isLast ? {
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  borderRadius: '8px',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem'
                } : {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.75rem'
                }}
              >
                {isLast ? (
                  <><Play size={16} /> Entrar no Jogo</>
                ) : (
                  <>Próximo <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Start Screen */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }} className="animate-fade-in">
        
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3.5rem', letterSpacing: '-0.03em' }}>ESSENZA</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Simulador Empresarial Inteligente e Plataforma de Aprendizagem FECART
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
          width: '100%',
        }} className="desktop-grid-2">
          <style>{`
            @media (min-width: 768px) {
              .desktop-grid-2 {
                grid-template-columns: 1.2fr 1fr !important;
              }
            }
          `}</style>

          {/* Tutorial Panel */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-display)' }}>
              <BookOpen style={{ color: 'var(--accent-gold)' }} /> Como Funciona a Simulação
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--accent-blue-glow)',
                  color: 'var(--accent-blue)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Gestão de Recursos (R$ 500k)</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    Aloque o orçamento em Matéria-Prima, Produção, Marketing e Logística. Mantenha o caixa sempre positivo.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--accent-gold-glow)',
                  color: 'var(--accent-gold)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Tag size={18} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Mix de 6 Produtos & Preço</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    Ajuste lotes e preços conforme a estação (Inverno = moletons; Verão = vestidos). Respeite os custos de produção.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Timer (1m30s) & Alarme Policial</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    As Rodadas 2 e 3 contam com timer de 1m30s e alarme nos 15s finais. A Rodada 1 é livre para aprender.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--accent-success-glow)',
                  color: 'var(--accent-success)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Award size={18} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Recados da Equipe & IA Scorpio</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>
                    Funcionários surgem com recados (feche no [X]). A IA Scorpio dá diagnósticos e dicas ao vivo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Ficha Cadastral do Gestor</h3>
            <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Insira seus dados para abrir sua sala de controle e receber o certificado oficial.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} /> Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="input-control"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} /> E-mail Profissional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="input-control"
                  required
                />
              </div>

              {error && (
                <div style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                <Cpu size={20} /> Iniciar Simulador Essenza
              </button>
            </form>
          </div>
        </div>
        
        <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem', justifyContent: 'center' }}>
          <span>FECART 2026</span>
          <span>•</span>
          <span>Apoio Acadêmico FECAP</span>
          <span>•</span>
          <span>Ambiente Executivo</span>
        </div>
      </div>
    </>
  );
};
