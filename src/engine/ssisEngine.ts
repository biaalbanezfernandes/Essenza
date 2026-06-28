import type { RoundResult, PlayerDecision, GameEvent } from '../data/types';

export interface PedagogicalGrades {
  planning: number;
  finance: number;
  people: number;
  innovation: number;
}

export function generateSsisFeedback(
  round: number,
  decision: PlayerDecision,
  metrics: RoundResult['playerMetrics'],
  event: GameEvent | null,
  _rivalA: RoundResult['rivalA'],
  _rivalB: RoundResult['rivalB']
) {
  const profit = metrics.profit;
  const cash = metrics.cash;
  const reputation = metrics.reputation;
  const quality = metrics.quality;
  const innovation = metrics.innovation;
  const satisfaction = metrics.satisfaction;
  const efficiency = metrics.efficiency;

  // Find if there was any production bottleneck
  const totalProduced = metrics.productResults.reduce((acc, curr) => acc + curr.produced, 0);
  const totalStock = metrics.productResults.reduce((acc, curr) => acc + curr.stockRemaining, 0);

  // 1. Diagnostic
  let diagnostic = '';
  if (profit > 100000) {
    diagnostic = `Desempenho excelente nesta rodada! O lucro líquido superou as expectativas (R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Isso ocorreu porque sua estratégia de precificação encontrou equilíbrio perfeito com a demanda e o marketing impulsionou a reputação da marca para ${Math.round(reputation)} pontos.`;
  } else if (profit > 0) {
    diagnostic = `A Essenza fechou a rodada no azul com lucro de R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. A operação está estável, mas há margem para melhoria. `;
    if (totalStock > totalProduced * 0.3) {
      diagnostic += `Notamos um acúmulo de estoque preocupante (${totalStock} unidades paradas). O capital investido em matéria-prima e produção ficou imobilizado no estoque, limitando seu lucro líquido.`;
    } else {
      diagnostic += `Seu volume de vendas foi saudável, e a produção atendeu bem à demanda média do mercado.`;
    }
  } else {
    diagnostic = `A rodada encerrou com saldo negativo (prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). `;
    if (totalProduced === 0) {
      diagnostic += `Você não programou nenhuma produção nesta rodada, resultando em receita nula enquanto os custos fixos de marketing e logística consumiram seu capital. `;
    } else if (totalStock > totalProduced * 0.5) {
      diagnostic += `Houve excesso de produção ou precificação acima do mercado, gerando ${totalStock} peças em estoque e alto custo operacional não coberto pelas vendas. `;
    } else {
      diagnostic += `Os custos de investimento em marketing (R$ ${decision.investments.marketing.toLocaleString('pt-BR')}) e inovação foram muito altos em comparação ao retorno imediato em vendas. `;
    }
    if (event && event.type === 'negative') {
      diagnostic += ` Além disso, o evento "${event.title}" impactou negativamente seus resultados.`;
    }
  }

  // 2. Recommendations
  let recommendation = '';
  if (totalStock > totalProduced * 0.3) {
    recommendation = `Reduza o volume de produção nas categorias com muito estoque acumulado. Aumente moderadamente o investimento em Marketing para ajudar a escoar as peças paradas e considere uma leve redução temporária nos preços de venda.`;
  } else if (metrics.marketShare < 0.2) {
    recommendation = `Sua participação de mercado está baixa (${Math.round(metrics.marketShare * 100)}%). Sugerimos reforçar o orçamento de Marketing (atualmente em R$ ${decision.investments.marketing.toLocaleString('pt-BR')}) para competir com as campanhas agressivas dos concorrentes.`;
  } else if (quality < 60) {
    recommendation = `Para manter a imagem sofisticada da Essenza, inverte mais em Matéria-Prima e Produção. O conselho está preocupado com o indicador de qualidade de ${Math.round(quality)} pontos.`;
  } else if (cash < 100000) {
    recommendation = `Atenção ao fluxo de caixa! Seu saldo está baixo (R$ ${cash.toLocaleString('pt-BR')}). Evite grandes investimentos de expansão na próxima rodada e foque em produtos com alta margem e giro rápido, como a Camiseta Básica ou o Kit de Meia/Cueca.`;
  } else {
    recommendation = `Mantenha a consistência. A próxima rodada pode trazer novos eventos sazonais. Lembre-se de verificar a previsão de temperatura e investir em Logística e Inovação para blindar a marca contra crises de distribuição.`;
  }

  // 3. Forecast
  let forecast = '';
  if (round === 1) {
    forecast = `Para a Rodada 2, há uma forte tendência de inverno no radar. Produtos térmicos como o Moletom deverão ter sua demanda quadruplicada. Certifique-se de ter estoque suficiente para esse pico sazonal.`;
  } else if (round === 2) {
    forecast = `A Rodada 3 será o Verão. A demanda por Moletons cairá bruscamente, enquanto vestidos de linho e camisetas leves terão enorme procura. Planeje seus estoques de acordo para evitar perdas ou ruptura de demanda.`;
  } else {
    forecast = `A simulação está concluída. O S.S.I.S. prevê que, mantendo estes parâmetros de qualidade e gestão financeira, a Essenza alcançará liderança e estabilidade no mercado nacional em curto prazo.`;
  }

  // 4. Pedagogical Grades (0-10)
  const planningGrade = Math.round(
    Math.min(10, Math.max(2, 
      (totalProduced > 0 && totalStock / totalProduced < 0.25 ? 9.5 : 6) + 
      (round === 2 && decision.productionQty['moletom'] > 1500 ? 1 : 0) - 
      (totalStock / (totalProduced + 1) > 0.5 ? 2.5 : 0)
    )) * 10) / 10;

  const financeGrade = Math.round(
    Math.min(10, Math.max(1, 
      profit > 100000 ? 9.8 : profit > 0 ? 8.0 : cash < 50000 ? 3.0 : 5.5
    )) * 10) / 10;

  const peopleGrade = Math.round(
    Math.min(10, Math.max(2, 
      satisfaction / 10
    )) * 10) / 10;

  const innovationGrade = Math.round(
    Math.min(10, Math.max(2, 
      (innovation / 10) + (efficiency > 70 ? 1 : 0)
    )) * 10) / 10;

  return {
    diagnostic,
    recommendation,
    forecast,
    pedagogicalGrade: {
      planning: planningGrade,
      finance: financeGrade,
      people: peopleGrade,
      innovation: innovationGrade
    }
  };
}

