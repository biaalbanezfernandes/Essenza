import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Mail, User, BookOpen, Cpu } from 'lucide-react';

export const StartScreen: React.FC = () => {
  const { startGame } = useGame();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

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
    startGame(name, email);
  };

  return (
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
  );
};
