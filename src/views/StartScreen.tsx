import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Mail, User, Play, Sparkles, ShieldCheck, Zap, Award, DollarSign } from 'lucide-react';
import { EssenzaLogo } from '../components/EssenzaLogo';

export const StartScreen: React.FC = () => {
  const { startGame } = useGame();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, digite seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, digite um e-mail válido.');
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
      padding: '3rem 1.5rem',
      maxWidth: '960px',
      margin: '0 auto',
      width: '100%',
      position: 'relative',
      zIndex: 1,
      textAlign: 'center'
    }} className="animate-fade-in">

      {/* Top Floating Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        background: 'linear-gradient(135deg, rgba(126, 34, 206, 0.2), rgba(212, 175, 55, 0.15))',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        padding: '0.45rem 1.25rem',
        borderRadius: '30px',
        marginBottom: '2rem',
        color: '#fef08a',
        fontSize: '0.8rem',
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)',
        margin: '0 auto 2rem'
      }}>
        <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
        DESAFIO EXECUTIVO • FECART 2026
      </div>

      {/* Central Logo Header */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem', width: '100%' }}>
        <EssenzaLogo variant="full" height={175} />
      </div>

      {/* Provocative High-Impact Headline */}
      <h1 style={{
        fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        textAlign: 'center',
        lineHeight: 1.1,
        marginBottom: '1rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 60%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
        width: '100%'
      }}>
        ASSUMA O CONTROLE.<br />PROVE SEU VALOR.
      </h1>

      <p style={{
        fontSize: '1.15rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        maxWidth: '620px',
        margin: '0 auto 2.5rem',
        lineHeight: 1.5,
        fontWeight: 400
      }}>
        Sua capacidade de decisão testada no mais alto nível corporativo.
      </p>

      {/* Visual Quick Impact Badges (Centralizados) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
        marginBottom: '2.75rem',
        width: '100%'
      }}>
        <div style={{
          background: 'rgba(10, 5, 22, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '30px',
          padding: '0.55rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--accent-gold)',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <DollarSign size={16} /> R$ 600.000 em Caixa
        </div>

        <div style={{
          background: 'rgba(10, 5, 22, 0.85)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '30px',
          padding: '0.55rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: '#c084fc',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <Zap size={16} /> Decisões em Tempo Real
        </div>

        <div style={{
          background: 'rgba(10, 5, 22, 0.85)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '30px',
          padding: '0.55rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: '#60a5fa',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <Award size={16} /> Certificado Executivo
        </div>
      </div>

      {/* Main Glassmorphic Portal (Ficha Cadastral Centralizada de Alto Impacto) */}
      <div style={{
        background: 'rgba(10, 5, 22, 0.92)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 50px rgba(126, 34, 206, 0.25)',
        backdropFilter: 'blur(16px)',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.35rem', fontFamily: 'var(--font-display)', color: 'white', textAlign: 'center' }}>
            Ficha Cadastral do Gestor
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center' }}>
            Identifique-se para acessar o painel de comando
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
            <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 500, textAlign: 'center' }}>
              <User size={15} style={{ color: 'var(--accent-purple)' }} /> Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="input-control"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontSize: '0.95rem',
                textAlign: 'center',
                width: '100%'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
            <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 500, textAlign: 'center' }}>
              <Mail size={15} style={{ color: 'var(--accent-purple)' }} /> E-mail Profissional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.com"
              className="input-control"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontSize: '0.95rem',
                textAlign: 'center',
                width: '100%'
              }}
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '0.75rem',
              padding: '1.1rem',
              fontSize: '1.05rem',
              fontWeight: 800,
              borderRadius: '12px',
              gap: '0.6rem',
              letterSpacing: '0.5px',
              boxShadow: '0 0 30px rgba(126, 34, 206, 0.45)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Play size={20} fill="currentColor" /> INICIAR SIMULAÇÃO
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '3.5rem', display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: '100%', textAlign: 'center' }}>
        <span>FECART 2026</span>
        <span>•</span>
        <span>Apoio Acadêmico FECAP</span>
        <span>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <ShieldCheck size={12} /> Ambiente Executivo Seguro
        </span>
      </div>
    </div>
  );
};
