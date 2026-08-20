import type { GameEvent } from './types';

export const events: GameEvent[] = [
  // Eventos Positivos (1-10)
  {
    id: 'influencer_viral',
    title: 'Influenciador Viraliza Marca',
    description: 'Celebridade posou com a polo Essenza e o engajamento disparou.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.40,
    affectedArea: 'Marketing',
    scope: 'player'
  },
  {
    id: 'verao_antecipado',
    title: 'Verão Precoce e Intenso',
    description: 'Onda de calor precoce acelerou a busca por roupas leves.',
    type: 'positive',
    category: 'general',
    multiplier: 1.30,
    affectedArea: 'Demanda Geral',
    scope: 'market'
  },
  {
    id: 'safra_algodao',
    title: 'Super Safra de Algodão',
    description: 'Safra recorde reduziu o custo de aquisição da matéria-prima nacional.',
    type: 'positive',
    category: 'materials',
    multiplier: 0.75, // Reduz custos de matéria-prima (multiplica custo)
    affectedArea: 'Custo de Matéria-Prima',
    scope: 'market'
  },
  {
    id: 'logistica_eficiente',
    title: 'Transporte Expresso Otimizado',
    description: 'Parceria com nova transportadora reduziu prazos e custos de frete.',
    type: 'positive',
    category: 'logistics',
    multiplier: 1.25,
    affectedArea: 'Logística',
    scope: 'player'
  },
  {
    id: 'incentivo_fiscal',
    title: 'Incentivo Fiscal Têxtil',
    description: 'Governo concedeu redução de impostos para a indústria de confecção.',
    type: 'positive',
    category: 'general',
    multiplier: 1.15,
    affectedArea: 'Retorno Geral',
    scope: 'player'
  },
  {
    id: 'treinamento_equipe',
    title: 'Capacitação Fabril em Alta',
    description: 'Workshop de costura moderna elevou a produtividade da equipe.',
    type: 'positive',
    category: 'production',
    multiplier: 1.20,
    affectedArea: 'Produção e Eficiência',
    scope: 'player'
  },
  {
    id: 'tendencia_casual',
    title: 'Alta da Moda Casual "Comfy"',
    description: 'Tendência de conforto impulsionou as vendas da linha casual da Essenza.',
    type: 'positive',
    category: 'general',
    multiplier: 1.25,
    affectedArea: 'Demanda de Moda Casual',
    scope: 'market'
  },
  {
    id: 'selo_sustentabilidade',
    title: 'Selo EcoTêxtil Concedido',
    description: 'Certificação de sustentabilidade atraiu clientes e valorizou a marca.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.30,
    affectedArea: 'Reputação e Vendas',
    scope: 'player'
  },
  {
    id: 'parceria_varejo',
    title: 'Destaque em Grande Marketplace',
    description: 'Vitrines em grandes portais aumentaram as visitas e pedidos da grife.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.20,
    affectedArea: 'Marketing e Demanda',
    scope: 'player'
  },
  {
    id: 'inovacao_tecido',
    title: 'Fibras Inteligentes Antiamasso',
    description: 'Tecido tecnológico reduziu retrabalho e agradou os consumidores.',
    type: 'positive',
    category: 'logistics', // Inovação
    multiplier: 1.20,
    affectedArea: 'Inovação e Qualidade',
    scope: 'player'
  },

  // Eventos Negativos (11-20)
  {
    id: 'greve_costureiros',
    title: 'Paralisação no Polo Têxtil',
    description: 'Greve setorial reduziu temporariamente o ritmo das linhas de produção.',
    type: 'negative',
    category: 'production',
    multiplier: 0.70, // Reduz eficiência de produção
    affectedArea: 'Capacidade de Produção',
    scope: 'market'
  },
  {
    id: 'crise_algodao',
    title: 'Escassez Global de Algodão',
    description: 'Quebra de safra internacional encareceu a matéria-prima em 30%.',
    type: 'negative',
    category: 'materials',
    multiplier: 1.30, // Eleva os custos de matéria-prima
    affectedArea: 'Custo de Matéria-Prima',
    scope: 'market'
  },
  {
    id: 'greve_transportes',
    title: 'Bloqueios nas Rodovias',
    description: 'Atrasos no transporte prejudicaram entregas e distribuição.',
    type: 'negative',
    category: 'logistics',
    multiplier: 0.70, // Prejudica a logística
    affectedArea: 'Logística e Distribuição',
    scope: 'market'
  },
  {
    id: 'crise_energia',
    title: 'Tarifa de Energia Industrial',
    description: 'Bandeira tarifária alta aumentou a conta de luz da planta fabril.',
    type: 'negative',
    category: 'production',
    multiplier: 1.20, // Eleva custo de produção
    affectedArea: 'Custo Operacional',
    scope: 'player'
  },
  {
    id: 'boato_redes',
    title: 'Boatos de Qualidade na Web',
    description: 'Fake news sobre costuras afetou temporariamente a confiança dos clientes.',
    type: 'negative',
    category: 'marketing',
    multiplier: 0.75, // Reduz a reputação e a demanda
    affectedArea: 'Reputação e Demanda',
    scope: 'player'
  },
  {
    id: 'inflacao_alta',
    title: 'Pressão Inflacionária',
    description: 'Aperto no orçamento fez consumidores adiarem compras de vestuário.',
    type: 'negative',
    category: 'general',
    multiplier: 0.75, // Reduz a demanda global
    affectedArea: 'Demanda de Mercado',
    scope: 'market'
  },
  {
    id: 'dumping_concorrente',
    title: 'Liquidação da Concorrência',
    description: 'Queima de estoque com descontos agressivos desviou parte da clientela.',
    type: 'negative',
    category: 'general',
    multiplier: 0.80,
    affectedArea: 'Vendas da Rodada',
    scope: 'market'
  },
  {
    id: 'defeito_lote',
    title: 'Falha Técnica no Tingimento',
    description: 'Defeito em tinturaria gerou descarte de peças e despesas adicionais.',
    type: 'negative',
    category: 'production',
    multiplier: 0.80,
    affectedArea: 'Eficiência e Perdas',
    scope: 'player'
  },
  {
    id: 'frio_atípico_verao',
    title: 'Frente Fria Fora de Época',
    description: 'Frio repentino esfriou as vendas imediatas de peças de verão.',
    type: 'negative',
    category: 'general',
    multiplier: 0.85,
    affectedArea: 'Vendas de Produtos de Verão',
    scope: 'market'
  },
  {
    id: 'vazamento_dados_fake',
    title: 'Alarme Falso de Phishing',
    description: 'Boato sobre segurança online gerou hesitação momentânea nas compras.',
    type: 'negative',
    category: 'marketing',
    multiplier: 0.80,
    affectedArea: 'Confiança e Tráfego',
    scope: 'player'
  }
];
