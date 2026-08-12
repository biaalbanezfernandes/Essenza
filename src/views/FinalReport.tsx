import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { classifyManagementProfile } from '../engine/ssisEngine';
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  TrendingUp, RefreshCw, Send, CheckCircle, 
  Mail, Download, Trophy, AlertCircle, ExternalLink, Award, Loader2
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

  // ── Envio via Mailto (Fallback Instantâneo) ────────────────────────────────
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

          {/* Email Certificate block */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail style={{ color: 'var(--accent-gold)' }} /> Enviar Certificado por E-mail
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Receba o certificado oficial de gestão direto na sua caixa de entrada.
            </p>

            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
        <h2 style={{ textAlign: 'center', color: '#d4af37', fontSize: '1.8rem', margin: '1.5rem 0' }}>{profile.emoji} {profile.profileName}</h2>
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', marginBottom: '2rem' }}>"{profile.subtitle}"</p>
        
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
