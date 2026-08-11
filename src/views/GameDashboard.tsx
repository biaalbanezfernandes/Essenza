import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { products } from '../data/products';
import type { PlayerDecision } from '../data/types';
import { InlineTutorialCallout, tutorialSteps } from '../components/TutorialTourModal';
import { 
  TrendingUp, Award, Zap, Heart, Settings, 
  DollarSign, AlertTriangle, HelpCircle, ArrowRight, Info,
  BookOpen, GraduationCap
} from 'lucide-react';

export const GameDashboard: React.FC = () => {
  const { state, updatePendingDecision, submitRoundDecision } = useGame();
  
  // Destructure state values
  const { currentRound, currentCash, reputation, quality, innovation, satisfaction, efficiency, marketShare, activeEvent, pendingDecision } = state;

  // Local state for tutorial tour (5 steps)
  const [isTutorialOpen, setIsTutorialOpen] = useState(currentRound === 1);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  // Local state to track contextual help popovers
  const [activeHelpPopover, setActiveHelpPopover] = useState<string | null>(null);

  // Local state to track validation errors
  const [cashError, setCashError] = useState('');
  
  // Calculate total investment sum live
  const totalInvestments = 
    pendingDecision.investments.materials + 
    pendingDecision.investments.production + 
    pendingDecision.investments.marketing + 
    pendingDecision.investments.logistics;

  // Calculate live capacity requirements
  const rawMaterialRequired = products.reduce((acc, p) => {
    const qty = pendingDecision.productionQty[p.id] || 0;
    return acc + (qty * p.productionCost * 0.5);
  }, 0);

  const laborRequired = products.reduce((acc, p) => {
    const qty = pendingDecision.productionQty[p.id] || 0;
    return acc + (qty * p.productionCost * 0.5);
  }, 0);

  const remainingCashLive = currentCash - totalInvestments;

  // Validate cash limit
  useEffect(() => {
    if (totalInvestments > currentCash) {
      setCashError(`Orçamento excedido! Você alocou R$ ${totalInvestments.toLocaleString('pt-BR')} mas possui apenas R$ ${currentCash.toLocaleString('pt-BR')} em caixa.`);
    } else {
      setCashError('');
    }
  }, [totalInvestments, currentCash]);

  // Handlers for investment inputs
  const handleInvestmentChange = (area: keyof PlayerDecision['investments'], value: number) => {
    const cleanValue = Math.max(0, isNaN(value) ? 0 : value);
    updatePendingDecision((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        [area]: cleanValue
      }
    }));
  };

  // Handlers for product price inputs
  const handlePriceChange = (productId: string, value: number) => {
    const cleanValue = Math.max(1, isNaN(value) ? 1 : value);
    updatePendingDecision((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [productId]: cleanValue
      }
    }));
  };

  // Handlers for product production inputs
  const handleProductionQtyChange = (productId: string, value: number) => {
    const cleanValue = Math.max(0, isNaN(value) ? 0 : value);
    updatePendingDecision((prev) => ({
      ...prev,
      productionQty: {
        ...prev.productionQty,
        [productId]: cleanValue
      }
    }));
  };

  // Generate dynamic, context-aware pre-round advice from Scorpio AI S.S.I.S
  const getLiveSsisAdvice = () => {
    if (totalInvestments > currentCash) {
      return {
        type: 'danger',
        message: 'Aviso crítico: Os investimentos ultrapassam seu saldo de caixa. Reduza os investimentos para processar a rodada.'
      };
    }

    // Check if any product price is below production cost
    for (const p of products) {
      const price = pendingDecision.prices[p.id] || p.defaultPrice;
      const qty = pendingDecision.productionQty[p.id] || 0;
      if (qty > 0 && price < p.productionCost) {
        return {
          type: 'danger',
          message: `Erro Comercial: O preço definido para o/a ${p.name} (R$ ${price.toFixed(2)}) é inferior ao custo de produção unitário (R$ ${p.productionCost.toFixed(2)}). Você terá prejuízo em cada venda!`
        };
      }
    }

    if (pendingDecision.investments.materials < rawMaterialRequired && rawMaterialRequired > 0) {
      return {
        type: 'warning',
        message: `Gargalo operacional: Seu investimento em Matéria-Prima (R$ ${pendingDecision.investments.materials.toLocaleString('pt-BR')}) é insuficiente para produzir as peças configuradas (necessário R$ ${rawMaterialRequired.toLocaleString('pt-BR')}). A fábrica operará com menor capacidade.`
      };
    }
    if (pendingDecision.investments.production < laborRequired && laborRequired > 0) {
      return {
        type: 'warning',
        message: `Gargalo operacional: Seu investimento em Produção e Salários (R$ ${pendingDecision.investments.production.toLocaleString('pt-BR')}) é insuficiente para a escala produtiva desejada (necessário R$ ${laborRequired.toLocaleString('pt-BR')}).`
      };
    }

    // Check seasonality mismatches
    if (currentRound === 1) {
      const vestidoQty = pendingDecision.productionQty['vestido_linho'] || 0;
      if (vestidoQty > 300) {
        return {
          type: 'warning',
          message: 'Aviso de Temporada: O Vestido Linho tem baixa demanda no outono/inverno (Rodada 1). Reduza a produção para evitar encalhar estoque.'
        };
      }
    } else if (currentRound === 2) {
      const vestidoQty = pendingDecision.productionQty['vestido_linho'] || 0;
      const moletomQty = pendingDecision.productionQty['moletom'] || 0;
      if (vestidoQty > 200) {
        return {
          type: 'warning',
          message: 'Alerta de Temporada: Estamos no auge do Inverno (Rodada 2). A demanda por Vestidos de Linho está reduzida pela metade. Redirecione os recursos para Moletons!'
        };
      }
      if (moletomQty > 0 && moletomQty < 500) {
        return {
          type: 'info',
          message: 'Dica de Temporada: A demanda de Moletons está multiplicada por 2.2x no Inverno (Rodada 2). Produza uma quantidade maior para aproveitar este pico de vendas.'
        };
      }
    } else if (currentRound === 3) {
      const moletomQty = pendingDecision.productionQty['moletom'] || 0;
      const vestidoQty = pendingDecision.productionQty['vestido_linho'] || 0;
      if (moletomQty > 200) {
        return {
          type: 'warning',
          message: 'Alerta de Temporada: Estamos no Verão (Rodada 3). A demanda de Moletons despencou. Reduza drasticamente a produção para evitar prejuízo com estoque parado.'
        };
      }
      if (vestidoQty > 0 && vestidoQty < 600) {
        return {
          type: 'info',
          message: 'Dica de Temporada: Vestido Linho tem demanda multiplicada por 2.4x no Verão (Rodada 3). Aproveite para programar uma produção maior deste item.'
        };
      }
    }

    // Check if pricing is abnormally high without reputation
    let pricingHighProduct = '';
    let pricingHighVal = 0;
    products.forEach(p => {
      const price = pendingDecision.prices[p.id] || p.defaultPrice;
      if (price > p.defaultPrice * 1.35) {
        pricingHighProduct = p.name;
        pricingHighVal = price;
      }
    });

    if (pricingHighProduct && reputation < 55) {
      return {
        type: 'warning',
        message: `Risco de Rejeição: O preço de R$ ${pricingHighVal.toFixed(2)} para ${pricingHighProduct} está muito elevado para a reputação atual da marca (${Math.round(reputation)} pontos). Aumente o Marketing ou reduza o preço para evitar que os clientes comprem do concorrente.`
      };
    }

    // Logistics bottleneck
    const totalQty = products.reduce((acc, p) => acc + (pendingDecision.productionQty[p.id] || 0), 0);
    if (totalQty > 3000 && pendingDecision.investments.logistics < 25000) {
      return {
        type: 'warning',
        message: `Logística Estrangulada: Você planeja produzir ${totalQty} peças, mas investiu menos de R$ 25.000 em Logística. Isso gerará lentidão na entrega e queda na eficiência de vendas.`
      };
    }

    // Unfocused production
    const activeProductsCount = products.filter(p => (pendingDecision.productionQty[p.id] || 0) > 0).length;
    if (activeProductsCount > 4) {
      return {
        type: 'info',
        message: 'Foco Pulverizado: Você está fabricando 5 ou mais produtos simultaneamente. Focar em 2 ou 3 itens mais rentáveis ou sazonais costuma maximizar os lucros da Essenza.'
      };
    }

    if (pendingDecision.investments.marketing < 35000) {
      return {
        type: 'info',
        message: 'Recomendação de Marketing: Investimento em promoção muito modesto. Você pode perder quota de mercado para o Rival B (Premium).'
      };
    }

    return {
      type: 'success',
      message: 'Planejamento operacional equilibrado. O S.S.I.S. estima bom aproveitamento de mercado sob as diretrizes configuradas.'
    };
  };

  const ssisAdvice = getLiveSsisAdvice();

  // Load local training runs for this specific player
  let runsCount = 0;
  let bestProfitHistory = 0;
  try {
    const playerRunsKey = `essenza_cognitive_runs_${state.playerEmail}`;
    const historyRunsStr = localStorage.getItem(playerRunsKey);
    if (historyRunsStr) {
      const historyRuns = JSON.parse(historyRunsStr);
      runsCount = historyRuns.length;
      bestProfitHistory = Math.max(...historyRuns.map((r: any) => r.totalProfit || 0), 0);
    }
  } catch (err) {
    // Ignore
  }

  const togglePopover = (key: string) => {
    setActiveHelpPopover(prev => prev === key ? null : key);
  };

  const handleNextStep = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) {
      setTutorialStepIndex(prev => prev + 1);
    } else {
      setIsTutorialOpen(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (tutorialStepIndex > 0) {
      setTutorialStepIndex(prev => prev - 1);
    }
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }} className="animate-fade-in">

      {/* Top Banner for Phase 1 */}
      {currentRound === 1 && (
        <div className="glass-panel" style={{
          padding: '1.25rem 2rem',
          marginBottom: '2rem',
          borderLeft: '6px solid var(--accent-gold)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(13, 20, 38, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'var(--accent-gold-glow)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <GraduationCap size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge-pill badge-gold" style={{ fontSize: '0.65rem' }}>FASE 1 • OUTONO</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                  {isTutorialOpen ? 'Tutorial Guiado em 5 Passos' : 'Modo de Planejamento Livre'}
                </strong>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {isTutorialOpen 
                  ? 'Siga os 5 mini-passos para aprender como gerenciar a Essenza.' 
                  : 'Altere seus investimentos e preços à vontade. Clique em "Processar Rodada 1" no final da página apenas quando estiver pronto.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setTutorialStepIndex(0);
              setIsTutorialOpen(true);
            }}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <BookOpen size={18} /> {isTutorialOpen ? 'Reiniciar Tutorial' : 'Abrir Guia do Tutorial'}
          </button>
        </div>
      )}

      {/* Upper Bar: Title & Cash Status */}
      <div 
        id="tutorial-cash" 
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', transition: 'all 0.3s ease' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge-pill badge-gold" style={{ marginBottom: '0.5rem' }}>
              {currentRound === 1 ? 'Rodada 1 de 3 (Outono)' : `Rodada ${currentRound} de 3`}
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Sala de Planejamento Estratégico
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CAIXA ATUAL</span>
                <button 
                  onClick={() => togglePopover('cash')} 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex' }}
                  title="Ver dica do Caixa"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                R$ {currentCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '40px' }} />
            
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CAIXA PREVISTO</span>
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: 800, 
                color: remainingCashLive < 0 ? 'var(--accent-danger)' : 'var(--accent-success)', 
                fontFamily: 'var(--font-display)' 
              }}>
                R$ {remainingCashLive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Contextual Popover for Cash */}
            {activeHelpPopover === 'cash' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                width: '320px',
                background: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '12px',
                padding: '1rem',
                zIndex: 200,
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                fontSize: '0.8rem',
                lineHeight: 1.4
              }}>
                <strong style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '0.3rem' }}>💡 Dica do Caixa:</strong>
                <p style={{ color: '#fff', margin: 0 }}>
                  O <strong>Caixa Atual</strong> é o seu dinheiro no banco. O <strong>Caixa Previsto</strong> é o valor que sobra após os 4 investimentos. Se ficar vermelho, ajuste os valores para poder avançar!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STEP 0 (PASSO 1 DE 5: CAIXA) INLINE TUTORIAL CALLOUT */}
        {isTutorialOpen && tutorialStepIndex === 0 && (
          <InlineTutorialCallout
            stepIndex={0}
            totalSteps={5}
            step={tutorialSteps[0]}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onClose={handleCloseTutorial}
          />
        )}
      </div>

      {/* Event Alert Panel */}
      {activeEvent && (
        <div 
          id="tutorial-event"
          className="glass-panel" 
          style={{
            padding: '1.25rem 2rem', 
            marginBottom: '2rem', 
            borderLeft: `5px solid ${activeEvent.type === 'positive' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
            background: activeEvent.type === 'positive' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge-pill ${activeEvent.type === 'positive' ? 'badge-success' : 'badge-danger'}`}>
                Evento de Mercado: {activeEvent.type === 'positive' ? 'Positivo' : 'Adverso'}
              </span>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>{activeEvent.title}</strong>
            </div>

            <button 
              onClick={() => togglePopover('event')} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
            >
              <HelpCircle size={14} /> Dica de Notícias
            </button>
          </div>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {activeEvent.description} <span style={{ color: 'var(--accent-gold)' }}>Área afetada: {activeEvent.affectedArea} ({activeEvent.multiplier}x)</span>.
          </p>

          {/* Contextual Popover for Event */}
          {activeHelpPopover === 'event' && (
            <div style={{
              marginTop: '0.75rem',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: '#fff'
            }}>
              💡 <strong>Notícia da estação:</strong> Eventos alteram vendas ou custos temporariamente. Ajuste sua estratégia para aproveitar ou economizar!
            </div>
          )}
        </div>
      )}

      {/* Permanent Metrics Panel */}
      <div 
        id="tutorial-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>REPUTAÇÃO</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Award size={18} /> {Math.round(reputation)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>QUALIDADE</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Zap size={18} /> {Math.round(quality)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>INOVAÇÃO</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <HelpCircle size={18} /> {Math.round(innovation)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>SATISFAÇÃO TI</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Heart size={18} /> {Math.round(satisfaction)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>EFICIÊNCIA</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Settings size={18} /> {Math.round(efficiency)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>MARKET SHARE</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <TrendingUp size={18} /> {Math.round(marketShare * 100)}%
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }} className="desktop-layout-grid">
        <style>{`
          @media (min-width: 1024px) {
            .desktop-layout-grid {
              grid-template-columns: 1.1fr 1.9fr !important;
            }
          }
        `}</style>

        {/* Section 1: Financial Allocation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Investment Sliders Panel */}
          <div 
            id="tutorial-investments"
            className="glass-panel" 
            style={{ padding: '2rem', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
                <DollarSign style={{ color: 'var(--accent-gold)' }} /> Alocação de Investimentos
              </h3>
              <button 
                onClick={() => togglePopover('investments')} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
              >
                <HelpCircle size={14} /> Dica de Investimento
              </button>
            </div>

            {/* STEP 1 (PASSO 2 DE 5: INVESTIMENTOS) INLINE TUTORIAL CALLOUT */}
            {isTutorialOpen && tutorialStepIndex === 1 && (
              <InlineTutorialCallout
                stepIndex={1}
                totalSteps={5}
                step={tutorialSteps[1]}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                onClose={handleCloseTutorial}
              />
            )}

            {/* Contextual Popover for Investments */}
            {activeHelpPopover === 'investments' && (
              <div style={{
                marginBottom: '1rem',
                background: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                fontSize: '0.8rem',
                color: '#fff',
                lineHeight: 1.45
              }}>
                <strong>💡 O que mexer aqui?</strong> Arraste os 4 sliders para distribuir sua verba. Se você programar a produção de muitas roupas mas investir pouco em Matéria-Prima ou Produção, a fábrica vai travar e você produzirá menos!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Materials */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>1. Matéria-Prima</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>R$ {pendingDecision.investments.materials.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={pendingDecision.investments.materials}
                  onChange={(e) => handleInvestmentChange('materials', parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-gold)', width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compra tecidos e insumos têxteis base.</span>
              </div>

              {/* Production */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>2. Produção e Salários</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>R$ {pendingDecision.investments.production.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={pendingDecision.investments.production}
                  onChange={(e) => handleInvestmentChange('production', parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-gold)', width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Capacidade fabril, turnos e remuneração da equipe.</span>
              </div>

              {/* Marketing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>3. Marketing Comercial</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>R$ {pendingDecision.investments.marketing.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={pendingDecision.investments.marketing}
                  onChange={(e) => handleInvestmentChange('marketing', parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-gold)', width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Anúncios digitais, editoriais de moda e captação de clientes.</span>
              </div>

              {/* Logistics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>4. Logística e Inovação</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>R$ {pendingDecision.investments.logistics.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={pendingDecision.investments.logistics}
                  onChange={(e) => handleInvestmentChange('logistics', parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent-gold)', width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Otimização logística de frete e inovação em fibras.</span>
              </div>
            </div>
          </div>

          {/* Scorpio AI S.S.I.S live Assistant & Cognitive Brain box */}
          <div id="tutorial-ssis" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{
              padding: '1.5rem',
              borderLeft: `4px solid ${
                ssisAdvice.type === 'danger' ? 'var(--accent-danger)' : 
                ssisAdvice.type === 'warning' ? 'var(--accent-danger)' :
                ssisAdvice.type === 'success' ? 'var(--accent-success)' : 'var(--accent-blue)'
              }`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge-pill badge-gold" style={{ fontSize: '0.65rem' }}>S.S.I.S. ASSISTENTE</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>Análise Preventiva em Tempo Real</span>
                </div>
                <button 
                  onClick={() => togglePopover('ssis')} 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                >
                  <HelpCircle size={14} /> Entender Dicas
                </button>
              </div>

              {/* STEP 3 (PASSO 4 DE 5: ROBÔ SSIS) INLINE TUTORIAL CALLOUT */}
              {isTutorialOpen && tutorialStepIndex === 3 && (
                <InlineTutorialCallout
                  stepIndex={3}
                  totalSteps={5}
                  step={tutorialSteps[3]}
                  onNext={handleNextStep}
                  onPrev={handlePrevStep}
                  onClose={handleCloseTutorial}
                />
              )}

              {activeHelpPopover === 'ssis' && (
                <div style={{
                  marginBottom: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.98)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#fff'
                }}>
                  💡 <strong>O que o robô faz?</strong> Ele monitora todas as suas edições de preço, lotes e investimentos instantaneamente. Se a caixa estiver vermelha ou amarela, leia o conselho e corrija antes de enviar!
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Info size={16} style={{ marginTop: '0.15rem', color: 'var(--accent-gold)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {ssisAdvice.message}
                </p>
              </div>
            </div>

            {/* Scorpio AI Cognitive Training Panel */}
            <div className="glass-panel" style={{
              padding: '1.5rem',
              borderLeft: '4px solid var(--accent-gold)',
              background: 'rgba(212, 175, 55, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge-pill badge-gold" style={{ fontSize: '0.65rem', background: 'var(--accent-gold)', color: '#000' }}>COGNITIVE BRAIN</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>Treinamento do Modelo Local</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                {runsCount > 0 ? (
                  <span>
                    <strong>Status:</strong> IA Treinada com <strong>{runsCount}</strong> simulações passadas. <br/>
                    <strong>Recorde de Lucro Registrado:</strong> R$ {bestProfitHistory.toLocaleString('pt-BR')}.
                  </span>
                ) : (
                  <span>
                    <strong>Status:</strong> Coletando Dados de Entrada... <br/>
                    A IA local aprenderá padrões de mercado e correlações assim que você finalizar sua primeira simulação.
                  </span>
                )}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                <strong>Correlação Aprendida:</strong> {
                  runsCount === 0 ? "Aguardando conclusão do ciclo inicial de treinamento." :
                  runsCount % 3 === 0 ? "Alta correlação detectada: Focar a produção em Moletons no inverno (Rodada 2) e Vestidos no verão (Rodada 3) eleva o faturamento médio em 2.2x." :
                  runsCount % 3 === 1 ? "Eficiência Fabril: Investir mais de R$ 50k em Produção reduz o desperdício de matéria-prima e eleva a satisfação dos funcionários em até 30%." :
                  "Reputação da Grife: Campanhas de Marketing de R$ 80k+ na rodada inicial estabilizam a captação de clientes contra o Rival B (Premium)."
                }
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Products Mix, Price and Qty */}
        <div 
          id="tutorial-products"
          className="glass-panel" 
          style={{ padding: '2rem', overflowX: 'auto', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings style={{ color: 'var(--accent-gold)' }} /> Mix de Produtos e Lotes
            </h3>
            <button 
              onClick={() => togglePopover('products')} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
            >
              <HelpCircle size={14} /> Dica de Produtos
            </button>
          </div>

          {/* STEP 2 (PASSO 3 DE 5: PRODUTOS) INLINE TUTORIAL CALLOUT */}
          {isTutorialOpen && tutorialStepIndex === 2 && (
            <InlineTutorialCallout
              stepIndex={2}
              totalSteps={5}
              step={tutorialSteps[2]}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              onClose={handleCloseTutorial}
            />
          )}

          {activeHelpPopover === 'products' && (
            <div style={{
              marginBottom: '1rem',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              fontSize: '0.8rem',
              color: '#fff',
              lineHeight: 1.45
            }}>
              💡 <strong>Como mexer aqui?</strong> Altere os campos de <strong>Preço (R$)</strong> e <strong>Qtd. Produzir</strong>. Atenção ao custo de produção e à sazonalidade! Fique atento também às barras de uso de insumos no rodapé desta tabela.
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Produto</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Custo Prod.</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Sazonalidade</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Preço Venda (R$)</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Qtd. Produzir</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const price = pendingDecision.prices[product.id] || product.defaultPrice;
                const qty = pendingDecision.productionQty[product.id] || 0;
                
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <strong style={{ color: 'white', display: 'block' }}>{product.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.description}</span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                      R$ {product.productionCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`badge-pill ${
                        product.seasonality === 'Inverno' ? 'badge-blue' :
                        product.seasonality === 'Verão' ? 'badge-gold' : 'badge-gold'
                      }`} style={{ fontSize: '0.65rem', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        {product.seasonality}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>R$</span>
                        <input
                          type="number"
                          value={price}
                          step="1"
                          onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value))}
                          style={{
                            width: '80px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            color: 'white',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '4px',
                            textAlign: 'right'
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <input
                        type="number"
                        value={qty}
                        step="100"
                        onChange={(e) => handleProductionQtyChange(product.id, parseInt(e.target.value))}
                        style={{
                          width: '90px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          color: 'white',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '4px',
                          textAlign: 'right'
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Allocation usage meters */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '2rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap'
          }}>
            {/* Raw material pool utilization */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Uso de Matéria-Prima:</span>
                <span style={{ 
                  color: rawMaterialRequired > pendingDecision.investments.materials ? 'var(--accent-danger)' : 'var(--text-primary)',
                  fontWeight: 600
                }}>
                  R$ {rawMaterialRequired.toLocaleString('pt-BR')} / R$ {pendingDecision.investments.materials.toLocaleString('pt-BR')}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, pendingDecision.investments.materials > 0 ? (rawMaterialRequired / pendingDecision.investments.materials) * 100 : 0)}%`,
                  height: '100%',
                  background: rawMaterialRequired > pendingDecision.investments.materials ? 'var(--accent-danger)' : 'var(--accent-gold)'
                }} />
              </div>
            </div>

            {/* Production Labor pool utilization */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Uso de Mão de Obra / Máquinas:</span>
                <span style={{ 
                  color: laborRequired > pendingDecision.investments.production ? 'var(--accent-danger)' : 'var(--text-primary)',
                  fontWeight: 600
                }}>
                  R$ {laborRequired.toLocaleString('pt-BR')} / R$ {pendingDecision.investments.production.toLocaleString('pt-BR')}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, pendingDecision.investments.production > 0 ? (laborRequired / pendingDecision.investments.production) * 100 : 0)}%`,
                  height: '100%',
                  background: laborRequired > pendingDecision.investments.production ? 'var(--accent-danger)' : 'var(--accent-blue)'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Submit button bar */}
      <div 
        id="tutorial-submit"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
      >
        {/* STEP 4 (PASSO 5 DE 5: MODO LIVRE / ENVIO) INLINE TUTORIAL CALLOUT */}
        {isTutorialOpen && tutorialStepIndex === 4 && (
          <InlineTutorialCallout
            stepIndex={4}
            totalSteps={5}
            step={tutorialSteps[4]}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onClose={handleCloseTutorial}
          />
        )}

        {cashError && (
          <div className="glass-panel" style={{
            padding: '1rem 2rem',
            border: '1px solid var(--accent-danger)',
            background: 'var(--accent-danger-glow)',
            color: '#ff8a8a',
            fontSize: '0.9rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={18} /> {cashError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
          <button 
            onClick={submitRoundDecision} 
            disabled={totalInvestments > currentCash || totalInvestments <= 0}
            className="btn-primary" 
            style={{ 
              padding: '1.2rem 3.5rem', 
              fontSize: '1.1rem',
              opacity: (totalInvestments > currentCash || totalInvestments <= 0) ? 0.4 : 1,
              cursor: (totalInvestments > currentCash || totalInvestments <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {currentRound === 1 ? 'Processar Rodada 1' : `Processar Rodada ${currentRound}`} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
