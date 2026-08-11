import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './views/StartScreen';
import { GameDashboard } from './views/GameDashboard';
import { RoundResults } from './views/RoundResults';
import { FinalReport } from './views/FinalReport';

const GameContent: React.FC = () => {
  const { state } = useGame();

  // Always scroll to top when changing game screen or round
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [state.gameState, state.currentRound]);

  switch (state.gameState) {
    case 'start':
      return <StartScreen />;
    case 'playing':
      return <GameDashboard />;
    case 'results':
      return <RoundResults />;
    case 'final_report':
      return <FinalReport />;
    default:
      return <StartScreen />;
  }
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
