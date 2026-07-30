import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { classifyManagementProfile } from '../engine/ssisEngine';
import emailjs from '@emailjs/browser';
import { 
  TrendingUp, RefreshCw, Send, CheckCircle, 
  Mail, Calendar, Download, Trophy, AlertCircle, ExternalLink, Award, Check
} from 'lucide-react';

// ─── EmailJS CONFIG ──────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_psjyr8r';   
const EMAILJS_TEMPLATE_ID = 'template_essenza';  
const EMAILJS_PUBLIC_KEY  = '0KWHSmZLCrygDSvZl';    
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

  // ── Envio via Mailto (Instantâneo sem depender de API externa) ─────────────
  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`Certificado Oficial ESSENZA FECART 2026 — ${playerName || 'Gestor'}`);
    const body = encodeURIComponent(
      `CERTIFICADO DE DESEMPENHO EMPRESARIAL — ESSENZA (FECART 2026)\n\n` +
      `Certificamos que ${playerName || 'Gestor(a)'} participou do Simulador Empresarial ESSENZA no Colégio FECAP.\n\n` +
      `PERFIL DE GESTÃO ALCANÇADO: ${profile.profileName.toUpperCase()}\n` +
      `"${profile.subtitle}"\n\n` +
      `AVALIAÇÃO PEDAGÓGICA (0 a 10):\n` +
      `- Planejamento de Demanda: ${avgPlanning}\n` +
      `- Gestão Financeira e Caixa: ${avgFinance}\n` +
      `- Liderança e Pessoas: ${avgPeople}\n` +
      `- Inovação e Qualidade: ${avgInnovation}\n` +
      `- Média do Índice IGE: ${avgIge}/100\n\n` +
      `RESULTADOS CONSOLIDADOS:\n` +
      `- Faturamento Acumulado: ${fmt(totalRevenue)}\n` +
      `- Lucro Líquido Acumulado: ${fmt(totalProfit)}\n` +
      `- Saldo Final em Caixa: ${fmt(finalCash)}\n\n` +
      `São Paulo, ${today}\n\n` +
      `Assinatura:\n` +
      `Profa. Dra. Débora Mendonça M. Machado\n` +
      `Coordenadora dos Cursos Técnicos — Colégio FECAP\n` +
      `Ph.D. em Gestão de Projetos, Inovação e Empreendedorismo`
    );
    window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`, '_blank');
  };

  // ── Envio via EmailJS ──────────────────────────────────────────────────
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
      setErrorMsg('Serviço web indisponível no momento. Utilize a opção abaixo de "Abrir no App de E-mail".');
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
        <span className="badge-pill badge-gold" style={{ marginBottom: '0.5rem' }}>Simulação Finalizada — FECART 2026</span>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Relatório Executivo Geral</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Análise de liderança, indicadores de desempenho e certificação digital Essenza</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '3rem' }} className="no-print desktop-report-grid">
        <style>{`
          @media (min-width: 768px) { .desktop-report-grid { grid-template-columns: 1.2fr 1fr !important; } }
        `}</style>

        {/* Left Column: Sophisticated Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid var(--accent-gold-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '72px', height: '72px',
                background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)',
                borderRadius: '20px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0,
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                {profile.emoji}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  Perfil Executivo S.S.I.S.
                </span>
                <h2 style={{ fontSize: '1.75rem', color: 'white', fontFamily: 'var(--font-display)', margin: '0.1rem 0 0.2rem', fontWeight: 800 }}>
                  {profile.profileName}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                  "{profile.subtitle}"
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {profile.description}
            </p>

            {/* Strengths List */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} /> Principais Fortalezas Observadas
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {profile.strengths.map((str, idx) => (
                  <li key={idx} style={{ lineHeight: 1.4 }}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Executive Recommendation */}
            <div style={{ borderLeft: '3px solid var(--accent-gold)', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recomendação de Consultoria</span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0.2rem 0 0', lineHeight: 1.5 }}>
                {profile.executiveAdvice}
              </p>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ color: 'var(--accent-gold)' }} /> Balanço Financeiro Consolidado
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Faturamento Acumulado (3 Rodadas):', val: fmt(totalRevenue), color: 'white' },
                { label: 'Lucro Líquido Acumulado:', val: fmt(totalProfit), color: totalProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' },
                { label: 'Saldo Final em Caixa:', val: fmt(finalCash), color: 'var(--accent-gold)' },
                { label: 'Média do Índice IGE (Desempenho Geral):', val: `${avgIge}/100`, color: 'white' },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <strong style={{ color: row.color }}>{row.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pedagogical Grades & Double Email Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pedagogical Grades */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy style={{ color: 'var(--accent-gold)' }} /> Avaliação Pedagógica Final (FECAP)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Planejamento de Demanda & Estoque', val: avgPlanning },
                { label: 'Gestão Financeira & Caixa', val: avgFinance },
                { label: 'Liderança & Gestão de Pessoas', val: avgPeople },
                { label: 'Inovação Operacional & Qualidade', val: avgInnovation },
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

          {/* Double Email Certificate block */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail style={{ color: 'var(--accent-gold)' }} /> Enviar Certificado por E-mail
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Receba ou envie o certificado oficial de gestão direto na caixa de entrada do usuário.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  E-mail do Destinatário:
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="input-control"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                />
              </div>

              {/* Action 1: Instant Device Mail Client */}
              <button 
                onClick={handleOpenMailClient} 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                <ExternalLink size={18} /> Abrir no Meu App de E-mail (Instantâneo)
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '-0.25rem 0' }}>
                — ou via servidor web —
              </div>

              {/* Action 2: Web Server Send (EmailJS) */}
              {sendingState === 'idle' && (
                <button 
                  onClick={handleSendEmail} 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                >
                  <Send size={16} /> Disparar via Servidor Web
                </button>
              )}

              {sendingState === 'sending' && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTop: '3px solid var(--accent-gold)',
                    borderRadius: '50%', width: '28px', height: '28px',
                    animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem'
                  }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enviando certificado...</span>
                </div>
              )}

              {sendingState === 'success' && (
                <div className="animate-fade-in" style={{
                  textAlign: 'center', padding: '1.25rem',
                  border: '1px dashed var(--accent-success)',
                  borderRadius: '8px', background: 'var(--accent-success-glow)'
                }}>
                  <CheckCircle size={28} style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }} />
                  <h4 style={{ color: 'white', marginBottom: '0.2rem' }}>E-mail Enviado!</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>
                    Certificado emitido e enviado com sucesso para <strong>{emailInput}</strong>.
                  </p>
                </div>
              )}

              {sendingState === 'error' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  padding: '1rem', border: '1px dashed var(--accent-danger)',
                  borderRadius: '8px', background: 'var(--accent-danger-glow)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>{errorMsg}</p>
                  </div>
                  <button onClick={handleOpenMailClient} className="btn-primary" style={{ justifyContent: 'center', padding: '0.6rem' }}>
                    <ExternalLink size={16} /> Abrir pelo Meu E-mail
                  </button>
                </div>
              )}
            </div>
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
        maxWidth: '840px',
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
          Certificado de Desempenho Empresarial
        </h2>
        <div style={{ width: '80px', height: '2px', background: 'var(--accent-gold)', margin: '0 auto 2rem', opacity: 0.6 }} />

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.5rem' }}>
          Certificamos que <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{playerName || 'Gestor(a)'}</strong> participou
          do Simulador Empresarial <strong style={{ color: 'var(--accent-gold)' }}>ESSENZA</strong> na Feira Científica{' '}
          <strong>FECART 2026</strong>. Ao longo de 3 rodadas comerciais, demonstrou habilidades estratégicas de gestão comercial,
          financeira e operacional, sendo classificado(a) com o perfil executivo:
        </p>

        <h3 style={{ fontSize: '2rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', marginBottom: '0.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
          {profile.emoji} {profile.profileName}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '2rem' }}>
          "{profile.subtitle}"
        </p>

        {/* Notas */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '2.5rem',
          margin: '0 auto 3rem', maxWidth: '540px',
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

        {/* ── ASSINATURA — Profa. Dra. Débora ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', width: '280px', marginBottom: '0.5rem' }} />

          <strong style={{ color: '#fff', fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
            Profa. Dra. Débora Mendonça M. Machado
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
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
          <Download size={18} /> Imprimir / Salvar PDF
        </button>
        <button onClick={resetGame} className="btn-primary" style={{ padding: '1rem 2.5rem' }}>
          <RefreshCw size={18} /> Iniciar Nova Simulação
        </button>
      </div>
    </div>
  );
};
