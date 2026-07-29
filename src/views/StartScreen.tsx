import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Mail, User, BookOpen, Cpu, ChevronRight, ChevronLeft, Play } from 'lucide-react';

const briefingSlides = [
  {
    label: 'A MISSÃO',
    icon: '🏭',
    title: 'Bem-vindo à Essenza',
    body: `Você acaba de ser nomeado CEO da Essenza, uma grife de moda casual brasileira em ascensão. A empresa tem potencial para dominar o mercado nacional — mas a concorrência é feroz e o mercado é imprevisível.\n\nSua missão começa agora.`
  },
  {
    label: 'O CENÁRIO',
    icon: '📊',
    title: 'O Mercado em Disputa',
    body: `Dois rivais poderosos disputam os mesmos clientes:\n\n⚔️ Rival A — aposta em volume e preço baixo, inundando o mercado.\n\n💎 Rival B — marca premium com marketing agressivo e preços elevados.\n\nA Essenza precisa encontrar sua própria estratégia para sobreviver e crescer.`
  },
  {
    label: 'AS RODADAS',
    icon: '🗓️',
    title: '3 Rodadas, 3 Estações',
    body: `A simulação cobre 3 temporadas diferentes:\n\n🍂 Rodada 1 — Outono. Estabilize a empresa.\n❄️ Rodada 2 — Inverno. Alta demanda por peças térmicas.\n☀️ Rodada 3 — Verão. A coleção leve é sua maior aposta.\n\nCada estação muda completamente o comportamento do consumidor. Planeje com antecedência!`
  },
  {
    label: 'SUAS DECISÕES',
    icon: '💡',
    title: 'O Que Você Vai Decidir',
    body: `A cada rodada, você define:\n\n💰 Quanto investir em Matéria-Prima, Produção, Marketing e Logística.\n🏷️ O preço de venda de cada produto da coleção.\n📦 Quantas peças produzir de cada item.\n\nErre no estoque e o caixa sangra. Acerte na temporada e a receita explode.`
  },
  {
    label: 'A IA S.S.I.S.',
    icon: '🤖',
    title: 'Seu Consultor de IA',
    body: `A Inteligência Artificial S.S.I.S. (Sistema de Suporte Inteligente de Simulação) estará do seu lado em cada rodada:\n\n⚡ Avisos em tempo real enquanto você planeja.\n📋 Diagnóstico detalhado dos seus resultados.\n📈 Comparações com seus jogos anteriores para ajudar você a evoluir.\n\nO Conselho de Diretores também avaliará suas decisões. Prepare-se para críticas diretas!`
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
          background: 'rgba(0,0,0,0.87)',
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
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 0 100px rgba(212,175,55,0.18)',
          }} className="animate-fade-in">

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge-pill badge-gold" style={{ fontSize: '0.65rem' }}>{slide.label}</span>
              <span style={{ fontSize: '1.5rem' }}>{slide.icon}</span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.75rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              marginBottom: '1.25rem',
              color: 'white'
            }}>
              {slide.title}
            </h2>

            {/* Body */}
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              minHeight: '165px'
            }}>
              {slide.body}
            </p>

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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  background: 'var(--accent-blue-glow)',
                  color: 'var(--accent-blue)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <strong>1</strong>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Gestão de Recursos</h4>
                  <p style={{ fontSize: '0.9rem' }}>
                    Você assume a liderança da Essenza com um capital de <strong>R$ 500.000,00</strong>. Em cada uma das <strong>3 rodadas</strong>, aloque verbas em 4 áreas estratégicas: Matéria-Prima, Produção, Marketing e Logística.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  background: 'var(--accent-gold-glow)',
                  color: 'var(--accent-gold)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <strong>2</strong>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Ajuste de Mix e Preço</h4>
                  <p style={{ fontSize: '0.9rem' }}>
                    Defina a quantidade de produção e o preço de venda para <strong>6 produtos exclusivos</strong> de moda casual. Cuidado para não produzir além da matéria-prima comprada ou da capacidade de maquinário contratada!
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  background: 'var(--accent-success-glow)',
                  color: 'var(--accent-success)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <strong>3</strong>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>A Inteligência S.S.I.S.</h4>
                  <p style={{ fontSize: '0.9rem' }}>
                    O sistema de IA analisará suas escolhas preventivamente e gerará diagnósticos profundos ao fim de cada rodada. O Conselho Administrativo também dará feedbacks corporativos baseados em despesas e vendas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Ficha Cadastral do Gestor</h3>
            <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Insira seus dados executivos para abrir sua sala de controle e receber o certificado ao término.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} /> Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Beatriz Fernandes"
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
          <span>Ambiente Premium</span>
        </div>
      </div>
    </>
  );
};
