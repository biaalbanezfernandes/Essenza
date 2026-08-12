import type { GameEvent } from './types';

export const events: GameEvent[] = [
  // Eventos Positivos (1-10)
  {
    id: 'influencer_viral',
    title: 'Influenciador Digital de Moda Casual',
    description: 'Uma celebridade com milhões de seguidores postou fotos usando a polo da Essenza. O engajamento da marca decolou.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.40,
    affectedArea: 'Marketing',
    scope: 'player'
  },
  {
    id: 'verao_antecipado',
    title: 'Verão Antecipado e Intenso',
    description: 'Uma onda de calor precoce impulsionou a busca por roupas leves de verão, aumentando o tráfego nas lojas.',
    type: 'positive',
    category: 'general',
    multiplier: 1.30,
    affectedArea: 'Demanda Geral',
    scope: 'market'
  },
  {
    id: 'safra_algodao',
    title: 'Superprodução de Algodão Nacional',
    description: 'Uma safra recorde reduziu drasticamente os preços do algodão no mercado interno, reduzindo o custo de aquisição.',
    type: 'positive',
    category: 'materials',
    multiplier: 0.75, // Reduz custos de matéria-prima (multiplica custo)
    affectedArea: 'Custo de Matéria-Prima',
    scope: 'market'
  },
  {
    id: 'logistica_eficiente',
    title: 'Novo Operador Logístico Rápido',
    description: 'Fechamento de contrato com uma transportadora expressa que otimizou os prazos de entrega em 20%.',
    type: 'positive',
    category: 'logistics',
    multiplier: 1.25,
    affectedArea: 'Logística',
    scope: 'player'
  },
  {
    id: 'incentivo_fiscal',
    title: 'Incentivos Fiscais para Vestuário',
    description: 'O governo anunciou redução de alíquotas de impostos comerciais para indústrias nacionais de confecção.',
    type: 'positive',
    category: 'general',
    multiplier: 1.15,
    affectedArea: 'Retorno Geral',
    scope: 'player'
  },
  {
    id: 'treinamento_equipe',
    title: 'Sucesso no Programa de Capacitação',
    description: 'O novo workshop de costura moderna aumentou a produtividade e a motivação do time de fábrica.',
    type: 'positive',
    category: 'production',
    multiplier: 1.20,
    affectedArea: 'Produção e Eficiência',
    scope: 'player'
  },
  {
    id: 'tendencia_casual',
    title: 'Alta da Moda "Comfy" e Casual',
    description: 'Revistas de moda destacaram a tendência do conforto no trabalho, o que favorece diretamente o portfólio da Essenza.',
    type: 'positive',
    category: 'general',
    multiplier: 1.25,
    affectedArea: 'Demanda de Moda Casual',
    scope: 'market'
  },
  {
    id: 'selo_sustentabilidade',
    title: 'Selo de Sustentabilidade Concedido',
    description: 'A Essenza recebeu o selo "EcoTêxtil" pelo descarte correto de resíduos, elevando a imagem da marca perante o público.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.30,
    affectedArea: 'Reputação e Vendas',
    scope: 'player'
  },
  {
    id: 'parceria_varejo',
    title: 'Destaque em Grande Marketplace',
    description: 'A Essenza ganhou destaque gratuito na página principal de um grande e-commerce de moda, ampliando o tráfego qualificado.',
    type: 'positive',
    category: 'marketing',
    multiplier: 1.20,
    affectedArea: 'Marketing e Demanda',
    scope: 'player'
  },
  {
    id: 'inovacao_tecido',
    title: 'Tecnologia de Fibras Inteligentes',
    description: 'A adoção de uma nova fibra que não amassa agradou o conselho e reduziu custos de passadoria.',
    type: 'positive',
    category: 'logistics', // Inovação
    multiplier: 1.20,
    affectedArea: 'Inovação e Qualidade',
    scope: 'player'
  },

  // Eventos Negativos (11-20)
  {
    id: 'greve_costureiros',
    title: 'Greve Setorial dos Costureiros',
    description: 'Sindicatos paralisaram parcialmente as atividades exigindo reajustes de benefícios, afetando a capacidade de produção.',
    type: 'negative',
    category: 'production',
    multiplier: 0.70, // Reduz eficiência de produção
    affectedArea: 'Capacidade de Produção',
    scope: 'market'
  },
  {
    id: 'crise_algodao',
    title: 'Escassez e Alta Global do Algodão',
    description: 'Pragas nas lavouras do maior produtor internacional elevaram a cotação da pluma de algodão em 30%.',
    type: 'negative',
    category: 'materials',
    multiplier: 1.30, // Eleva os custos de matéria-prima
    affectedArea: 'Custo de Matéria-Prima',
    scope: 'market'
  },
  {
    id: 'greve_transportes',
    title: 'Greve dos Caminhoneiros e Bloqueios',
    description: 'Estradas bloqueadas atrasaram o recebimento de tecidos e a entrega de pedidos aos clientes.',
    type: 'negative',
    category: 'logistics',
    multiplier: 0.70, // Prejudica a logística
    affectedArea: 'Logística e Distribuição',
    scope: 'market'
  },
  {
    id: 'crise_energia',
    title: 'Bandeira Tarifária de Energia Escassa',
    description: 'Crise hídrica gerou acionamento de termoelétricas, encarecendo a conta de luz da planta industrial.',
    type: 'negative',
    category: 'production',
    multiplier: 1.20, // Eleva custo de produção
    affectedArea: 'Custo Operacional',
    scope: 'player'
  },
  {
    id: 'boato_redes',
    title: 'Boatos de Qualidade nas Redes Sociais',
    description: 'Um vídeo viralizado (com informações falsas) alegava que as costuras de uma peça soltaram facilmente na primeira lavagem.',
    type: 'negative',
    category: 'marketing',
    multiplier: 0.75, // Reduz a reputação e a demanda
    affectedArea: 'Reputação e Demanda',
    scope: 'player'
  },
  {
    id: 'inflacao_alta',
    title: 'Aumento Repentino da Inflação',
    description: 'A alta geral de preços reduziu o poder de compra do consumidor, que cortou gastos em itens não essenciais.',
    type: 'negative',
    category: 'general',
    multiplier: 0.75, // Reduz a demanda global
    affectedArea: 'Demanda de Mercado',
    scope: 'market'
  },
  {
    id: 'dumping_concorrente',
    title: 'Liquidação Agressiva da Concorrência',
    description: 'Grandes varejistas iniciaram queima de estoque com descontos de até 60%, atraindo clientes da Essenza.',
    type: 'negative',
    category: 'general',
    multiplier: 0.80,
    affectedArea: 'Vendas da Rodada',
    scope: 'market'
  },
  {
    id: 'defeito_lote',
    title: 'Problema no Tingimento de Lote',
    description: 'Uma falha técnica na tinturaria manchou centenas de peças, forçando o descarte e gerando custos extras.',
    type: 'negative',
    category: 'production',
    multiplier: 0.80,
    affectedArea: 'Eficiência e Perdas',
    scope: 'player'
  },
  {
    id: 'frio_atípico_verao',
    title: 'Frio Atípico na Estação Quente',
    description: 'Uma frente fria inesperada congelou as vendas da coleção de verão (vestidos de linho) por semanas.',
    type: 'negative',
    category: 'general',
    multiplier: 0.85,
    affectedArea: 'Vendas de Produtos de Verão',
    scope: 'market'
  },
  {
    id: 'vazamento_dados_fake',
    title: 'Alerta de Segurança Digital',
    description: 'Um e-mail falso de phishing assustou clientes sobre um suposto vazamento no site de compras.',
    type: 'negative',
    category: 'marketing',
    multiplier: 0.80,
    affectedArea: 'Confiança e Tráfego',
    scope: 'player'
  }
];
