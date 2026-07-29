import type { RoundResult, PlayerDecision, GameEvent } from '../data/types';
import { products } from '../data/products';

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
  rivalA: RoundResult['rivalA'],
  rivalB: RoundResult['rivalB'],
  playerEmail: string
) {
  const profit = metrics.profit;
  const cash = metrics.cash;
  const quality = metrics.quality;
  const innovation = metrics.innovation;
  const satisfaction = metrics.satisfaction;
  const efficiency = metrics.efficiency;

  // Find if there was any production bottleneck
  const totalProduced = metrics.productResults.reduce((acc, curr) => acc + curr.produced, 0);
  const totalStock = metrics.productResults.reduce((acc, curr) => acc + curr.stockRemaining, 0);

  // Find top-performing product by revenue
  let topRevenueProduct = '';
  let maxRevenue = -1;
  
  // Find product with highest stock remaining
  let worstStockProduct = '';
  let worstStockProductId = '';
  let maxStockRemaining = 0;
  
  // Find product with highest lost sales (demanded > sold)
  let worstLostSalesProduct = '';
  let maxLostSales = 0;
  
  // Find if any product was sold at a price below production cost
  let underpricedProduct = '';
  // Check if margin is too thin
  let thinMarginProduct = '';
  let thinMarginVal = 0;

  metrics.productResults.forEach((pr) => {
    const prodInfo = products.find(p => p.id === pr.productId);
    if (pr.revenue > maxRevenue) {
      maxRevenue = pr.revenue;
      topRevenueProduct = prodInfo ? prodInfo.name : pr.productId;
    }
    if (pr.stockRemaining > maxStockRemaining) {
      maxStockRemaining = pr.stockRemaining;
      worstStockProduct = prodInfo ? prodInfo.name : pr.productId;
      worstStockProductId = pr.productId;
    }
    const lost = pr.demanded - pr.sold;
    if (lost > maxLostSales) {
      maxLostSales = lost;
      worstLostSalesProduct = prodInfo ? prodInfo.name : pr.productId;
    }
    if (prodInfo) {
      const price = decision.prices[pr.productId] || prodInfo.defaultPrice;
      if (price < prodInfo.productionCost) {
        underpricedProduct = prodInfo.name;
      } else {
        const margin = price - prodInfo.productionCost;
        const marginPercent = (margin / price) * 100;
        if (marginPercent < 22 && pr.produced > 0) {
          thinMarginProduct = prodInfo.name;
          thinMarginVal = marginPercent;
        }
      }
    }
  });

  const maxCompetitorProfit = Math.max(rivalA.profit, rivalB.profit);
  const bestCompetitorName = rivalA.profit > rivalB.profit ? 'Rival A (Volume)' : 'Rival B (Premium)';

  // 1. Diagnostic
  let diagnostic = '';
  if (profit > 100000) {
    diagnostic = `Desempenho excelente nesta rodada! O lucro líquido alcançou R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `;
    if (topRevenueProduct) {
      diagnostic += `O grande destaque foi o/a **${topRevenueProduct}**, liderando vendas com R$ ${maxRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em receita. `;
    }
    if (profit > maxCompetitorProfit) {
      diagnostic += `Você superou todos os concorrentes e obteve o melhor resultado financeiro do mercado! `;
    } else {
      diagnostic += `Apesar do ótimo lucro, o **${bestCompetitorName}** faturou R$ ${maxCompetitorProfit.toLocaleString('pt-BR')} no mesmo período. `;
    }
  } else if (profit > 0) {
    diagnostic = `A Essenza fechou a rodada no azul com lucro líquido de R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. `;
    if (topRevenueProduct) {
      diagnostic += `O principal pilar de vendas foi o/a **${topRevenueProduct}** (R$ ${maxRevenue.toLocaleString('pt-BR')} de faturamento). `;
    }
    if (maxStockRemaining > 0 && worstStockProduct) {
      diagnostic += `Contudo, o desempenho geral foi freado pelo acúmulo de estoque em **${worstStockProduct}** (${maxStockRemaining} unidades paradas), imobilizando capital de giro essencial na fábrica. `;
    }
    if (maxCompetitorProfit > profit) {
      diagnostic += `O **${bestCompetitorName}** liderou a rodada com lucro de R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}. `;
    }
  } else {
    diagnostic = `A rodada encerrou com saldo negativo (prejuízo de R$ ${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). `;
    if (totalProduced === 0) {
      diagnostic += `Não houve programação de produção nesta rodada, gerando receita nula enquanto os custos operacionais drenaram o caixa. `;
    } else if (maxStockRemaining > totalProduced * 0.3 && worstStockProduct) {
      diagnostic += `O principal fator foi o excesso de estoque de **${worstStockProduct}** (${maxStockRemaining} unidades não vendidas), indicando que a produção superou muito a demanda ou que seu preço ficou desalinhado. `;
    } else {
      diagnostic += `Os investimentos em Marketing (R$ ${decision.investments.marketing.toLocaleString('pt-BR')}) e Operações pesaram mais do que o retorno imediato gerado pelo faturamento. `;
    }
    diagnostic += `Enquanto isso, o **${bestCompetitorName}** liderou com lucro de R$ ${maxCompetitorProfit.toLocaleString('pt-BR')}. `;
  }

  // Price analysis comparison against competitors for worst stock product
  if (maxStockRemaining > 200 && worstStockProductId) {
    const playerPrice = decision.prices[worstStockProductId];
    const rAPrice = rivalA.prices[worstStockProductId];
    const rBPrice = rivalB.prices[worstStockProductId];
    if (playerPrice > rAPrice && playerPrice > rBPrice) {
      diagnostic += ` Seu preço para o/a **${worstStockProduct}** (R$ ${playerPrice.toFixed(2)}) foi o mais caro do mercado, facilitando a atração de clientes pelos rivais (Rival A: R$ ${rAPrice.toFixed(2)}, Rival B: R$ ${rBPrice.toFixed(2)}).`;
    }
  }

  if (maxLostSales > 100 && worstLostSalesProduct) {
    diagnostic += ` Notamos também uma ruptura de estoque expressiva em **${worstLostSalesProduct}**: você perdeu a oportunidade de vender aproximadamente ${Math.round(maxLostSales)} unidades adicionais por falta de estoque disponível.`;
  }

  if (event) {
    diagnostic += ` O evento de mercado "${event.title}" alterou a dinâmica desta rodada, afetando a área de ${event.affectedArea} com um impacto direto nas vendas.`;
  }

  // 2. Recommendations
  let recommendation = '';
  const recommendationsList: string[] = [];

  if (underpricedProduct) {
    recommendationsList.push(`Você está vendendo o/a **${underpricedProduct}** abaixo do custo de fabricação. Aumente o preço imediatamente para evitar prejuízos unitários.`);
  } else if (thinMarginProduct) {
    recommendationsList.push(`A margem do/a **${thinMarginProduct}** está muito espremida (${thinMarginVal.toFixed(1)}%). Reajuste o preço ou diminua custos operacionais de fabricação.`);
  }

  if (maxLostSales > 150 && worstLostSalesProduct) {
    recommendationsList.push(`Aumente a produção do/a **${worstLostSalesProduct}** para a próxima rodada para suprir a demanda reprimida (${Math.round(maxLostSales)} unidades perdidas).`);
  }

  if (maxStockRemaining > 300 && worstStockProduct) {
    recommendationsList.push(`Reduza a produção de **${worstStockProduct}** para escoar as ${maxStockRemaining} peças que já estão acumuladas no estoque.`);
    const worstProductInfo = products.find(p => p.name === worstStockProduct);
    if (worstProductInfo) {
      const currentPrice = decision.prices[worstProductInfo.id] || worstProductInfo.defaultPrice;
      if (currentPrice > worstProductInfo.defaultPrice * 1.1) {
        recommendationsList.push(`Considere reduzir levemente o preço do/a **${worstStockProduct}** (atualmente R$ ${currentPrice.toFixed(2)}) para incentivar a saída.`);
      }
    }
  }

  if (metrics.marketShare < 0.22) {
    recommendationsList.push(`Sua participação de mercado está tímida (${Math.round(metrics.marketShare * 100)}%). Aumente o orçamento de Marketing (atualmente R$ ${decision.investments.marketing.toLocaleString('pt-BR')}) para competir com os rivais.`);
  }

  if (quality < 65) {
    recommendationsList.push(`Melhore a qualidade da sua grife investindo mais em Matéria-Prima (atualmente R$ ${decision.investments.materials.toLocaleString('pt-BR')}).`);
  }

  if (cash < 100000) {
    recommendationsList.push(`Atenção ao fluxo de caixa de R$ ${cash.toLocaleString('pt-BR')}! Evite expansões arriscadas na próxima rodada.`);
  }

  if (recommendationsList.length > 0) {
    recommendation = recommendationsList.slice(0, 3).join(' ');
  } else {
    recommendation = `Mantenha a consistência atual. Monitore as tendências de temperatura nas previsões do conselho para ajustar a produção dos itens sazonais antes que a estação mude.`;
  }

  // Local Cognitive Memory Engine Training Analyser
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const playerRunsKey = `essenza_cognitive_runs_${playerEmail}`;
      const historyRunsStr = window.localStorage.getItem(playerRunsKey);
      if (historyRunsStr) {
        const historyRuns = JSON.parse(historyRunsStr);
        if (historyRuns.length > 0) {
          const totalProfitHistory = historyRuns.reduce((acc: number, r: any) => acc + (r.totalProfit || 0), 0);
          const avgProfitHistory = totalProfitHistory / historyRuns.length;
          const bestProfit = Math.max(...historyRuns.map((r: any) => r.totalProfit || 0));

          recommendation += `\n\n🤖 **[Modelo Cognitivo - Treinamento Histórico]**: Analisamos sua performance comparada a **${historyRuns.length}** simulações passadas. `;
          if (profit > avgProfitHistory) {
            recommendation += `Seu lucro nesta rodada superou a média histórica das suas simulações (R$ ${Math.round(avgProfitHistory).toLocaleString('pt-BR')}). O modelo cognitivo identificou aprendizado e consolidação tática de mercado!`;
          } else {
            recommendation += `Seu lucro ficou abaixo da sua média histórica (R$ ${Math.round(avgProfitHistory).toLocaleString('pt-BR')}) e seu recorde pessoal é R$ ${Math.round(bestProfit).toLocaleString('pt-BR')}. Recomenda-se ajustar as margens comparando com as rodadas anteriores.`;
          }
        }
      }
    }
  } catch (err) {
    // Ignore sandbox/localStorage issues
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

  // Find top product and stock facts
  let worstStockProduct = '';
  let maxStockRemaining = 0;
  let worstLostSalesProduct = '';
  let maxLostSales = 0;
  let topRevenueProduct = '';
  let maxRevenue = -1;

  metrics.productResults.forEach((pr) => {
    const prodInfo = products.find(p => p.id === pr.productId);
    if (pr.revenue > maxRevenue) {
      maxRevenue = pr.revenue;
      topRevenueProduct = prodInfo ? prodInfo.name : pr.productId;
    }
    if (pr.stockRemaining > maxStockRemaining) {
      maxStockRemaining = pr.stockRemaining;
      worstStockProduct = prodInfo ? prodInfo.name : pr.productId;
    }
    const lost = pr.demanded - pr.sold;
    if (lost > maxLostSales) {
      maxLostSales = lost;
      worstLostSalesProduct = prodInfo ? prodInfo.name : pr.productId;
    }
  });

  // Sr. Rocha (Diretor Financeiro, Conservador)
  let rocha = '';
  if (cash < 80000) {
    rocha = `Alerta vermelho! Nosso caixa está em R$ ${cash.toLocaleString('pt-BR')}. `;
    if (maxStockRemaining > 400 && worstStockProduct) {
      rocha += `Temos capital de giro parado na forma de ${maxStockRemaining} unidades de **${worstStockProduct}** no estoque. `;
    }
    rocha += `Precisamos cortar custos imediatamente e não gastar mais do que faturamos!`;
  } else if (profit > 100000) {
    rocha = `Excelente rodada. Um lucro de R$ ${profit.toLocaleString('pt-BR')} solidifica nossa posição de liquidez. `;
    if (topRevenueProduct) {
      rocha += `O faturamento com **${topRevenueProduct}** foi fundamental para este balanço positivo. `;
    }
    rocha += `Continuem com essa disciplina fiscal.`;
  } else if (profit < 0) {
    rocha = `Prejuízo inaceitável de R$ ${Math.abs(profit).toLocaleString('pt-BR')}. `;
    if (decision.investments.marketing + decision.investments.logistics > 150000) {
      rocha += `Gastamos demais em marketing e logística (R$ ${(decision.investments.marketing + decision.investments.logistics).toLocaleString('pt-BR')}) e não geramos receita suficiente. `;
    }
    rocha += `Reduzam a exposição ao risco.`;
  } else {
    rocha = `Resultado razoável, mas a rentabilidade sobre os investimentos realizados está apertada. Precisamos otimizar nossa margem de lucro.`;
  }

  // Dra. Luna (Diretora de Marketing, Agressiva)
  let luna = '';
  const marketingInv = decision.investments.marketing;
  if (marketingInv < 45000) {
    luna = `Estamos invisíveis no mercado! Apenas R$ ${marketingInv.toLocaleString('pt-BR')} em marketing é um erro grave. `;
    if (worstStockProduct && maxStockRemaining > 200) {
      luna += `Como pretendemos vender as ${maxStockRemaining} unidades de **${worstStockProduct}** sem promoção ativa? `;
    }
    luna += `Os concorrentes estão nos engolindo em reputação!`;
  } else if (reputation > 75) {
    luna = `Que espetáculo de engajamento! A Essenza está se tornando um ícone da moda casual refinada. `;
    if (topRevenueProduct) {
      luna += `A campanha fez as vendas de **${topRevenueProduct}** brilharem. `;
    }
    luna += `Nossa marca nunca esteve tão forte.`;
  } else {
    luna = `Precisamos de mais ousadia comercial. O mercado é dinâmico e quem lidera as tendências capta os clientes de maior valor. Recomendo aumentar o orçamento de marketing.`;
  }

  // Eng. Vane (Diretor de Operações, Pragmática)
  let vane = '';
  if (maxStockRemaining > 1500 && worstStockProduct) {
    vane = `Temos um grande problema de ociosidade e estoque: ${maxStockRemaining} peças de **${worstStockProduct}** estocadas geram custo de armazenagem elevado e mostram falta de sincronia entre fábrica e vendas.`;
  } else if (maxLostSales > 200 && worstLostSalesProduct) {
    vane = `Deixamos dinheiro na mesa! Faltou capacidade e planejamento produtivo para o/a **${worstLostSalesProduct}** (${Math.round(maxLostSales)} unidades de demanda perdida). Ajuste as metas operacionais.`;
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
