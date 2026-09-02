import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { classifyManagementProfile } from '../engine/ssisEngine';
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  TrendingUp, RefreshCw, Send, CheckCircle, 
  Mail, Download, Trophy, AlertCircle, ExternalLink, Award, Loader2, Sparkles, ArrowDown, Compass
} from 'lucide-react';

// ─── EmailJS CONFIG ──────────────────────────────────────────────────────────
// Estas chaves devem ser configuradas no painel do EmailJS (emailjs.com)
const EMAILJS_SERVICE_ID = 'service_ea25zeo';
const EMAILJS_TEMPLATE_ID = 'template_q6gvfd3';
const EMAILJS_PUBLIC_KEY = 'nyfgnr8aavqMopwpz';
// ─────────────────────────────────────────────────────────────────────────────

export const FinalReport: React.FC = () => {
  const { state, resetGame } = useGame();
  const { history, playerName, playerEmail, currentCash } = state;
  const certificateRef = useRef<HTMLDivElement>(null);

  const [emailInput, setEmailInput] = useState(playerEmail || '');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Compute final statistics
  const profile = classifyManagementProfile(history);
  const finalCash = currentCash;
  
  const totalRevenue = history.reduce((acc, r) => acc + r.playerMetrics.revenue, 0);
  const totalProfit  = history.reduce((acc, r) => acc + r.playerMetrics.profit, 0);
  const avgIge       = Math.round(history.reduce((acc, r) => acc + r.playerMetrics.ige, 0) / history.length);

  const avgPlanning   = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.planning,   0) / history.length) * 10) / 10;
  const avgFinance    = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.finance,    0) / history.length) * 10) / 10;
  const avgPeople     = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.people,     0) / history.length) * 10) / 10;
  const avgInnovation = Math.round((history.reduce((acc, r) => acc + r.ssisFeedback.pedagogicalGrade.innovation, 0) / history.length) * 10) / 10;

  const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Geração de PDF Real ────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setPdfGenerating(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#060913'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificado_Essenza_${playerName || 'Jogador'}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      // Fallback para impressão do navegador se o html2canvas falhar
      window.print();
    } finally {
      setPdfGenerating(false);
    }
  };
  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`Certificado Oficial ESSENZA FECART 2026 — ${playerName || 'Gestor'}`);
    const body = encodeURIComponent(
      `Olá, ${playerName || 'Gestor(a)'}! 👋\n\n` +
      `Parabéns pela conclusão do Simulador Empresarial ESSENZA na Feira Científica FECART 2026!\n\n` +
      `🧠 DIAGNÓSTICO DE LIDERANÇA ESSENZA IA:\n` +
      `${profile.personalizedExplanation}\n\n` +
      `💪 Ponto Forte: ${profile.pontoForte}\n` +
      `⚠️ Risco a Monitorar: ${profile.risco}\n` +
      `🧭 Recomendação Executiva: ${profile.executiveAdvice}\n\n` +
      `----------------------------------------------------------------------\n\n` +
      `Colégio FECAP — FECART 2026\n` +
      `Certificado de Desempenho\n\n` +
      `Certificamos que ${playerName || 'Gestor(a)'} participou do Simulador Empresarial ESSENZA na Feira Científica FECART 2026. Ao longo de 3 rodadas comerciais, demonstrou habilidades de gestão estratégica, financeira e operacional, sendo classificado(a) com o perfil:\n\n` +
      `${profile.emoji} ${profile.profileName}\n` +
      `"${profile.subtitle}"\n\n` +
      `Planejamento\n${avgPlanning}\t\n` +
      `Finanças\n${avgFinance}\t\n` +
      `Pessoas\n${avgPeople}\t\n` +
      `Inovação\n${avgInnovation}\n\n` +
      `Membros Essenza\n` +
      `Comissão empresarial da Essenza\n` +
      `São Paulo, ${today}\n`
    );
    window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`, '_blank');
  };

  // ── Envio via EmailJS ──────────────────────────────────────────────────
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Por favor, insira um e-mail válido.');
      setSendingState('error');
      return;
    }

    setSendingState('sending');
    setErrorMsg('');

    const templateParams = {
      to_email:        emailInput,
      to_name:         playerName || 'Gestor(a)',
      player_name:     playerName || 'Gestor(a)',
      profile_name:    `${profile.emoji} ${profile.profileName}`,
      profile_subtitle: `"${profile.subtitle}"`,
      profile_desc:    `"${profile.subtitle}"`,
      description:     `"${profile.subtitle}"`,
      subtitle:        `"${profile.subtitle}"`,
      ia_explanation:  profile.personalizedExplanation,
      ai_analysis:     profile.personalizedExplanation,
      personalized_explanation: profile.personalizedExplanation,
      ponto_forte:     profile.pontoForte,
      risco:           profile.risco,
      executive_advice: profile.executiveAdvice,
      avg_planning:    String(avgPlanning),
      avg_finance:     String(avgFinance),
      avg_people:      String(avgPeople),
      avg_innovation:  String(avgInnovation),
      avg_ige:         String(avgIge),
      total_revenue:   fmt(totalRevenue),
      total_profit:    fmt(totalProfit),
      final_cash:      fmt(finalCash),
      issue_date:      today,
      certificate_full_text:
        `Colégio FECAP — FECART 2026\n` +
        `Certificado de Desempenho\n\n` +
        `Certificamos que ${playerName || 'Gestor(a)'} participou do Simulador Empresarial ESSENZA na Feira Científica FECART 2026. Ao longo de 3 rodadas comerciais, demonstrou habilidades de gestão estratégica, financeira e operacional, sendo classificado(a) com o perfil:\n\n` +
        `${profile.emoji} ${profile.profileName}\n` +
        `"${profile.subtitle}"\n\n` +
        `Planejamento\n${avgPlanning}\t\n` +
        `Finanças\n${avgFinance}\t\n` +
        `Pessoas\n${avgPeople}\t\n` +
        `Inovação\n${avgInnovation}\n\n` +
        `Membros Essenza\n` +
        `Comissão empresarial da Essenza\n` +
        `São Paulo, ${today}`
    };

    try {
      // Inicializa explicitamente para garantir a conexão
      emailjs.init(EMAILJS_PUBLIC_KEY);
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        setSendingState('success');
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (err: any) {
      console.error('EmailJS error:', err);
      let msg = 'Não foi possível enviar o e-mail automaticamente.';
      if (err?.text) msg += ` Detalhe: ${err.text}`;
      else if (err?.message) msg += ` Detalhe: ${err.message}`;
      
      setErrorMsg(msg);
      setSendingState('error');
    }
  };

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
            margin: 0 !important;
            position: static !important;
            transform: none !important;
          }
          #print-area * { color: black !important; }
          .no-print { display: none !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>

      {/* Title Header */}
      <div className="no-print" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-pill badge-gold" style={{ marginBottom: '0.5rem' }}>Simulação Finalizada — FECART 2026</span>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Relatório Executivo Geral</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Análise de liderança, indicadores de desempenho e certificação digital Essenza</p>
      </div>

      {/* ─── 6 PERFIS DE EMPRESÁRIO ESSENZA ───────────────────────────────────────── */}
      <div className="glass-panel no-print" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid rgba(212, 175, 55, 0.3)', position: 'relative' }}>
        <style>{`
          @keyframes pulseGoldGlow {
            0% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
            50% { box-shadow: 0 0 35px rgba(212, 175, 55, 0.8), 0 0 50px rgba(212, 175, 55, 0.35); }
            100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
          }
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
          .glow-profile-active { animation: pulseGoldGlow 2.2s infinite ease-in-out; }
          .spinner-bounce { animation: bounceSlow 1.4s infinite ease-in-out; }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <span className="badge-pill badge-gold" style={{ marginBottom: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <Sparkles size={13} /> Mapeamento de Perfis Empresariais — ESSENZA IA
          </span>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'white', margin: '0.1rem 0', fontWeight: 800 }}>
            6 Perfis de Empresário
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '600px', margin: '0 auto' }}>
            A IA da Essenza analisa suas escolhas e gestão estratégica para identificar seu perfil de empresário dominante.
          </p>
        </div>

        {/* Grid dos 6 Perfis - Compact & Lado a Lado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          position: 'relative'
        }}>
          {profile.allProfiles.map((p) => {
            const isSelected = p.id === profile.activeProfileId;
            return (
              <div
                key={p.id}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(15, 23, 42, 0.98) 100%)' 
                    : 'rgba(255, 255, 255, 0.025)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  border: isSelected 
                    ? '2px solid #d4af37' 
                    : '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: isSelected 
                    ? '0 0 20px rgba(212, 175, 55, 0.4)' 
                    : 'none',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  opacity: isSelected ? 1 : 0.7,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '85px'
                }}
                className={isSelected ? 'glow-profile-active' : ''}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '8px',
                    background: '#d4af37',
                    color: '#060913',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    padding: '0.12rem 0.45rem',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 6px rgba(212, 175, 55, 0.5)'
                  }}>
                    ✨ SEU PERFIL
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{p.emoji}</span>
                    <h3 style={{
                      margin: 0,
                      fontSize: '0.92rem',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      lineHeight: 1.25
                    }}>
                      {p.title}
                    </h3>
                  </div>

                  <p style={{
                    fontSize: '0.74rem',
                    color: isSelected ? '#f3f4f6' : 'var(--text-secondary)',
                    lineHeight: 1.3,
                    margin: 0
                  }}>
                    {p.shortSentence}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SETINHA PUXADA (Arrow connection) ─────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0.85rem 0 0.75rem',
          color: 'var(--accent-gold)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid #d4af37',
            padding: '0.3rem 1rem',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#d4af37',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
          }}>
            <span>{profile.emoji} PERFIL {profile.profileName.toUpperCase()} IDENTIFICADO PELA ESSENZA IA</span>
          </div>
          <div style={{
            width: '2px',
            height: '20px',
            background: 'linear-gradient(to bottom, #d4af37, transparent)',
            margin: '0.2rem 0'
          }} />
          <ArrowDown className="spinner-bounce" style={{ color: '#d4af37' }} size={20} />
        </div>

        {/* ── CAIXA DE EXPLICAÇÃO DETALHADA - LADO A LADO ───────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(10, 16, 32, 0.96) 100%)',
          border: '1.5px solid var(--accent-gold)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            {/* Lado Esquerdo: Diagnóstico e Análise Personalizada da IA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'var(--accent-gold-glow)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', flexShrink: 0,
                  border: '1px solid rgba(212, 175, 55, 0.4)'
                }}>
                  {profile.emoji}
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Diagnóstico de Liderança IA
                  </span>
                  <h3 style={{ fontSize: '1.35rem', color: 'white', fontFamily: 'var(--font-display)', margin: '0', fontWeight: 800 }}>
                    {profile.profileName}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    "{profile.subtitle}"
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                borderLeft: '3px solid var(--accent-gold)'
              }}>
                <h4 style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', fontWeight: 700 }}>
                  🧠 Análise Personalizada das Suas Decisões
                </h4>
                <p style={{ fontSize: '0.86rem', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
                  {profile.personalizedExplanation}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={13} /> Fortalezas Observadas na Partida
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {profile.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lado Direito: Ponto Forte, Risco e Recomendação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    💪 Ponto Forte
                  </span>
                  <strong style={{ fontSize: '0.88rem', color: 'white' }}>{profile.pontoForte}</strong>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    ⚠️ Risco a Monitorar
                  </span>
                  <strong style={{ fontSize: '0.84rem', color: 'white' }}>{profile.risco}</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', flexGrow: 1 }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Compass size={13} /> Recomendação Executiva IA
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                  {profile.executiveAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '3rem' }} className="no-print desktop-report-grid">
        <style>{`
          @media (min-width: 768px) { .desktop-report-grid { grid-template-columns: 1fr 1fr !important; } }
        `}</style>

        {/* Business Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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

        {/* Right Column: Pedagogical Grades & Email Method */}
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
        </div>
      </div>

      {/* Seção Inferior: Email e QR Code Lado a Lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '3rem', alignItems: 'stretch' }} className="no-print desktop-report-grid">
        {/* Email Certificate block */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail style={{ color: 'var(--accent-gold)' }} /> Enviar Certificado por E-mail
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Receba o certificado oficial de gestão direto na sua caixa de entrada.
          </p>

          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flexGrow: 1, justifyContent: 'center' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                E-mail do Destinatário:
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nome@exemplo.com"
                className="input-control"
                style={{ width: '100%' }}
              />
            </div>

            {sendingState === 'idle' || sendingState === 'error' ? (
              <button 
                type="submit"
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                <Send size={16} /> Enviar Certificado Agora
              </button>
            ) : sendingState === 'sending' ? (
              <div style={{ textAlign: 'center', padding: '0.85rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Loader2 size={20} className="spinner" style={{ margin: '0 auto 0.5rem', color: 'var(--accent-gold)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enviando para o servidor...</span>
              </div>
            ) : (
              <div className="animate-fade-in" style={{
                textAlign: 'center', padding: '1rem',
                border: '1px solid var(--accent-success)',
                borderRadius: '8px', background: 'var(--accent-success-glow)'
              }}>
                <CheckCircle size={24} style={{ color: 'var(--accent-success)', marginBottom: '0.4rem', margin: '0 auto' }} />
                <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.1rem' }}>E-mail Enviado!</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
                  Verifique sua caixa de entrada em breve.
                </p>
              </div>
            )}

            {sendingState === 'error' && (
              <div style={{
                padding: '0.75rem', border: '1px dashed var(--accent-danger)',
                borderRadius: '8px', background: 'var(--accent-danger-glow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={16} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>{errorMsg}</p>
                </div>
                <button type="button" onClick={handleOpenMailClient} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem' }}>
                  <ExternalLink size={14} /> Tentar via App de E-mail
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Evaluation QR Code */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Award style={{ color: 'var(--accent-gold)' }} /> Avalie o Essenza!
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Sua opinião é importante! Escaneie o QR Code e preencha a avaliação para nos ajudar.
          </p>
          <div style={{ 
            background: 'white', 
            padding: '0.5rem', 
            borderRadius: '8px', 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <img 
              src="/qrcode.png" 
              alt="QR Code de Avaliação" 
              style={{ width: '140px', height: '140px', display: 'block' }} 
            />
          </div>
        </div>
      </div>

      {/* ── CERTIFICADO OFICIAL ───────────────────────────────────────────── */}
      <div ref={certificateRef} id="print-area" className="glass-panel" style={{
        fontFamily: 'Georgia, serif', maxWidth: '700px', margin: '0 auto 3rem', background: '#060913', color: '#f3f4f6', padding: '3rem', border: '3px double #d4af37', borderRadius: '12px',
        boxShadow: '0 0 60px -10px var(--accent-gold-glow)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ border: '1px solid #d4af37', padding: '0.4rem 1.2rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d4af37' }}> Colégio FECAP — FECART 2026 </span>
        </div>
        <h1 style={{ textAlign: 'center', fontStyle: 'italic', fontWeight: 'normal', fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Certificado de Desempenho</h1>
        <div style={{ width: '60px', height: '2px', background: '#d4af37', margin: '0 auto 2rem' }} />
        <p style={{ textAlign: 'center', lineHeight: 1.8, color: '#9ca3af', fontSize: '1rem' }}>
          Certificamos que <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{playerName || 'Gestor(a)'}</strong> participou do Simulador Empresarial <strong style={{ color: '#d4af37' }}>ESSENZA</strong> na Feira Científica <strong style={{ color: '#fff' }}>FECART 2026</strong>. Ao longo de 3 rodadas comerciais, demonstrou habilidades de gestão estratégica, financeira e operacional, sendo classificado(a) com o perfil:
        </p>
        <h2 style={{ textAlign: 'center', color: '#d4af37', fontSize: '1.85rem', margin: '1.5rem 0 0.4rem' }}>{profile.emoji} {profile.profileName}</h2>
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '2rem' }}>"{profile.subtitle}"</p>
        
        <table style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', marginBottom: '2rem', textAlign: 'center' }}>
          <tbody>
            <tr>
              <td><span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Planejamento</span><strong style={{ color: '#fff' }}>{avgPlanning}</strong></td>
              <td><span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Finanças</span><strong style={{ color: '#fff' }}>{avgFinance}</strong></td>
              <td><span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Pessoas</span><strong style={{ color: '#fff' }}>{avgPeople}</strong></td>
              <td><span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Inovação</span><strong style={{ color: '#fff' }}>{avgInnovation}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', width: '260px', margin: '0 auto 0.5rem' }} />
          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Membros Essenza</strong><br />
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Comissão empresarial da Essenza</span>
        </div>
        
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.75rem' }}>São Paulo, {today}</p>
      </div>

      {/* Botões de Ação */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={handleDownloadPDF} 
          disabled={pdfGenerating}
          className="btn-secondary" 
          style={{ padding: '1rem 2.5rem', minWidth: '240px' }}
        >
          {pdfGenerating ? (
            <><Loader2 size={18} className="spinner" /> Gerando PDF...</>
          ) : (
            <><Download size={18} /> Baixar Certificado (PDF)</>
          )}
        </button>
        <button onClick={resetGame} className="btn-primary" style={{ padding: '1rem 2.5rem', minWidth: '240px' }}>
          <RefreshCw size={18} /> Iniciar Nova Simulação
        </button>
      </div>
    </div>
  );
};
