import React from 'react';
import { useGame } from '../context/GameContext';
import { RadarChart } from '../components/RadarChart';
import { products } from '../data/products';
import { generateRoundNewspaper } from '../engine/ssisEngine';
import { 
  Award, TrendingUp, MessageSquare, Newspaper, Percent, ChevronRight
} from 'lucide-react';

export const RoundResults: React.FC = () => {
  const { state, nextRound } = useGame();
  const { history, currentRound } = state;

  // Retrieve the results of the round just completed
  const currentResult = history[history.length - 1];

  if (!currentResult) {
    return <div>Carregando resultados...</div>;
  }

  const { playerMetrics, rivalA, rivalB, ssisFeedback, councilFeedback, event } = currentResult;

  // Format currencies
  const fmt = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }} className="animate-fade-in" role="main" aria-label={`Resultados da Rodada ${currentRound}`}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-pill badge-gold" style={{ marginBottom: '0.5rem' }}>Balanço Operacional</span>
        <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Resultados da Rodada {currentRound}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Relatório analítico de mercado e posicionamento estratégico</p>
      </div>

      {/* Financial Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {/* Revenue */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RECEITA OPERACIONAL</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
            {fmt(playerMetrics.revenue)}
          </div>
          <div style={{ height: '4px', background: 'var(--accent-blue)', position: 'absolute', bottom: 0, left: 0, right: 0 }} />
        </div>

        {/* Costs */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CUSTOS E INVESTIMENTOS</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f3f4f6', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
            {fmt(playerMetrics.costs)}
          </div>
          <div style={{ height: '4px', background: 'var(--text-secondary)', position: 'absolute', bottom: 0, left: 0, right: 0 }} />
        </div>

        {/* Net Profit */}
        <div className="glass-panel" style={{ 
          padding: '1.5rem', 
          position: 'relative', 
          overflow: 'hidden',
          background: playerMetrics.profit >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LUCRO LÍQUIDO</span>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: playerMetrics.profit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', 
            marginTop: '0.25rem', 
            fontFamily: 'var(--font-display)' 
          }}>
            {playerMetrics.profit >= 0 ? '+' : ''}{fmt(playerMetrics.profit)}
          </div>
          <div style={{ 
            height: '4px', 
            background: playerMetrics.profit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0 
          }} />
        </div>

        {/* Cash position */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SALDO EM CAIXA</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
            {fmt(playerMetrics.cash)}
          </div>
          <div style={{ height: '4px', background: 'var(--accent-gold)', position: 'absolute', bottom: 0, left: 0, right: 0 }} />
        </div>
      </div>

      {/* Main Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem',
        marginBottom: '3rem'
      }} className="results-layout-grid">
        <style>{`
          @media (min-width: 1024px) {
            .results-layout-grid {
              grid-template-columns: 1fr 1.3fr !important;
            }
          }
        `}</style>

        {/* Left Column: Radar Chart and Products breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Radar Chart Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ color: 'var(--accent-gold)' }} /> Posicionamento de Radar
            </h3>
            
            <RadarChart
              playerData={{
                profit: playerMetrics.profit,
                reputation: playerMetrics.reputation,
                quality: playerMetrics.quality,
                innovation: playerMetrics.innovation,
                satisfaction: playerMetrics.satisfaction,
                share: playerMetrics.marketShare
              }}
              rivalAData={{
                profit: rivalA.profit,
                reputation: rivalA.reputation,
                quality: rivalA.quality,
                innovation: rivalA.innovation,
                satisfaction: rivalA.satisfaction,
                share: rivalA.marketShare
              }}
              rivalBData={{
                profit: rivalB.profit,
                reputation: rivalB.reputation,
                quality: rivalB.quality,
                innovation: rivalB.innovation,
                satisfaction: rivalB.satisfaction,
                share: rivalB.marketShare
              }}
            />
          </div>

          {/* Product breakdown list */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Percent style={{ color: 'var(--accent-gold)' }} /> Desempenho de Vendas do Portfólio
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {playerMetrics.productResults.map((result) => {
                const prod = products.find(p => p.id === result.productId);
                const sellout = result.produced > 0 ? (result.sold / result.produced) * 100 : 0;
                
                return (
                  <div key={result.productId} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.04)', 
                    paddingBottom: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>{prod?.name}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Vendido: <strong style={{ color: '#fff' }}>{result.sold}</strong> / {result.produced} un.
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Demanda do Mercado: {result.demanded} un.</span>
                      <span style={{ color: sellout > 90 ? 'var(--accent-success)' : sellout < 50 ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>
                        Taxa de Conversão: {Math.round(sellout)}%
                      </span>
                    </div>

                    {result.stockRemaining > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#ffb3b3' }}>
                        Sobrou em estoque: {result.stockRemaining} unidades (Custo imobilizado: {fmt(result.stockRemaining * (prod?.productionCost || 0))})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: S.S.I.S Analysis, Council & Newspaper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* S.S.I.S feedback report */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award style={{ color: 'var(--accent-gold)' }} /> Parecer da IA Scorpio S.S.I.S.
              </h3>
              <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>IGE DE GESTÃO:</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.1rem' }}>{playerMetrics.ige}/100</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>DIAGNÓSTICO DA RODADA</strong>
                <p>{ssisFeedback.diagnostic}</p>
              </div>

              <div>
                <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>RECOMENDAÇÕES DA IA</strong>
                <p>{ssisFeedback.recommendation}</p>
              </div>

              <div>
                <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>PROJEÇÃO FUTURA (FORECAST)</strong>
                <p>{ssisFeedback.forecast}</p>
              </div>
            </div>

            {/* Pedagogical grades */}
            <div style={{ 
              marginTop: '1.75rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h4 style={{ fontSize: '0.85rem', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avaliação Pedagógica S.S.I.S</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Planning */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Planejamento</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>{ssisFeedback.pedagogicalGrade.planning}/10</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${ssisFeedback.pedagogicalGrade.planning * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                  </div>
                </div>

                {/* Finance */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Finanças</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>{ssisFeedback.pedagogicalGrade.finance}/10</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${ssisFeedback.pedagogicalGrade.finance * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                  </div>
                </div>

                {/* People */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gestão de Pessoas</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>{ssisFeedback.pedagogicalGrade.people}/10</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${ssisFeedback.pedagogicalGrade.people * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                  </div>
                </div>

                {/* Innovation */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Inovação Operacional</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>{ssisFeedback.pedagogicalGrade.innovation}/10</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${ssisFeedback.pedagogicalGrade.innovation * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Council Feedback */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare style={{ color: 'var(--accent-gold)' }} /> Parecer do Conselho de Administração
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
              {/* Sr. Rocha */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--accent-gold)' }}>
                    <strong>SR</strong>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem', fontWeight: 600 }}>FINANCEIRO</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white', marginBottom: '0.15rem' }}>Sr. Rocha <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Conservador)</span></h4>
                  <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{councilFeedback.rocha}"</p>
                </div>
              </div>

              {/* Dra. Luna */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#ff69b4' }}>
                    <strong>DL</strong>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem', fontWeight: 600 }}>MARKETING</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white', marginBottom: '0.15rem' }}>Dra. Luna <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Agressiva)</span></h4>
                  <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{councilFeedback.luna}"</p>
                </div>
              </div>

              {/* Eng. Vane */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--accent-blue)' }}>
                    <strong>EV</strong>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem', fontWeight: 600 }}>OPERAÇÕES</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white', marginBottom: '0.15rem' }}>Eng. Vane <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Pragmática)</span></h4>
                  <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{councilFeedback.vane}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newspaper Column */}
          <div className="glass-panel" style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '2px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              borderBottom: '1px double rgba(255,255,255,0.2)',
              paddingBottom: '0.5rem',
              marginBottom: '1rem' 
            }}>
              <Newspaper size={18} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ 
                fontFamily: 'serif', 
                fontSize: '0.9rem', 
                fontWeight: 'bold', 
                letterSpacing: '0.1em',
                color: 'var(--text-secondary)'
              }}>DIÁRIO COMERCIAL DA FECART</span>
            </div>
            <p style={{ 
              fontFamily: 'Georgia, serif', 
              fontSize: '0.95rem', 
              lineHeight: 1.6, 
              color: '#d1d5db',
              textAlign: 'justify'
            }}>
              {generateRoundNewspaper(history.length, playerMetrics, event, rivalA, rivalB)}
            </p>
          </div>

        </div>
      </div>

      {/* Button footer */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button onClick={nextRound} className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
          {history.length < 3 ? 'Avançar para a Próxima Rodada' : 'Ver Relatório Executivo Final'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
