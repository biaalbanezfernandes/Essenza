import type { GameEvent } from './types';

export const events: GameEvent[] = [
  // Eventos Positivos (1-10)
  {
    id: 'influencer_viral',
    title: 'Holograma Viral na Metrópole',
    description: 'Um influenciador digital projetou nossa grife em um arranha-céu e o engajamento disparou.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.40,
    affectedArea: 'Marketing',
    scope: 'player'
  },
  {
    id: 'verao_antecipado',
    title: 'Anomalia Climática Detectada',
    description: 'Sensores da Smart City indicam onda de calor precoce. A busca por roupas leves acelerou.',
    type: 'positive',
    category: 'general',
    multiplier: 1.30,
    affectedArea: 'Demanda Geral',
    scope: 'market'
  },
  {
    id: 'safra_algodao',
    title: 'Super Safra de Bio-Algodão',
    description: 'A fazenda vertical automatizada teve safra recorde, reduzindo o custo de matéria-prima.',
    type: 'positive',
    category: 'materials',
    multiplier: 0.75, // Reduz custos de matéria-prima (multiplica custo)
    affectedArea: 'Custo de Matéria-Prima',
    scope: 'market'
  },
  {
    id: 'logistica_eficiente',
    title: 'Otimização de Drones de Entrega',
    description: 'O novo algoritmo da rede autônoma reduziu prazos e custos de frete.',
    type: 'positive',
    category: 'logistics',
    multiplier: 1.25,
    affectedArea: 'Logística',
    scope: 'player'
  },
  {
    id: 'incentivo_fiscal',
    title: 'Incentivo da Smart City',
    description: 'O conselho da cidade concedeu redução de impostos para indústrias sustentáveis.',
    type: 'positive',
    category: 'general',
    multiplier: 1.15,
    affectedArea: 'Retorno Geral',
    scope: 'player'
  },
  {
    id: 'treinamento_equipe',
    title: 'Capacitação Neural da Equipe',
    description: 'Workshop em realidade virtual elevou drasticamente a produtividade dos operadores.',
    type: 'positive',
    category: 'production',
    multiplier: 1.20,
    affectedArea: 'Produção e Eficiência',
    scope: 'player'
  },
  {
    id: 'tendencia_casual',
    title: 'Alta da Moda Tecno-Casual',
    description: 'A tendência de roupas com sensores de conforto impulsionou a linha casual.',
    type: 'positive',
    category: 'general',
    multiplier: 1.25,
    affectedArea: 'Demanda de Moda Casual',
    scope: 'market'
  },
  {
    id: 'selo_sustentabilidade',
    title: 'Selo Carbono-Zero Aprovado',
    description: 'A certificação de emissão zero atraiu clientes da nova geração e valorizou a marca.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.30,
    affectedArea: 'Reputação e Vendas',
    scope: 'player'
  },
  {
    id: 'parceria_varejo',
    title: 'Destaque no Metaverso',
    description: 'Vitrines holográficas nos maiores portais do metaverso aumentaram os pedidos.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.20,
    affectedArea: 'Marketing e Demanda',
    scope: 'player'
  },
  {
    id: 'inovacao_tecido',
    title: 'Fibras Inteligentes Antiamasso',
    description: 'Tecido com nanotecnologia reduziu retrabalho fabril e agradou os consumidores.',
    type: 'positive',
    category: 'logistics', // Inovação
    multiplier: 1.20,
    affectedArea: 'Inovação e Qualidade',
    scope: 'player'
  },

  // Eventos Negativos (11-20)
  {
    id: 'greve_costureiros',
    title: 'Paralisação de Operadores',
    description: 'Falha na IA de gestão de ponto gerou insatisfação e paralisou as linhas de produção.',
    type: 'negative',
    category: 'production',
    multiplier: 0.70, // Reduz eficiência de produção
    affectedArea: 'Capacidade de Produção',
    scope: 'market'
  },
  {
    id: 'crise_algodao',
    title: 'Escassez de Insumos Orgânicos',
    description: 'Falha climática nas fazendas verticais encareceu a matéria-prima em 30%.',
    type: 'negative',
    category: 'materials',
    multiplier: 1.30, // Eleva os custos de matéria-prima
    affectedArea: 'Custo de Matéria-Prima',
    scope: 'market'
  },
  {
    id: 'greve_transportes',
    title: 'Falha na Rede Autônoma',
    description: 'Queda no servidor de drones de carga prejudicou todas as entregas na cidade.',
    type: 'negative',
    category: 'logistics',
    multiplier: 0.70, // Prejudica a logística
    affectedArea: 'Logística e Distribuição',
    scope: 'market'
  },
  {
    id: 'crise_energia',
    title: 'Pico de Consumo na Smart Grid',
    description: 'Sobrecarga na matriz energética elevou a tarifa de energia da planta fabril.',
    type: 'negative',
    category: 'production',
    multiplier: 1.20, // Eleva custo de produção
    affectedArea: 'Custo Operacional',
    scope: 'player'
  },
  {
    id: 'boato_redes',
    title: 'Deepfake sobre a Marca',
    description: 'Um vídeo gerado por IA com informações falsas afetou temporariamente a confiança dos clientes.',
    type: 'negative',
    category: 'marketing',
    multiplier: 0.75, // Reduz a reputação e a demanda
    affectedArea: 'Reputação e Demanda',
    scope: 'player'
  },
  {
    id: 'inflacao_alta',
    title: 'Ajuste de Crédito Digital',
    description: 'Novas taxas nas moedas digitais fizeram consumidores adiarem compras de vestuário.',
    type: 'negative',
    category: 'general',
    multiplier: 0.75, // Reduz a demanda global
    affectedArea: 'Demanda de Mercado',
    scope: 'market'
  },
  {
    id: 'dumping_concorrente',
    title: 'Liquidação Algorítmica',
    description: 'A IA da concorrência aplicou descontos agressivos, desviando parte da clientela.',
    type: 'negative',
    category: 'general',
    multiplier: 0.80,
    affectedArea: 'Vendas da Rodada',
    scope: 'market'
  },
  {
    id: 'defeito_lote',
    title: 'Bug no Tingimento Automatizado',
    description: 'Glitch no braço robótico gerou descarte de peças e despesas adicionais.',
    type: 'negative',
    category: 'production',
    multiplier: 0.80,
    affectedArea: 'Eficiência e Perdas',
    scope: 'player'
  },
  {
    id: 'frio_atípico_verao',
    title: 'Anomalia Fria Fora de Época',
    description: 'Sensores falharam em prever a frente fria, esfriando as vendas de peças de verão.',
    type: 'negative',
    category: 'general',
    multiplier: 0.85,
    affectedArea: 'Vendas de Produtos de Verão',
    scope: 'market'
  },
  {
    id: 'vazamento_dados_fake',
    title: 'Alarme de Phishing na Rede',
    description: 'Alerta falso de segurança no e-commerce gerou hesitação nas compras.',
    type: 'negative',
    category: 'marketing',
    multiplier: 0.80,
    affectedArea: 'Confiança e Tráfego',
    scope: 'player'
  }
];
