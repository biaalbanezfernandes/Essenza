import React from 'react';

interface RadarChartProps {
  playerData: {
    profit: number;
    reputation: number;
    quality: number;
    innovation: number;
    satisfaction: number;
    share: number;
  };
  rivalAData: {
    profit: number;
    reputation: number;
    quality: number;
    innovation: number;
    satisfaction: number;
    share: number;
  };
  rivalBData: {
    profit: number;
    reputation: number;
    quality: number;
    innovation: number;
    satisfaction: number;
    share: number;
  };
}

export const RadarChart: React.FC<RadarChartProps> = ({ playerData, rivalAData, rivalBData }) => {
  const width = 300;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 100;

  const axes = [
    { name: 'Lucratividade', key: 'profit' },
    { name: 'Reputação', key: 'reputation' },
    { name: 'Qualidade', key: 'quality' },
    { name: 'Inovação', key: 'innovation' },
    { name: 'Satisfação', key: 'satisfaction' },
    { name: 'Market Share', key: 'share' },
  ];

  // Helper to normalize variables to 0-100 scale for plotting
  const normalize = (val: number, key: string): number => {
    if (key === 'profit') {
      // Scale from -R$50k (0) to R$150k+ (100)
      const norm = ((val + 50000) / 200000) * 100;
      return Math.min(100, Math.max(10, norm));
    }
    if (key === 'share') {
      // Scale from 0% (0) to 60% (100)
      const norm = (val / 0.6) * 100;
      return Math.min(100, Math.max(10, norm));
    }
    return Math.min(100, Math.max(10, val));
  };

  // Convert polar coordinates to Cartesian
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / axes.length) * index - Math.PI / 2;
    const x = cx + radius * (value / 100) * Math.cos(angle);
    const y = cy + radius * (value / 100) * Math.sin(angle);
    return { x, y };
  };

  // Draw regular polygon background grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map(level => {
    const points = axes.map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Calculate coordinates for Player, Rival A, and Rival B
  const getPathPoints = (data: typeof playerData) => {
    return axes.map((axis, i) => {
      let rawVal = 0;
      if (axis.key === 'profit') rawVal = data.profit;
      else if (axis.key === 'reputation') rawVal = data.reputation;
      else if (axis.key === 'quality') rawVal = data.quality;
      else if (axis.key === 'innovation') rawVal = data.innovation;
      else if (axis.key === 'satisfaction') rawVal = data.satisfaction;
      else if (axis.key === 'share') rawVal = data.share;
      
      const normVal = normalize(rawVal, axis.key);
      const { x, y } = getCoordinates(i, normVal);
      return `${x},${y}`;
    }).join(' ');
  };

  const playerPoints = getPathPoints(playerData);
  const rivalAPoints = getPathPoints(rivalAData);
  const rivalBPoints = getPathPoints(rivalBData);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Grid Circles */}
        {gridPaths.map((points, index) => (
          <polygon
            key={index}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines and Labels */}
        {axes.map((axis, i) => {
          const outerPoint = getCoordinates(i, 100);
          const labelOffset = 22;
          const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
          const lx = cx + (radius + labelOffset) * Math.cos(angle);
          const ly = cy + (radius + labelOffset) * Math.sin(angle);
          
          let textAnchor: "start" | "inherit" | "end" | "middle" | undefined = 'middle';
          if (Math.cos(angle) > 0.1) textAnchor = 'start';
          if (Math.cos(angle) < -0.1) textAnchor = 'end';

          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly}
                fill="rgba(255, 255, 255, 0.7)"
                fontSize="10"
                fontFamily="var(--font-display)"
                fontWeight="500"
                textAnchor={textAnchor}
                alignmentBaseline="middle"
              >
                {axis.name}
              </text>
            </g>
          );
        })}

        {/* Rival A Polygon (Low Price) */}
        <polygon
          points={rivalAPoints}
          fill="rgba(239, 68, 68, 0.1)"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="3,3"
        />

        {/* Rival B Polygon (Premium) */}
        <polygon
          points={rivalBPoints}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="3,3"
        />

        {/* Player Polygon (Essenza) */}
        <polygon
          points={playerPoints}
          fill="rgba(212, 175, 55, 0.22)"
          stroke="#d4af37"
          strokeWidth="2.5"
        />

        {/* Data points dots for Player */}
        {axes.map((axis, i) => {
          let rawVal = 0;
          if (axis.key === 'profit') rawVal = playerData.profit;
          else if (axis.key === 'reputation') rawVal = playerData.reputation;
          else if (axis.key === 'quality') rawVal = playerData.quality;
          else if (axis.key === 'innovation') rawVal = playerData.innovation;
          else if (axis.key === 'satisfaction') rawVal = playerData.satisfaction;
          else if (axis.key === 'share') rawVal = playerData.share;
          const { x, y } = getCoordinates(i, normalize(rawVal, axis.key));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#d4af37"
              stroke="#060913"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Custom Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(212, 175, 55, 0.3)', border: '2.5px solid #d4af37', borderRadius: '2px' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Essenza (Você)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1.5px dashed #ef4444', borderRadius: '2px' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Rival A (Volume)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1.5px dashed #3b82f6', borderRadius: '2px' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Rival B (Premium)</span>
        </div>
      </div>
    </div>
  );
};