// Generate Council Members dialogues
export function generateCouncilFeedback(
  decision: PlayerDecision,
  metrics: RoundResult['playerMetrics'],
  _event: GameEvent | null
) {
  const profit = metrics.profit;
  const cash = metrics.cash;
  const quality = metrics.quality;
  const efficiency = metrics.efficiency;
  const reputation = metrics.reputation;

  // Sr. Rocha (Diretor Financeiro, Conservador)
  let rocha = '';
  if (cash < 80000) {
    rocha = `Alerta vermelho! Nosso caixa está em R$ ${cash.toLocaleString('pt-BR')}. Precisamos cortar custos imediatamente e não gastar mais do que faturamos na próxima rodada!`;
  } else if (profit > 100000) {
    rocha = `Excelente rodada. Um lucro de R$ ${profit.toLocaleString('pt-BR')} solidifica nossa posição de liquidez. Continuem com essa disciplina fiscal.`;
  } else if (profit < 0) {
    rocha = `Prejuízo inaceitável de R$ ${Math.abs(profit).toLocaleString('pt-BR')}. Gastamos demais em investimentos abstratos e não geramos receita suficiente. Reduzam a exposição ao risco.`;
  } else {
    rocha = `Resultado razoável, mas a rentabilidade sobre os investimentos realizados está apertada. Precisamos otimizar nossa margem de lucro.`;
  }

  // Dra. Luna (Diretora de Marketing, Agressiva)
  let luna = '';
  const marketingInv = decision.investments.marketing;
  if (marketingInv < 40000) {
    luna = `Estamos invisíveis no mercado! Apenas R$ ${marketingInv.toLocaleString('pt-BR')} em marketing é um erro grave. Os concorrentes estão nos engolindo em reputação!`;
  } else if (reputation > 75) {
    luna = `Que espetáculo de engajamento! A Essenza está se tornando um ícone da moda casual refinada. Nossa marca nunca esteve tão forte.`;
  } else {
    luna = `Precisamos de mais ousadia comercial. O mercado é dinâmico e quem lidera as tendências capta os clientes de maior valor. Recomendo aumentar o orçamento de marketing.`;
  }

  // Eng. Vane (Diretor de Operações, Pragmática)
  let vane = '';
  const totalStock = metrics.productResults.reduce((acc, curr) => acc + curr.stockRemaining, 0);
  if (totalStock > 2000) {
    vane = `Temos um grande problema de ociosidade e estoque: ${totalStock} peças estocadas geram custo de armazenagem elevado e mostram falta de sincronia entre fábrica e vendas.`;
  } else if (quality > 75 && efficiency > 70) {
    vane = `Parabéns ao time da fábrica. Nossos índices de qualidade (${Math.round(quality)}) e eficiência operacional (${Math.round(efficiency)}) estão perfeitamente ajustados aos padrões premium.`;
  } else {
    vane = `Nossa eficiência de produção precisa melhorar. Sugiro um foco maior no investimento em Logística e Inovação para otimizar os fluxos produtivos e evitar desperdício de matéria-prima.`;
  }

  return { rocha, luna, vane };
}

