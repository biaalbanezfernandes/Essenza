import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, PlayerDecision, RoundResult, GameEvent } from '../data/types';
import { products } from '../data/products';
import { events } from '../data/events';
import { executeRound } from '../engine/marketEngine';
import { generateSsisFeedback, generateCouncilFeedback } from '../engine/ssisEngine';
import { initGameRng, getGameRng } from '../engine/rng';

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

const DEBOUNCE_MS = 300;

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(defaultState);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load game from localStorage if it exists
  useEffect(() => {
    const saved = localStorage.getItem('essenza_game_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameState;
        setState(parsed);
        // Re-seed RNG based on player name + first round event for reproducibility
        const seed = `${parsed.playerName}-${parsed.currentRound}`;
        initGameRng(seed);
      } catch (e) {
        console.error("Error reading saved state", e);
      }
    }
  }, []);

  // Debounced localStorage persistence
  const saveState = useCallback((newState: GameState) => {
    setState(newState);
    stateRef.current = newState;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      localStorage.setItem('essenza_game_state', JSON.stringify(newState));
    }, DEBOUNCE_MS);
  }, []);

  // Flush pending localStorage writes on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        localStorage.setItem('essenza_game_state', JSON.stringify(stateRef.current));
      }
    };
  }, []);

  const startGame = useCallback((name: string, email: string) => {
    const seed = `${name}-${Date.now()}`;
    initGameRng(seed);
    const rng = getGameRng();

    const positiveEvents = events.filter(e => e.type === 'positive');
    const firstEvent = rng.pick(positiveEvents);

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
  }, [saveState]);

  const updatePendingDecision = useCallback((updater: (prev: PlayerDecision) => PlayerDecision) => {
    setState((prev) => {
      const updated = {
        ...prev,
        pendingDecision: updater(prev.pendingDecision)
      };
      // Debounced save
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        localStorage.setItem('essenza_game_state', JSON.stringify(updated));
      }, DEBOUNCE_MS);
      return updated;
    });
  }, []);

  const submitRoundDecision = useCallback(() => {
    const current = stateRef.current;

    let rivalACash = 500000;
    let rivalBCash = 500000;
    if (current.history.length > 0) {
      const lastRound = current.history[current.history.length - 1];
      rivalACash = lastRound.rivalA.cash;
      rivalBCash = lastRound.rivalB.cash;
    }

    const baseResult = executeRound(
      current.currentRound,
      current.pendingDecision,
      current.currentCash,
      {
        reputation: current.reputation,
        quality: current.quality,
        innovation: current.innovation,
        satisfaction: current.satisfaction,
        efficiency: current.efficiency
      },
      current.activeEvent,
      rivalACash,
      rivalBCash
    );

    const ssisFeedback = generateSsisFeedback(
      current.currentRound,
      current.pendingDecision,
      baseResult.playerMetrics,
      current.activeEvent,
      baseResult.rivalA,
      baseResult.rivalB
    );

    const councilFeedback = generateCouncilFeedback(
      current.pendingDecision,
      baseResult.playerMetrics,
      current.activeEvent
    );

    const roundResult: RoundResult = {
      ...baseResult,
      ssisFeedback,
      councilFeedback
    };

    const newHistory = [...current.history, roundResult];
    const metrics = baseResult.playerMetrics;

    const newState: GameState = {
      ...current,
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
  }, [saveState]);

  const nextRound = useCallback(() => {
    const current = stateRef.current;
    const rng = getGameRng();
    const nextR = current.currentRound + 1;

    if (nextR > 3) {
      const newState: GameState = {
        ...current,
        gameState: 'final_report'
      };
      saveState(newState);
    } else {
      let nextEvent: GameEvent;
      if (nextR === 2) {
        const candidates = events.filter(e => e.id !== current.activeEvent?.id);
        nextEvent = rng.pick(candidates);
      } else {
        const candidates = events.filter(
          e => e.id !== current.activeEvent?.id && !current.history.some(h => h.event?.id === e.id)
        );
        nextEvent = rng.pick(candidates);
      }

      const nextDecision: PlayerDecision = {
        investments: {
          materials: Math.round(current.currentCash * 0.15),
          production: Math.round(current.currentCash * 0.15),
          marketing: Math.round(current.currentCash * 0.10),
          logistics: Math.round(current.currentCash * 0.08),
        },
        prices: current.pendingDecision.prices,
        productionQty: current.pendingDecision.productionQty
      };

      const newState: GameState = {
        ...current,
        currentRound: nextR,
        activeEvent: nextEvent,
        pendingDecision: nextDecision,
        gameState: 'playing'
      };
      saveState(newState);
    }
  }, [saveState]);

  const resetGame = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    localStorage.removeItem('essenza_game_state');
    setState(defaultState);
  }, []);

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
