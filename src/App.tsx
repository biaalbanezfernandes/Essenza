import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './views/StartScreen';
import { GameDashboard } from './views/GameDashboard';
import { RoundResults } from './views/RoundResults';
import { FinalReport } from './views/FinalReport';

const GameContent: React.FC = () => {
  const { state } = useGame();

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
