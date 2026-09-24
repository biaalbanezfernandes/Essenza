import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './views/StartScreen';
import { GameDashboard } from './views/GameDashboard';
import { RoundResults } from './views/RoundResults';
import { FinalReport } from './views/FinalReport';
import { FuturisticBackground } from './components/FuturisticBackground';

const GameContent: React.FC = () => {
  const { state } = useGame();

  // Always scroll to top when changing game screen or round
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [state.gameState, state.currentRound]);

  return (
    <>
      <FuturisticBackground />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {(() => {
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
        })()}
      </div>
    </>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
