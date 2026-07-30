import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { classifyManagementProfile } from '../engine/ssisEngine';
import emailjs from '@emailjs/browser';
import { 
  TrendingUp, RefreshCw, Send, CheckCircle, 
  Mail, Calendar, Download, Trophy, AlertCircle
} from 'lucide-react';

// ─── EmailJS CONFIG ──────────────────────────────────────────────────────────
// Crie uma conta gratuita em https://emailjs.com e preencha abaixo:
const EMAILJS_SERVICE_ID  = 'service_psjyr8r';   // Service ID
const EMAILJS_TEMPLATE_ID = 'template_essenza';  // Seu Template ID
const EMAILJS_PUBLIC_KEY  = '0KWHSmZLCrygDSvZl';    // Public Key
// ─────────────────────────────────────────────────────────────────────────────

export const FinalReport: React.FC = () => {
  const { state, resetGame } = useGame();
  const { history, playerName, playerEmail } = state;

  const [emailInput, setEmailInput] = useState(playerEmail || '');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Compute final statistics
  const profile = classifyManagementProfile(history);
  const finalCash = state.currentCash;
  
  const totalRevenue = history.reduce((acc, r) => acc + r.playerMetrics.revenue, 0);
  const totalProfit  = history.reduce((acc, r) => acc + r.playerMetrics.profit, 0);
  const avgIge       = Math.round(history.reduce((acc, r) => acc + r.playerMetrics.ige, 0) / history.length);

  const avgPlanning   = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.planning,   0) / history.length) * 10) / 10;
  const avgFinance    = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.finance,    0) / history.length) * 10) / 10;
  const avgPeople     = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.people,     0) / history.length) * 10) / 10;
  const avgInnovation = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.innovation, 0) / history.length) * 10) / 10;

  const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Envio REAL via EmailJS ──────────────────────────────────────────────────
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    setSendingState('sending');
    setErrorMsg('');

    const templateParams = {
      to_email:        emailInput,
      to_name:         playerName || 'Gestor(a)',
      profile_name:    profile.profileName,
      profile_desc:    profile.description,
      avg_planning:    String(avgPlanning),
      avg_finance:     String(avgFinance),
      avg_people:      String(avgPeople),
      avg_innovation:  String(avgInnovation),
      avg_ige:         String(avgIge),
      total_revenue:   fmt(totalRevenue),
      total_profit:    fmt(totalProfit),
      final_cash:      fmt(finalCash),
      issue_date:      today,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setSendingState('success');
    } catch (err) {
      console.error('EmailJS error:', err);
      setErrorMsg('Não foi possível enviar. Verifique a configuração do EmailJS.');
      setSendingState('error');
    }
  };

  const handlePrint = () => { window.print(); };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          #print-area {
            border: 4px double #d4af37 !important;
            background: white !important;
            color: black !important;
            padding: 4rem !important;
            box-shadow: none !important;
            width: 100% !important;
          }
          #print-area * { color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Title Header */}
      <div className="no-print" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-pill badge-gold" style={{ marginBottom: '0.5rem' }}>Simulação Finalizada</span>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Relatório Executivo Geral</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Análise consolidada das rodadas e certificação da Essenza</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '3rem' }} className="no-print desktop-report-grid">
        <style>{`
          @media (min-width: 768px) { .desktop-report-grid { grid-template-columns: 1fr 1fr !important; } }
        `}</style>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem'
            }}>
              {profile.emoji}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seu Perfil de Gestão
            </span>
            <h2 style={{ fontSize: '2rem', color: 'white', fontFamily: 'var(--font-display)', margin: '0.25rem 0 1rem', fontWeight: 800 }}>
              {profile.profileName}
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{profile.description}</p>
          </div>

          {/* Business Metrics */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ color: 'var(--accent-gold)' }} /> Resultados Consolidados
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Faturamento Acumulado:', val: fmt(totalRevenue), color: 'white' },
                { label: 'Lucro Líquido Acumulado:', val: fmt(totalProfit), color: totalProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' },
                { label: 'Saldo Final em Caixa:', val: fmt(finalCash), color: 'var(--accent-gold)' },
                { label: 'Média do Índice IGE:', val: `${avgIge}/100`, color: 'white' },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <strong style={{ color: row.color }}>{row.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pedagogical Grades */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy style={{ color: 'var(--accent-gold)' }} /> Avaliação Pedagógica Final
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Planejamento de Demanda', val: avgPlanning },
                { label: 'Gestão Financeira e Caixa', val: avgFinance },
                { label: 'Liderança e Gestão de Pessoas', val: avgPeople },
                { label: 'Inovação Operacional e Qualidade', val: avgInnovation },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <strong style={{ color: 'white' }}>{item.val} / 10</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.val * 10}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Certificate */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail style={{ color: 'var(--accent-gold)' }} /> Enviar Certificado Oficial
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Insira o e-mail e receba o certificado oficial da simulação Essenza — FECART 2026 diretamente na sua caixa de entrada.
            </p>

            {sendingState === 'idle' && (
              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Seu e-mail"
                  className="input-control"
                  required
                />
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                  <Send size={18} /> Enviar por E-mail
                </button>
              </form>
            )}

            {sendingState === 'sending' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  border: '3px solid rgba(255,255,255,0.1)',
                  borderTop: '3px solid var(--accent-gold)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Despachando certificado oficial...</span>
              </div>
            )}

            {sendingState === 'success' && (
              <div className="animate-fade-in" style={{
                textAlign: 'center', padding: '1.5rem',
                border: '1px dashed var(--accent-success)',
                borderRadius: '8px', background: 'var(--accent-success-glow)'
              }}>
                <CheckCircle size={32} style={{ color: 'var(--accent-success)', marginBottom: '0.75rem' }} />
                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>E-mail Enviado!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  Certificado enviado com sucesso para <strong>{emailInput}</strong>.
                </p>
                <button onClick={() => setSendingState('idle')} style={{ marginTop: '1rem', fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}>
                  Enviar para outro endereço
                </button>
              </div>
            )}

            {sendingState === 'error' && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '1rem',
                padding: '1.25rem', border: '1px dashed var(--accent-danger)',
                borderRadius: '8px', background: 'var(--accent-danger-glow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{errorMsg}</p>
                </div>
                <button onClick={() => setSendingState('idle')} className="btn-primary" style={{ justifyContent: 'center' }}>
                  <Send size={16} /> Tentar Novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CERTIFICADO OFICIAL ───────────────────────────────────────────── */}
      <div id="print-area" className="glass-panel" style={{
        padding: '3.5rem 3rem',
        border: '3px double var(--accent-gold)',
        borderRadius: '12px',
        background: 'rgba(10, 15, 29, 0.97)',
        boxShadow: '0 0 60px -10px var(--accent-gold-glow)',
        maxWidth: '820px',
        margin: '0 auto 3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Marca d'água */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.025, fontSize: '11rem', fontWeight: 900,
          fontFamily: 'serif', pointerEvents: 'none', userSelect: 'none',
          lineHeight: 1, whiteSpace: 'nowrap'
        }}>
          FECART
        </div>

        {/* Timbre superior */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            border: '1.5px solid var(--accent-gold)',
            padding: '0.5rem 1.5rem',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold)'
          }}>
            Colégio FECAP — FECART 2026
          </div>
        </div>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', fontStyle: 'italic', fontWeight: 'normal', color: '#fff', marginBottom: '0.5rem' }}>
          Certificado de Desempenho
        </h2>
        <div style={{ width: '80px', height: '2px', background: 'var(--accent-gold)', margin: '0 auto 2rem', opacity: 0.6 }} />

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto 1.5rem' }}>
          Certificamos que <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{playerName || 'Gestor(a)'}</strong> participou
          do Simulador Empresarial <strong style={{ color: 'var(--accent-gold)' }}>ESSENZA</strong> na Feira Científica{' '}
          <strong>FECART 2026</strong>. Ao longo de 3 rodadas comerciais, demonstrou habilidades de gestão estratégica,
          financeira e operacional, sendo classificado(a) com o perfil:
        </p>

        <h3 style={{ fontSize: '2rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', marginBottom: '2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
          {profile.profileName}
        </h3>

        {/* Notas */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '2.5rem',
          margin: '0 auto 3rem', maxWidth: '520px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '1.25rem 0'
        }}>
          {[
            { label: 'Planejamento', val: avgPlanning },
            { label: 'Finanças',     val: avgFinance },
            { label: 'Pessoas',      val: avgPeople },
            { label: 'Inovação',     val: avgInnovation },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
                <strong style={{ fontSize: '1.15rem', color: '#fff' }}>{item.val}</strong>
              </div>
              {i < arr.length - 1 && <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── ASSINATURA — apenas Profa. Dra. Débora ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          {/* Linha de assinatura */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', width: '260px', marginBottom: '0.5rem' }} />

          <strong style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
            Profa. Dra. Débora Mendonça M. Machado
          </strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Coordenadora dos Cursos Técnicos — Colégio FECAP
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Ph.D. em Gestão de Projetos, Inovação e Empreendedorismo
          </span>
        </div>

        {/* Data */}
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <Calendar size={14} style={{ color: 'var(--accent-gold)' }} />
          <span>São Paulo, {today}</span>
        </div>
      </div>

      {/* Botões */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <button onClick={handlePrint} className="btn-secondary" style={{ padding: '1rem 2.5rem' }}>
          <Download size={18} /> Imprimir Certificado
        </button>
        <button onClick={resetGame} className="btn-primary" style={{ padding: '1rem 2.5rem' }}>
          <RefreshCw size={18} /> Jogar Novamente
        </button>
      </div>
    </div>
  );
};
