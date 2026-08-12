export interface Product {
  id: string;
  name: string;
  defaultPrice: number;
  productionCost: number;
  seasonality: 'Ano todo' | 'Inverno' | 'Verão';
  description: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative';
  category: 'marketing' | 'production' | 'materials' | 'logistics' | 'general';
  multiplier: number;
  affectedArea: string;
  scope?: 'player' | 'market';
}

export interface CompetitorState {
  name: string;
  cash: number;
  investments: {
    materials: number;
    production: number;
    marketing: number;
    logistics: number;
  };
  prices: { [productId: string]: number };
  productionQty: { [productId: string]: number };
  // Outputs calculated by the engine
  sales: { [productId: string]: number };
  revenue: number;
  costs: number;
  profit: number;
  marketShare: number;
  efficiency: number;
  quality: number;
  innovation: number;
  reputation: number;
  satisfaction: number;
}

export interface PlayerDecision {
  investments: {
    materials: number;
    production: number;
    marketing: number;
    logistics: number;
  };
  prices: { [productId: string]: number };
  productionQty: { [productId: string]: number };
}

export interface MarketShareInfo {
  player: number;
  rivalA: number;
  rivalB: number;
}

export interface ProductResult {
  productId: string;
  produced: number;
  demanded: number;
  sold: number;
  revenue: number;
  cost: number;
  profit: number;
  stockRemaining: number;
}

export interface RoundResult {
  round: number;
  event: GameEvent | null;
  playerDecision: PlayerDecision;
  playerMetrics: {
    cash: number;
    revenue: number;
    costs: number;
    profit: number;
    reputation: number;
    quality: number;
    innovation: number;
    satisfaction: number;
    efficiency: number;
    marketShare: number;
    ige: number;
    riskIndex: number;
    productResults: ProductResult[];
  };
  rivalA: CompetitorState;
  rivalB: CompetitorState;
  ssisFeedback: {
    diagnostic: string;
    recommendation: string;
    forecast: string;
    pedagogicalGrade: {
      planning: number;
      finance: number;
      people: number;
      innovation: number;
    };
  };
  councilFeedback: {
    rocha: string; // Financeiro (Conservador)
    luna: string;  // Marketing (Agressiva)
    vane: string;  // Operações (Pragmática)
  };
}

export interface GameState {
  playerName: string;
  playerEmail: string;
  currentRound: number;
  currentCash: number;
  reputation: number;
  quality: number;
  innovation: number;
  satisfaction: number;
  efficiency: number;
  marketShare: number;
  history: RoundResult[];
  gameState: 'start' | 'playing' | 'results' | 'final_report';
  activeEvent: GameEvent | null;
  pendingDecision: PlayerDecision;
}
