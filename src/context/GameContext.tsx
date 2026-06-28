import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GameState, PlayerDecision, RoundResult, GameEvent } from '../data/types';
import { products } from '../data/products';
import { events } from '../data/events';
import { executeRound } from '../engine/marketEngine';
import { generateSsisFeedback, generateCouncilFeedback } from '../engine/ssisEngine';

interface GameContextType {
  state: GameState;
  startGame: (name: string, email: string) => void;
  updatePendingDecision: (updater: (prev: PlayerDecision) => PlayerDecision) => void;
  submitRoundDecision: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

const defaultDecision: PlayerDecision = {
  investments: {
    materials: 50000,
    production: 50000,
    marketing: 40000,
    logistics: 30000,
  },
  prices: {
    camiseta_basica: 29.90,
    polo_essenza: 59.90,
    moletom: 89.90,
    calca_jeans: 99.90,
    vestido_linho: 79.90,
    kit_meia_cueca: 39.90,
  },
  productionQty: {
    camiseta_basica: 1000,
    polo_essenza: 500,
    moletom: 200,
    calca_jeans: 400,
    vestido_linho: 300,
    kit_meia_cueca: 800,
  }
};

const defaultState: GameState = {
  playerName: '',
  playerEmail: '',
  currentRound: 1,
  currentCash: 500000,
  reputation: 50,
  quality: 50,
  innovation: 50,
  satisfaction: 50,
  efficiency: 50,
  marketShare: 0.33,
  history: [],
  gameState: 'start',
  activeEvent: null,
  pendingDecision: defaultDecision,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(defaultState);

  // Load game from localStorage if it exists (great feature for recovery)
  useEffect(() => {
    const saved = localStorage.getItem('essenza_game_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading saved state", e);
      }
    }
  }, []);

  const saveState = (newState: GameState) => {
    setState(newState);
    localStorage.setItem('essenza_game_state', JSON.stringify(newState));
  };

  const startGame = (name: string, email: string) => {
    // Sorteia evento da rodada 1
    const positiveEvents = events.filter(e => e.type === 'positive');
    const firstEvent = positiveEvents[Math.floor(Math.random() * positiveEvents.length)]; // Começa com positivo para incentivar

    const newState: GameState = {
      ...defaultState,
      playerName: name,
      playerEmail: email,
      gameState: 'playing',
      activeEvent: firstEvent,
      currentCash: 500000,
      pendingDecision: {
        ...defaultDecision,
        prices: products.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultPrice }), {}),
        productionQty: products.reduce((acc, p) => ({ ...acc, [p.id]: p.id === 'moletom' ? 300 : p.id === 'vestido_linho' ? 400 : 500 }), {})
      }
    };
    saveState(newState);
  };

  const updatePendingDecision = (updater: (prev: PlayerDecision) => PlayerDecision) => {
    setState((prev) => {
      const updated = {
        ...prev,
        pendingDecision: updater(prev.pendingDecision)
      };
      // Keep it in sync
      localStorage.setItem('essenza_game_state', JSON.stringify(updated));
      return updated;
    });
  };

  const submitRoundDecision = () => {
    // Get competitor cash from last round or default
    let rivalACash = 500000;
    let rivalBCash = 500000;
    if (state.history.length > 0) {
      const lastRound = state.history[state.history.length - 1];
      rivalACash = lastRound.rivalA.cash;
      rivalBCash = lastRound.rivalB.cash;
    }

    // Execute simulation engine
    const baseResult = executeRound(
      state.currentRound,
      state.pendingDecision,
      state.currentCash,
      {
        reputation: state.reputation,
        quality: state.quality,
        innovation: state.innovation,
        satisfaction: state.satisfaction,
        efficiency: state.efficiency
      },
      state.activeEvent,
      rivalACash,
      rivalBCash
    );

    // Generate S.S.I.S feedback
    const ssisFeedback = generateSsisFeedback(
      state.currentRound,
      state.pendingDecision,
      baseResult.playerMetrics,
      state.activeEvent,
      baseResult.rivalA,
      baseResult.rivalB
    );

    // Generate council dialogue feedback
    const councilFeedback = generateCouncilFeedback(
      state.pendingDecision,
      baseResult.playerMetrics,
      state.activeEvent
    );

    // Build the full round result
    const roundResult: RoundResult = {
      ...baseResult,
      ssisFeedback,
      councilFeedback
    };

    const newHistory = [...state.history, roundResult];
    const metrics = baseResult.playerMetrics;

    const newState: GameState = {
      ...state,
      currentCash: metrics.cash,
      reputation: metrics.reputation,
      quality: metrics.quality,
      innovation: metrics.innovation,
      satisfaction: metrics.satisfaction,
      efficiency: metrics.efficiency,
      marketShare: metrics.marketShare,
      history: newHistory,
      gameState: 'results'
    };
    saveState(newState);
  };

  const nextRound = () => {
    const nextR = state.currentRound + 1;
    if (nextR > 3) {
      const newState: GameState = {
        ...state,
        gameState: 'final_report'
      };
      saveState(newState);
    } else {
      // Sorteia próximo evento da rodada
      // Garantir que na rodada 2 e 3 temos eventos condizentes (por exemplo, misturando negativos e positivos)
      let nextEvent: GameEvent;
      if (nextR === 2) {
        // Round 2 is winter - let's make it cotton price crisis or summer heat anomalies or a mix
        const candidates = events.filter(e => e.id !== state.activeEvent?.id);
        nextEvent = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const candidates = events.filter(e => e.id !== state.activeEvent?.id && !state.history.some(h => h.event?.id === e.id));
        nextEvent = candidates[Math.floor(Math.random() * candidates.length)];
      }

      // Reset decisions baseline for the next round
      const nextDecision: PlayerDecision = {
        investments: {
          materials: Math.round(state.currentCash * 0.15),
          production: Math.round(state.currentCash * 0.15),
          marketing: Math.round(state.currentCash * 0.10),
          logistics: Math.round(state.currentCash * 0.08),
        },
        prices: state.pendingDecision.prices, // Keep same prices
        productionQty: state.pendingDecision.productionQty // Keep same quantities
      };

      const newState: GameState = {
        ...state,
        currentRound: nextR,
        activeEvent: nextEvent,
        pendingDecision: nextDecision,
        gameState: 'playing'
      };
      saveState(newState);
    }
  };

  const resetGame = () => {
    localStorage.removeItem('essenza_game_state');
    setState(defaultState);
  };

  return (
    <GameContext.Provider value={{ state, startGame, updatePendingDecision, submitRoundDecision, nextRound, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
