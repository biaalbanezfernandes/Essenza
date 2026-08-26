import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { products } from '../data/products';
import type { PlayerDecision } from '../data/types';
import { MicroTooltip, tutorialSteps } from '../components/TutorialTourModal';
import { RoundTimer } from '../components/RoundTimer';
import { NpcPopup } from '../components/NpcPopup';
import { 
  TrendingUp, Award, Zap, Heart, Settings, 
  DollarSign, AlertTriangle, ArrowRight,
  BookOpen
} from 'lucide-react';

export const GameDashboard: React.FC = () => {
  const { state, updatePendingDecision, submitRoundDecision } = useGame();
  const { currentRound, currentCash, reputation, quality, innovation, satisfaction, efficiency, marketShare, activeEvent, pendingDecision } = state;

  // Local state for tutorial tour
  const [isTutorialOpen, setIsTutorialOpen] = useState(currentRound === 1);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

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
      setCashError(`Orçamento excedido! Alocado: R$ ${totalInvestments.toLocaleString('pt-BR')} | Caixa: R$ ${currentCash.toLocaleString('pt-BR')}.`);
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

  // Generate dynamic, context-aware pre-round advice from Scorpio AI S.S.I.S (Ultra-Condensed 1-line)
  const getLiveSsisAdvice = () => {
    if (totalInvestments > currentCash) {
      return {
        type: 'danger',
        message: 'Aviso Crítico: Investimentos excedem seu caixa. Reduza os aportes.'
      };
    }

    for (const p of products) {
      const price = pendingDecision.prices[p.id] || p.defaultPrice;
      const qty = pendingDecision.productionQty[p.id] || 0;
      if (qty > 0 && price < p.productionCost) {
        return {
          type: 'danger',
          message: `Preço Inválido: ${p.name} (R$ ${price.toFixed(2)}) abaixo do custo (R$ ${p.productionCost.toFixed(2)}).`
        };
      }
    }

    if (pendingDecision.investments.materials < rawMaterialRequired && rawMaterialRequired > 0) {
      return {
        type: 'warning',
        message: `Gargalo Têxtil: Matéria-Prima (R$ ${pendingDecision.investments.materials.toLocaleString('pt-BR')}) insuficiente para o lote (necessário R$ ${rawMaterialRequired.toLocaleString('pt-BR')}).`
      };
    }
    if (pendingDecision.investments.production < laborRequired && laborRequired > 0) {
      return {
        type: 'warning',
        message: `Gargalo Fabril: Mão de Obra (R$ ${pendingDecision.investments.production.toLocaleString('pt-BR')}) insuficiente (necessário R$ ${laborRequired.toLocaleString('pt-BR')}).`
      };
    }

    if (currentRound === 1) {
      const vestidoQty = pendingDecision.productionQty['vestido_linho'] || 0;
      if (vestidoQty > 300) {
        return {
          type: 'warning',
          message: 'Dica Outono: Procura por Vestido Linho está baixa. Reduza a quantidade.'
        };
      }
    } else if (currentRound === 2) {
      const vestidoQty = pendingDecision.productionQty['vestido_linho'] || 0;
      const moletomQty = pendingDecision.productionQty['moletom'] || 0;
      if (vestidoQty > 200) {
        return {
          type: 'warning',
          message: 'Alerta Inverno: Vestidos têm baixa procura. Priorize Moletons!'
        };
      }
      if (moletomQty > 0 && moletomQty < 500) {
        return {
          type: 'info',
          message: 'Pico de Inverno: Moletons com demanda 2.2x. Aumente o lote para lucrar mais.'
        };
      }
    } else if (currentRound === 3) {
      const moletomQty = pendingDecision.productionQty['moletom'] || 0;
      const vestidoQty = pendingDecision.productionQty['vestido_linho'] || 0;
      if (moletomQty > 200) {
        return {
          type: 'warning',
          message: 'Alerta Verão: Moletons em queda. Reduza para não sobrar estoque.'
        };
      }
      if (vestidoQty > 0 && vestidoQty < 600) {
        return {
          type: 'info',
          message: 'Pico de Verão: Vestido Linho com demanda 2.4x. Aproveite o momento!'
        };
      }
    }

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
        message: `Risco de Rejeição: R$ ${pricingHighVal.toFixed(2)} em ${pricingHighProduct} alto para sua reputação. Ajuste.`
      };
    }

    const totalQty = products.reduce((acc, p) => acc + (pendingDecision.productionQty[p.id] || 0), 0);
    if (totalQty > 3000 && pendingDecision.investments.logistics < 25000) {
      return {
        type: 'warning',
        message: `Logística Apertada: Produção de ${totalQty} peças exige mais verba em Logística.`
      };
    }

    if (pendingDecision.investments.marketing < 35000) {
      return {
        type: 'info',
        message: 'Dica de Marketing: Investimento modesto. Fortaleça a divulgação da marca.'
      };
    }

    return {
      type: 'success',
      message: 'Planejamento consistente: A IA Scorpio prevê boa rentabilidade para esta configuração.'
    };
  };

  const ssisAdvice = getLiveSsisAdvice();

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
    <div style={{ padding: '1.5rem 1.25rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      {/* Pop-up do Personagem Intruso Gigante em PNG (Apenas após concluir o tutorial) */}
      <NpcPopup currentRound={currentRound} disabled={isTutorialOpen} />

      {/* Top Header: Centered Big Timer and Round Badge */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.75rem'
      }}>
        {/* Round Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge-pill badge-gold" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
            {currentRound === 1 ? 'RODADA 1 • OUTONO' : currentRound === 2 ? 'RODADA 2 • INVERNO' : 'RODADA 3 • VERÃO'}
          </span>
          {currentRound === 1 && (
            <button
              onClick={() => {
                setTutorialStepIndex(0);
                setIsTutorialOpen(true);
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(212,175,55,0.4)',
                color: 'var(--accent-gold)',
                borderRadius: '999px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <BookOpen size={12} /> Guia Rápido
            </button>
          )}
        </div>

        {/* Big Centered Timer with Police Siren */}
        <div id="tutorial-timer-info">
          <RoundTimer currentRound={currentRound} onTimeUp={submitRoundDecision} />
        </div>
      </div>

      {/* Cash Overview & Active Event Ribbon */}
      <div 
        id="tutorial-cash"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Current Cash */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Caixa Atual
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              R$ {currentCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} />
          </div>
        </div>

        {/* Expected Cash */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Caixa Previsto (Após Gastos)
            </span>
            <div style={{ 
              fontSize: '1.4rem', 
              fontWeight: 800, 
              color: remainingCashLive < 0 ? 'var(--accent-danger)' : 'var(--accent-success)', 
              fontFamily: 'var(--font-display)' 
            }}>
              R$ {remainingCashLive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            background: remainingCashLive < 0 ? 'var(--accent-danger-glow)' : 'var(--accent-success-glow)', 
            color: remainingCashLive < 0 ? 'var(--accent-danger)' : 'var(--accent-success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Event Card if active */}
        {activeEvent && (
          <div className="glass-panel" style={{
            padding: '1rem 1.25rem',
            borderLeft: `4px solid ${activeEvent.type === 'positive' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
              <span className={`badge-pill ${activeEvent.type === 'positive' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                {activeEvent.title}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {activeEvent.description}
            </span>
          </div>
        )}
      </div>

      {/* Tutorial Callouts */}
      {isTutorialOpen && tutorialStepIndex === 0 && (
        <MicroTooltip stepIndex={0} step={tutorialSteps[0]} onNext={handleNextStep} onPrev={handlePrevStep} onClose={handleCloseTutorial} />
      )}
      {isTutorialOpen && tutorialStepIndex === 4 && (
        <MicroTooltip stepIndex={4} step={tutorialSteps[4]} onNext={handleNextStep} onPrev={handlePrevStep} onClose={handleCloseTutorial} />
      )}

      {/* Mini Metrics Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.75rem'
      }}>
        <div className="glass-panel" style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>REPUTAÇÃO</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-blue)' }}><Award size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Math.round(reputation)}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>QUALIDADE</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-gold)' }}><Zap size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Math.round(quality)}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>INOVAÇÃO</span>
          <strong style={{ fontSize: '1.1rem', color: '#3b82f6' }}>{Math.round(innovation)}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>SATISFAÇÃO</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-success)' }}><Heart size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Math.round(satisfaction)}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>EFICIÊNCIA</span>
          <strong style={{ fontSize: '1.1rem', color: '#fff' }}><Settings size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Math.round(efficiency)}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>MARKET SHARE</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--accent-gold)' }}><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Math.round(marketShare * 100)}%</strong>
        </div>
      </div>

      {/* Main Core Grid: 2 Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.75rem',
        marginBottom: '2rem'
      }} className="desktop-layout-grid">
        <style>{`
          @media (min-width: 1024px) {
            .desktop-layout-grid {
              grid-template-columns: 1fr 1.6fr !important;
            }
          }
        `}</style>

        {/* Left Column: Investments & SSIS AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Investments Card */}
          <div id="tutorial-investments" className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
              <DollarSign style={{ color: 'var(--accent-gold)' }} size={18} /> Orçamento & Investimentos
            </h3>

            {isTutorialOpen && tutorialStepIndex === 1 && (
              <MicroTooltip stepIndex={1} step={tutorialSteps[1]} onNext={handleNextStep} onPrev={handlePrevStep} onClose={handleCloseTutorial} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Materials */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>1. Matéria-Prima</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>R$ {pendingDecision.investments.materials.toLocaleString('pt-BR')}</strong>
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
              </div>

              {/* Production */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>2. Produção & Salários</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>R$ {pendingDecision.investments.production.toLocaleString('pt-BR')}</strong>
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
              </div>

              {/* Marketing */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>3. Marketing Comercial</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>R$ {pendingDecision.investments.marketing.toLocaleString('pt-BR')}</strong>
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
              </div>

              {/* Logistics */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>4. Logística & Inovação</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>R$ {pendingDecision.investments.logistics.toLocaleString('pt-BR')}</strong>
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
              </div>
            </div>

            {/* Insumos Meters */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Uso Matéria-Prima:</span>
                  <span style={{ color: rawMaterialRequired > pendingDecision.investments.materials ? 'var(--accent-danger)' : 'var(--text-primary)', fontWeight: 600 }}>
                    R$ {rawMaterialRequired.toLocaleString('pt-BR')} / R$ {pendingDecision.investments.materials.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(100, pendingDecision.investments.materials > 0 ? (rawMaterialRequired / pendingDecision.investments.materials) * 100 : 0)}%`,
                    height: '100%',
                    background: rawMaterialRequired > pendingDecision.investments.materials ? 'var(--accent-danger)' : 'var(--accent-gold)'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Uso Mão de Obra:</span>
                  <span style={{ color: laborRequired > pendingDecision.investments.production ? 'var(--accent-danger)' : 'var(--text-primary)', fontWeight: 600 }}>
                    R$ {laborRequired.toLocaleString('pt-BR')} / R$ {pendingDecision.investments.production.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(100, pendingDecision.investments.production > 0 ? (laborRequired / pendingDecision.investments.production) * 100 : 0)}%`,
                    height: '100%',
                    background: laborRequired > pendingDecision.investments.production ? 'var(--accent-danger)' : 'var(--accent-blue)'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Scorpio AI Quick Status */}
          <div id="tutorial-ssis" className="glass-panel" style={{
            padding: '1.25rem',
            borderLeft: `4px solid ${
              ssisAdvice.type === 'danger' ? 'var(--accent-danger)' : 
              ssisAdvice.type === 'warning' ? 'var(--accent-danger)' :
              ssisAdvice.type === 'success' ? 'var(--accent-success)' : 'var(--accent-blue)'
            }`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge-pill badge-gold" style={{ fontSize: '0.65rem' }}>IA SCORPIO</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>Análise em Tempo Real</span>
            </div>

            {isTutorialOpen && tutorialStepIndex === 3 && (
              <MicroTooltip stepIndex={3} step={tutorialSteps[3]} onNext={handleNextStep} onPrev={handlePrevStep} onClose={handleCloseTutorial} />
            )}

            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
              {ssisAdvice.message}
            </p>
          </div>
        </div>

        {/* Right Column: Products Table */}
        <div id="tutorial-products" className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings style={{ color: 'var(--accent-gold)' }} size={18} /> Mix de Produtos & Lotes
          </h3>

          {isTutorialOpen && tutorialStepIndex === 2 && (
            <MicroTooltip stepIndex={2} step={tutorialSteps[2]} onNext={handleNextStep} onPrev={handlePrevStep} onClose={handleCloseTutorial} />
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.5rem' }}>Peça</th>
                <th style={{ padding: '0.5rem' }}>Custo</th>
                <th style={{ padding: '0.5rem' }}>Estação</th>
                <th style={{ padding: '0.5rem' }}>Preço (R$)</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Qtd. Produzir</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const price = pendingDecision.prices[product.id] || product.defaultPrice;
                const qty = pendingDecision.productionQty[product.id] || 0;
                
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <strong style={{ color: 'white', display: 'block' }}>{product.name}</strong>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      R$ {product.productionCost.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge-pill badge-gold" style={{ fontSize: '0.62rem', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        {product.seasonality}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>R$</span>
                        <input
                          type="number"
                          value={price}
                          step="1"
                          onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value))}
                          style={{
                            width: '75px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            color: 'white',
                            padding: '0.25rem 0.4rem',
                            borderRadius: '4px',
                            textAlign: 'right',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <input
                        type="number"
                        value={qty}
                        step="100"
                        onChange={(e) => handleProductionQtyChange(product.id, parseInt(e.target.value))}
                        style={{
                          width: '85px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          color: 'white',
                          padding: '0.25rem 0.4rem',
                          borderRadius: '4px',
                          textAlign: 'right',
                          fontSize: '0.85rem'
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings & Submit button bar */}
      <div 
        id="tutorial-submit"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
      >
        {isTutorialOpen && tutorialStepIndex === 5 && (
          <MicroTooltip stepIndex={5} step={tutorialSteps[5]} onNext={handleNextStep} onPrev={handlePrevStep} onClose={handleCloseTutorial} />
        )}

        {cashError && (
          <div className="glass-panel" style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--accent-danger)',
            background: 'var(--accent-danger-glow)',
            color: '#ff8a8a',
            fontSize: '0.85rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={16} /> {cashError}
          </div>
        )}

        <button 
          onClick={submitRoundDecision} 
          disabled={totalInvestments > currentCash || totalInvestments <= 0}
          className="btn-primary" 
          style={{ 
            padding: '1rem 3.5rem', 
            fontSize: '1.1rem',
            opacity: (totalInvestments > currentCash || totalInvestments <= 0) ? 0.4 : 1,
            cursor: (totalInvestments > currentCash || totalInvestments <= 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {currentRound === 1 ? 'Processar Rodada 1' : `Processar Rodada ${currentRound}`} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
