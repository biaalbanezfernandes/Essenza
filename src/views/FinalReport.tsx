import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { classifyManagementProfile } from '../engine/ssisEngine';
import { 
  TrendingUp, RefreshCw, Send, CheckCircle, 
  Mail, Calendar, Download, Trophy
} from 'lucide-react';

export const FinalReport: React.FC = () => {
  const { state, resetGame } = useGame();
  const { history, playerName, playerEmail } = state;

  const [emailInput, setEmailInput] = useState(playerEmail || '');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success'>('idle');

  // Compute final statistics
  const profile = classifyManagementProfile(history);
  const finalCash = state.currentCash;
  
  const totalRevenue = history.reduce((acc, r) => acc + r.playerMetrics.revenue, 0);
  const totalProfit = history.reduce((acc, r) => acc + r.playerMetrics.profit, 0);
  
  const avgIge = Math.round(history.reduce((acc, r) => acc + r.playerMetrics.ige, 0) / history.length);
  
  const avgPlanning = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.planning, 0) / history.length) * 10) / 10;
  const avgFinance = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.finance, 0) / history.length) * 10) / 10;
  const avgPeople = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.people, 0) / history.length) * 10) / 10;
  const avgInnovation = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.innovation, 0) / history.length) * 10) / 10;

  // Format currency helper
  const fmt = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Handler for sending email (simulated API delay)
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    
    setSendingState('sending');
    setTimeout(() => {
      setSendingState('success');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="animate-fade-in" role="main" aria-label="Relatório Executivo Final">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #print-area {
            border: 4px double #d4af37 !important;
            background: white !important;
            color: black !important;
            padding: 4rem !important;
            box-shadow: none !important;
            width: 100% !important;
            height: auto !important;
          }
          #print-area * {
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Title Header */}
      <div className="no-print" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-pill badge-gold" style={{ marginBottom: '0.5rem' }}>Simulação Finalizada</span>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Relatório Executivo Geral</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Análise consolidada das rodadas e certificação da Essenza</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem',
        marginBottom: '3rem'
      }} className="no-print desktop-report-grid">
        <style>{`
          @media (min-width: 768px) {
            .desktop-report-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>

        {/* Left Column: Management Profile and Performance summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'var(--accent-gold-glow)',
              color: 'var(--accent-gold)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.5rem'
            }}>
              {profile.emoji}
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seu Perfil de Gestão
            </span>
            <h2 style={{ fontSize: '2rem', color: 'white', fontFamily: 'var(--font-display)', margin: '0.25rem 0 1rem', fontWeight: 800 }}>
              {profile.profileName}
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              {profile.description}
            </p>
          </div>

          {/* Business Metrics Summary */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ color: 'var(--accent-gold)' }} /> Resultados Consolidados
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Faturamento Acumulado:</span>
                <strong style={{ color: 'white' }}>{fmt(totalRevenue)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lucro Líquido Acumulado:</span>
                <strong style={{ color: totalProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {fmt(totalProfit)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Saldo Final em Caixa:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{fmt(finalCash)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Média do Índice IGE:</span>
                <strong style={{ color: 'white' }}>{avgIge}/100</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pedagogical Grades card and Email sending */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pedagogical average grades */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy style={{ color: 'var(--accent-gold)' }} /> Avaliação Pedagógica Final
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Planning */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Planejamento de Demanda</span>
                  <strong style={{ color: 'white' }}>{avgPlanning} / 10</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgPlanning * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                </div>
              </div>

              {/* Finance */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gestão Financeira e Caixa</span>
                  <strong style={{ color: 'white' }}>{avgFinance} / 10</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgFinance * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                </div>
              </div>

              {/* People */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Liderança e Gestão de Pessoas</span>
                  <strong style={{ color: 'white' }}>{avgPeople} / 10</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgPeople * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                </div>
              </div>

              {/* Innovation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Inovação Operacional e Qualidade</span>
                  <strong style={{ color: 'white' }}>{avgInnovation} / 10</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgInnovation * 10}%`, height: '100%', background: 'var(--accent-gold)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Email certificate send block */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail style={{ color: 'var(--accent-gold)' }} /> Enviar Certificado Oficial
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Insira o e-mail para o envio digital imediato do seu certificado com o timbre oficial da simulação Essenza FECART.
            </p>

            {sendingState === 'idle' && (
              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-label="Formulário de envio de certificado">
                <label htmlFor="certificate-email" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                  E-mail para envio do certificado
                </label>
                <input
                  id="certificate-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Seu e-mail"
                  className="input-control"
                  required
                  aria-required="true"
                  autoComplete="email"
                />
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} aria-label="Enviar certificado por e-mail">
                  <Send size={18} /> Enviar por E-mail
                </button>
              </form>
            )}

            {sendingState === 'sending' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  border: '3px solid rgba(255,255,255,0.1)',
                  borderTop: '3px solid var(--accent-gold)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Despachando certificado oficial...</span>
              </div>
            )}

            {sendingState === 'success' && (
              <div className="animate-fade-in" style={{
                textAlign: 'center',
                padding: '1.5rem',
                border: '1px dashed var(--accent-success)',
                borderRadius: '8px',
                background: 'var(--accent-success-glow)'
              }}>
                <CheckCircle size={32} style={{ color: 'var(--accent-success)', marginBottom: '0.75rem' }} />
                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>E-mail Enviado!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  O certificado digital oficial foi emitido com sucesso e enviado para <strong>{emailInput}</strong>.
                </p>
                <button 
                  onClick={() => setSendingState('idle')} 
                  style={{ 
                    marginTop: '1rem', 
                    fontSize: '0.75rem', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--accent-gold)', 
                    cursor: 'pointer', 
                    textDecoration: 'underline' 
                  }}
                >
                  Enviar para outro endereço
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Certificate print area */}
      <div id="print-area" className="glass-panel" style={{
        padding: '3rem 2.5rem',
        border: '3px double var(--accent-gold)',
        borderRadius: '12px',
        background: 'rgba(10, 15, 29, 0.95)',
        boxShadow: '0 0 40px -10px var(--accent-gold-glow)',
        maxWidth: '800px',
        margin: '0 auto 3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Certificate Watermark background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.02,
          fontSize: '12rem',
          fontWeight: 900,
          fontFamily: 'serif',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          FECART
        </div>

        {/* Certificate content */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            border: '1.5px solid var(--accent-gold)',
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold)'
          }}>
            Certificado de Gestão Comercial
          </div>
        </div>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.25rem', fontStyle: 'italic', fontWeight: 'normal', color: '#fff', marginBottom: '1.5rem' }}>
          Certificado de Desempenho
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2rem' }}>
          Certificamos que <strong>{playerName || 'Beatriz Fernandes'}</strong> participou ativamente do simulador de negócios <strong>ESSENZA</strong> na feira científica <strong>FECART 2026</strong>. 
          Ao longo de 3 rodadas comerciais, comandou a empresa de moda casual atingindo o perfil de tomada de decisão classificado como:
        </p>

        <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', marginBottom: '2rem', fontWeight: 800 }}>
          {profile.profileName}
        </h3>

        {/* Grades Table inside certificate */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          margin: '0 auto 2.5rem',
          maxWidth: '500px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem 0'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Planejamento</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{avgPlanning}</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Finanças</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{avgFinance}</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Pessoas</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{avgPeople}</strong>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Inovação</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{avgInnovation}</strong>
          </div>
        </div>

        {/* Signature stamp segment */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', width: '150px', marginBottom: '0.35rem' }} />
            <span>Assinatura do Avaliador</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Calendar size={18} style={{ color: 'var(--accent-gold)', marginBottom: '0.2rem' }} />
            <span>São Paulo, 2026</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', width: '150px', marginBottom: '0.35rem' }} />
            <span>Comissão de Ciências FECART</span>
          </div>
        </div>
      </div>

      {/* Print and Reset Buttons */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <button onClick={handlePrint} className="btn-secondary" style={{ padding: '1rem 2.5rem' }} aria-label="Imprimir certificado">
          <Download size={18} /> Imprimir Certificado
        </button>

        <button onClick={resetGame} className="btn-primary" style={{ padding: '1rem 2.5rem' }} aria-label="Jogar novamente">
          <RefreshCw size={18} /> Jogar Novamente
        </button>
      </div>

    </div>
  );
};