// Generate the Round's Corporate Newspaper Paragraph
export function generateRoundNewspaper(
  round: number,
  metrics: RoundResult['playerMetrics'],
  event: GameEvent | null,
  rivalA: RoundResult['rivalA'],
  rivalB: RoundResult['rivalB']
): string {
  let text = '';
  if (round === 1) {
    text = `O mercado de moda casual iniciou o ano com forte concorrência. A Essenza registrou receita de R$ ${metrics.revenue.toLocaleString('pt-BR')} e conquistou ${Math.round(metrics.marketShare * 100)}% de market share. `;
    if (event) {
      text += `A rodada foi marcada pelo evento "${event.title}", que mudou a dinâmica das vendas de varejo e afetou a cadeia produtiva nacional. `;
    }
    if (metrics.profit > 0) {
      text += `Analistas apontam a Essenza como uma das promessas do setor após registrar balanço positivo.`;
    } else {
      text += `A empresa enfrentou pressões financeiras iniciais, mas investidores confiam em uma reestruturação para a próxima rodada.`;
    }
  } else if (round === 2) {
    text = `A segunda rodada da simulação empresarial foi sob forte clima de inverno. As vendas de moletons dispararam em todo o país. A Essenza respondeu com investimentos expressivos e alcançou faturamento de R$ ${metrics.revenue.toLocaleString('pt-BR')}. `;
    if (rivalA.profit > metrics.profit && rivalA.profit > rivalB.profit) {
      text += `O concorrente Rival A se destacou no mercado de alto volume nesta rodada com preços competitivos. `;
    } else if (rivalB.profit > metrics.profit) {
      text += `A marca premium Rival B colheu frutos de sua forte identidade de marca e investimentos pesados em marketing de luxo. `;
    } else {
      text += `A Essenza superou seus concorrentes diretos em termos de lucratividade e inovação nesta temporada de inverno. `;
    }
  } else {
    text = `A temporada de verão fechou o ciclo de simulação empresarial. Diante de oscilações na demanda global e novos eventos econômicos, a Essenza consolidou sua presença no mercado acumulando um caixa final de R$ ${metrics.cash.toLocaleString('pt-BR')}. `;
    text += `A jornada de tomada de decisões estratégicas evidenciou a importância de equilibrar qualidade, preços adequados e investimentos ágeis em marketing digital.`;
  }
  return text;
}

// Final Game Result Taxonomy Scorpio Classifier
export function classifyManagementProfile(history: RoundResult[]): {
  profileName: string;
  emoji: string;
  description: string;
} {
  // Sum up all investments made by player over 3 rounds
  let totalMaterials = 0;
  let totalProduction = 0;
  let totalMarketing = 0;
  let totalLogistics = 0;
  let finalCash = 500000;

  history.forEach((h) => {
    totalMaterials += h.playerDecision.investments.materials;
    totalProduction += h.playerDecision.investments.production;
    totalMarketing += h.playerDecision.investments.marketing;
    totalLogistics += h.playerDecision.investments.logistics;
    finalCash = h.playerMetrics.cash;
  });

  const totalInv = totalMaterials + totalProduction + totalMarketing + totalLogistics;
  if (totalInv === 0) {
    return {
      profileName: 'Conservador Financeiro',
      emoji: '💼',
      description: 'Você preferiu manter o caixa intacto e correr o menor risco possível. Sua gestão foca na preservação extrema do capital, embora tenha sacrificado oportunidades de expansão de mercado.'
    };
  }

  const prodPct = totalProduction / totalInv;
  const mktPct = totalMarketing / totalInv;
  const logPct = totalLogistics / totalInv;

  if (finalCash > 600000 && mktPct < 0.25) {
    return {
      profileName: 'Conservador Financeiro',
      emoji: '💼',
      description: 'Foco absoluto em segurança líquida, controle rígido de despesas e estabilidade monetária. A empresa encerrou com excelente saúde de caixa, contudo poderia ter crescido mais agressivamente.'
    };
  }

  if (mktPct > 0.4) {
    return {
      profileName: 'Dominador de Mercado',
      emoji: '🚀',
      description: 'Sua estratégia foi focada na expansão agressiva de marca e captação de clientes. Com investimentos dominantes em marketing, você priorizou market share e visibilidade.'
    };
  }

  if (logPct > 0.35) {
    return {
      profileName: 'Visionário Inovador',
      emoji: '💡',
      description: 'Sua gestão priorizou a modernização de canais de entrega, inovação nos tecidos e tecnologia operacional. Você acredita que a diferenciação pelo valor agregado é a chave para o sucesso duradouro.'
    };
  }

  if (prodPct > 0.35 && totalMaterials > totalMarketing) {
    return {
      profileName: 'Executor Operacional',
      emoji: '⚙️',
      description: 'Foco na engenharia de fábrica, capacidade de fabricação e satisfação operacional da equipe. Você garantiu entregas robustas com boa eficiência operacional interna.'
    };
  }

  if (totalMaterials > totalMarketing && totalProduction > totalMarketing) {
    return {
      profileName: 'Gestor Humanizado',
      emoji: '🤝',
      description: 'Foco em salários adequados, satisfação interna dos colaboradores e qualidade do produto. Sua gestão buscou criar valor a partir de um ecossistema produtivo ético e motivado.'
    };
  }

  return {
    profileName: 'Arquiteto Estratégico',
    emoji: '🎯',
    description: 'Gestão equilibrada e integrada. Você conseguiu ponderar muito bem os investimentos entre fornecimento de matéria-prima, marketing, eficiência fabril e inovação tecnológica, gerando ótimos resultados gerais.'
  };
}
