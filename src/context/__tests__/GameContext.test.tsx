import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GameProvider, useGame } from '../../context/GameContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}

describe('GameContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('provides default state on mount', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    expect(result.current.state.gameState).toBe('start');
    expect(result.current.state.currentCash).toBe(500000);
    expect(result.current.state.currentRound).toBe(1);
    expect(result.current.state.playerName).toBe('');
  });

  it('starts game with player name and email', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Test Player', 'test@example.com');
    });

    expect(result.current.state.playerName).toBe('Test Player');
    expect(result.current.state.playerEmail).toBe('test@example.com');
    expect(result.current.state.gameState).toBe('playing');
    expect(result.current.state.activeEvent).not.toBeNull();
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Player 1', 'p1@example.com');
    });

    // Advance past the debounce timer
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('updates pending decision immutably', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Player', 'p@test.com');
    });

    const prevDecision = result.current.state.pendingDecision;

    act(() => {
      result.current.updatePendingDecision(prev => ({
        ...prev,
        investments: { ...prev.investments, marketing: 100000 },
      }));
    });

    expect(result.current.state.pendingDecision.investments.marketing).toBe(100000);
    expect(prevDecision.investments.marketing).toBe(40000);
  });

  it('submits round decision and transitions to results', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Player', 'p@test.com');
    });

    act(() => {
      result.current.submitRoundDecision();
    });

    expect(result.current.state.gameState).toBe('results');
    expect(result.current.state.history.length).toBe(1);
    expect(result.current.state.history[0].ssisFeedback).toBeDefined();
    expect(result.current.state.history[0].councilFeedback).toBeDefined();
  });

  it('advances to next round', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Player', 'p@test.com');
    });

    act(() => {
      result.current.submitRoundDecision();
    });

    act(() => {
      result.current.nextRound();
    });

    expect(result.current.state.currentRound).toBe(2);
    expect(result.current.state.gameState).toBe('playing');
  });

  it('goes to final_report after round 3', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Player', 'p@test.com');
    });

    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.submitRoundDecision();
      });
      if (i < 2) {
        act(() => {
          result.current.nextRound();
        });
      }
    }

    act(() => {
      result.current.nextRound();
    });

    expect(result.current.state.gameState).toBe('final_report');
    expect(result.current.state.history.length).toBe(3);
  });

  it('resets game to initial state', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.startGame('Player', 'p@test.com');
    });

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.state.gameState).toBe('start');
    expect(result.current.state.playerName).toBe('');
    expect(result.current.state.history.length).toBe(0);
  });

  it('throws when useGame is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useGame());
    }).toThrow('useGame must be used within a GameProvider');

    spy.mockRestore();
  });
});
