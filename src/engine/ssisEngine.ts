// Final Game Result Taxonomy - S.S.I.S. Executive Profile Classifier
export interface ManagementProfile {
  profileName: string;
  emoji: string;
  subtitle: string;
  description: string;
  strengths: string[];
  executiveAdvice: string;
}

export function classifyManagementProfile(history: RoundResult[]): ManagementProfile {
  let totalMaterials = 0;
  let totalProduction = 0;
  let totalMarketing = 0;
  let totalLogistics = 0;
  let totalProfit = 0;
  let totalRevenue = 0;
  let finalCash = 500000;
  let avgIGE = 0;
  let avgQuality = 0;
  let avgReputation = 0;

  history.forEach((h) => {
    totalMaterials += h.playerDecision.investments.materials;
    totalProduction += h.playerDecision.investments.production;
    totalMarketing += h.playerDecision.investments.marketing;
    totalLogistics += h.playerDecision.investments.logistics;
    totalProfit += h.playerMetrics.profit;
    totalRevenue += h.playerMetrics.revenue;
    avgIGE += h.playerMetrics.ige;
    avgQuality += h.playerMetrics.quality;
    avgReputation += h.playerMetrics.reputation;
    finalCash = h.playerMetrics.cash;
  });

  const roundsCount = history.length || 1;
  avgIGE = Math.round(avgIGE / roundsCount);
  avgQuality = Math.round(avgQuality / roundsCount);
  avgReputation = Math.round(avgReputation / roundsCount);

  const totalInv = totalMaterials + totalProduction + totalMarketing + totalLogistics;
  const prodPct = totalInv > 0 ? totalProduction / totalInv : 0;
  const mktPct = totalInv > 0 ? totalMarketing / totalInv : 0;
  const logPct = totalInv > 0 ? totalLogistics / totalInv : 0;
  const matPct = totalInv > 0 ? totalMaterials / totalInv : 0;

  // 1. High-Performance Executive & Scale
  if (totalProfit > 120000 && finalCash > 550000 && mktPct > 0.22) {
    return {
      profileName: 'CEO Estrategista de Alta Performance',
      emoji: '🏆',
      subtitle: 'Excelência Comercial, Escala de Margem & Liderança de Mercado',
      description: 'Sua gestão na Essenza foi caracterizada por um equilíbrio magistral entre expansão agressiva de receita e preservação rigorosa da saúde financeira. Você soube calibrar a força da marca com uma cadeia de suprimentos ágil, superando os concorrentes e transformando a Essenza em uma potência do setor.',
      strengths: [
        'Excelente relação de Retorno sobre Investimento (ROI)',
        'Visão holística entre produção, preço e expansão de mercado',
        'Capacidade de capturar market share sem comprometer o caixa'
      ],
      executiveAdvice: 'Mantenha esse ímpeto de liderança investindo continuamente no valor de marca a longo prazo para criar barreiras inabaláveis contra novos entrantes.'
    };
  }

  // 2. High Margin & Luxury Brand Master
  if (avgQuality > 72 && avgReputation > 70 && matPct > 0.28) {
    return {
      profileName: 'Mestre do Posicionamento Premium & Valor Agregado',
      emoji: '💎',
      subtitle: 'Foco na Excelência do Produto, Experiência da Marca & Margens Elevadas',
      description: 'Você conduziu a Essenza pela trilha do luxo acessível e da alta sofisticação. Em vez de entrar em uma guerra destrutiva de preços por volume, sua tomada de decisão garantiu tecidos de primeira linha, acabamento superior e reputação impecável junto ao consumidor exigente.',
      strengths: [
        'Construção de valor intangível de marca superior à média',
        'Lealdade do cliente ancorada em qualidade e acabamento',
        'Proteção contra guerras de preços pelo apelo exclusivo'
      ],
      executiveAdvice: 'Explore coleções cápsula e edições limitadas para aumentar ainda mais o preço médio por peça e maximizar o valor vitalício do cliente (LTV).'
    };
  }

  // 3. Disruptive Growth & Market Disruption
  if (mktPct > 0.38 || (totalRevenue > 600000 && mktPct > 0.3)) {
    return {
      profileName: 'Líder Disruptivo & Expansão de Mercado',
      emoji: '🚀',
      subtitle: 'Domínio de Canais, Marketing Agressivo & Tráfego Qualificado',
      description: 'Sua marca registrada na simulação foi a coragem e a agressividade comercial. Você enxergou o marketing não como um custo, mas como o principal motor de crescimento da Essenza. Suas campanhas massivas sufocaram a concorrência e colocaram a empresa no topo do recall da marca.',
      strengths: [
        'Agressividade tática e domínio dos canais de divulgação',
        'Capacidade de gerar alta demanda reprimida rapidamente',
        'Visão orientada ao crescimento de Top-Line (Faturamento)'
      ],
      executiveAdvice: 'Garanta que a infraestrutura logística e o planejamento de matéria-prima acompanhem a força das campanhas para evitar rupturas de estoque.'
    };
  }

  // 4. Financial Capital Guardian
  if (finalCash > 580000 || totalInv < 200000) {
    return {
      profileName: 'Guardião da Saúde Financeira & Solidez de Capital',
      emoji: '🛡️',
      subtitle: 'Preservação de Caixa, Disciplina Fiscal & Gestão Racional de Riscos',
      description: 'Em um mercado repleto de incertezas e volatilidades econômicas, sua marca foi a estabilidade e a responsabilidade fiscal. Você manteve uma reserva financeira extremamente robusta na Essenza, garantindo proteção total contra eventuais crises ou choques de demanda.',
      strengths: [
        'Saúde de caixa e liquidez imediatas impecáveis',
        'Rigor financeiro e aversão a desperdícios operacionais',
        'Proteção absoluta contra alavancagem excessiva'
      ],
      executiveAdvice: 'Lembre-se de que o caixa parado também possui custo de oportunidade. Na próxima rodada, busque reinvestir pequenos percentuais do capital em inovação acelerada.'
    };
  }

  // 5. Operations & Factory Scale Architect
  if (prodPct > 0.34 || (logPct > 0.28 && prodPct > 0.28)) {
    return {
      profileName: 'Arquiteto da Eficiência Operacional & Escala',
      emoji: '⚙️',
      subtitle: 'Engenharia de Processos, Logística Ágil & Sincronia Fabril',
      description: 'Sua liderança foi pautada pelo chão de fábrica e pela eficiência de entrega. Você organizou os processos de forma cirúrgica, alocando recursos em capacidade instalada, qualificação e logística para garantir que cada peça produzida chegasse com rapidez ao destino final.',
      strengths: [
        'Sincronismo de produção e mitigação de estoques ociosos',
        'Eficiência logístico-operacional e fluxo de entrega contínuo',
        'Domínio da cadeia de suprimentos (Supply Chain)'
      ],
      executiveAdvice: 'Alie sua potência operacional a uma estratégia de comunicação mais forte para garantir que a demanda do mercado absorva 100% da sua capacidade fabril.'
    };
  }

  // 6. Purpose-Driven & Humanized Management
  if (avgIGE >= 70 && matPct > 0.25) {
    return {
      profileName: 'Gestor Humanizado & Marcas com Propósito',
      emoji: '🤝',
      subtitle: 'Valorização de Pessoas, Sustentabilidade & Equilíbrio Organizacional',
      description: 'Sua gestão uniu resultados comerciais ao desenvolvimento humano e à governança consciente. Você provou que uma empresa de moda sustentável e com clima organizacional saudável é capaz de encantar clientes e gerar retorno financeiro sólido.',
      strengths: [
        'Alto engajamento interno e motivação das equipes',
        'Impacto positivo na percepção ética da marca',
        'Crescimento orgânico sustentável e resiliente'
      ],
      executiveAdvice: 'Divulgue suas práticas socioambientais e trabalhistas como diferencial competitivo no marketing para atrair o consumidor da Geração Z.'
    };
  }

  // 7. Balanced Strategic Architect (Default Hybrid)
  return {
    profileName: 'Arquiteto Estratégico Holístico',
    emoji: '🎯',
    subtitle: 'Visão 360°, Tomada de Decisão Equilibrada & Adaptabilidade',
    description: 'Sua atuação à frente da Essenza demonstrou maturidade executiva e flexibilidade. Você soube distribuir recursos harmoniosamente entre suprimentos, produção, divulgação e distribuição, demonstrando frieza para ajustar rotas conforme as oscilações de mercado.',
    strengths: [
      'Equilíbrio entre investimento em receita e controle de custos',
      'Flexibilidade estratégica para responder a eventos imprevisíveis',
      'Visão integrada de todas as áreas de negócios'
    ],
    executiveAdvice: 'Identifique a alavanca de maior potencial da sua coleção e concentre um investimento adicional nela para impulsionar ainda mais seus lucros.'
  };
}
