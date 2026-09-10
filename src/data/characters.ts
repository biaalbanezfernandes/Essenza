export interface NpcCharacter {
  id: string;
  name: string;
  role: string;
  image: string;
  dialogues: string[];
}

export const characters: NpcCharacter[] = [
  {
    id: 'manuel_cafe',
    name: 'Manuel do Café',
    role: 'Técnico de Bio-Bebidas',
    image: '/characters/npc_manuel_cafe_essenza.png',
    dialogues: [
      '☕ Chefe! O sintetizador de café enguiçou, posso comprar grão orgânico de R$ 50,00?',
      '☕ Quem pegou o meu copo térmico de grafeno?!',
      '☕ Café energizado passando! Vai querer com ou sem estimulante neural?'
    ]
  },
  {
    id: 'vini_estagiario',
    name: 'Vini Estagiário',
    role: 'Suporte de IA Operacional',
    image: '/characters/npc_vini_estagiario.png',
    dialogues: [
      '📑 Chefe, mandei a planilha confidencial no canal público do metaverso sem querer!',
      '📑 Como faz pra dar Ctrl+Z no algoritmo de roteamento?!',
      '📑 Onde fica o almoxarifado de drones mesmo? Me perdi no 2º andar...'
    ]
  },
  {
    id: 'fiscal_auditoria',
    name: 'Fiscal de Auditoria',
    role: 'Compliance & Cripto-Tributos',
    image: '/characters/npc_fiscal_auditoria.png',
    dialogues: [
      '🔍 Cadê a chave da blockchain 4920 de 2026? Preciso pra ontem!',
      '🔍 Achei uma discrepância de 0.0012 tokens no balanço da fábrica!',
      '🔍 Vim auditar se as taxas de emissão de carbono foram pagas na Smart Grid.'
    ]
  },
  {
    id: 'zeze_copa',
    name: 'Dona Zezé',
    role: 'Governanta de Bio-Conforto',
    image: '/characters/npc_zeze_copa.png',
    dialogues: [
      '🍰 Quem deixou o prato inteligente sujo dentro da higienizadora?!',
      '🍰 Acabou de sair barra de proteína sabor bolo de cenoura na copa!',
      '🍰 Não pisa aí não que o robô aspirador acabou de encerar!'
    ]
  },
  {
    id: 'tico_suporte',
    name: 'Tico do Suporte',
    role: 'Helpdesk de Ciber-Infra',
    image: '/characters/npc_tico_suporte.png',
    dialogues: [
      '💻 Já tentou desconectar o implante neural e ligar de novo?',
      '💻 O servidor caiu porque ligaram a máquina de café no mesmo barramento quântico.',
      '💻 Atualização do firewall da cidade obrigatória em 3, 2, 1...'
    ]
  },
  {
    id: 'sofia_juridico',
    name: 'Dra. Sofia',
    role: 'Jurídico & Smart Contracts',
    image: '/characters/npc_sofia_juridico_essenza.png',
    dialogues: [
      '⚖️ Chefe, precisa assinar digitalmente esses 48 contratos inteligentes agora!',
      '⚖️ A IA do jurídico NÃO autorizou aquela postagem polêmica na rede neural!',
      '⚖️ Cuidado com a cláusula de exclusividade com o fornecedor de bio-tecidos.'
    ]
  },
  {
    id: 'rocha_seguranca',
    name: 'Inspetor Rocha',
    role: 'Ciber-Segurança Patrimonial',
    image: '/characters/npc_rocha_seguranca_essenza.png',
    dialogues: [
      '🚨 Tem um carro voador parado no estacionamento sem autorização!',
      '🚨 Identificamos uma assinatura digital suspeita perto do galpão de servidores.',
      '🚨 Quem esqueceu o bloqueador de sinal da porta dos fundos desativado?'
    ]
  },
  {
    id: 'pedro_estoque',
    name: 'Pedro do Estoque',
    role: 'Encarregado de Drones',
    image: '/characters/npc_pedro_estoque_essenza.png',
    dialogues: [
      '📦 Chefe, chegou um drone de carga gigante sem código de barras!',
      '📦 Acabou o polímero selante para lacrar os fardos de tecidos térmicos!',
      '📦 O robô empilhador entrou em modo de suspensão no meio do galpão!'
    ]
  },
  {
    id: 'duda_design',
    name: 'Duda do Design',
    role: 'Diretora de Criação 3D',
    image: '/characters/npc_duda_design.png',
    dialogues: [
      '🎨 Qual tom de holograma você prefere: Neon Suave ou Prisma Lunar?',
      '🎨 Atualizei as texturas 3D da coleção, dá uma olhadinha no óculos VR!',
      '🎨 Essa renderização do catálogo precisa de mais ray-tracing.'
    ]
  },
  {
    id: 'guto_vendas',
    name: 'Guto Vendas',
    role: 'Executivo Comercial Virtual',
    image: '/characters/npc_guto_vendas_essenza.png',
    dialogues: [
      '📈 Fechei uma assinatura de roupas pra 500 avatares!',
      '📈 O cliente quer saber se o drone entrega no andar 150 até às 8h.',
      '📈 Bati a meta do mês em cripto! Cadê o meu bônus executivo?'
    ]
  },
  {
    id: 'carol_principe',
    name: 'Carol Príncipe',
    role: 'Relações Públicas',
    image: '/characters/npc_carol_principe_essenza.png',
    dialogues: [
      '✨ O holo-influencer mais famoso quer 10 roupas de graça pro avatar dele!',
      '✨ Temos uma coletiva na sala virtual em 10 minutos sobre a nova coleção inteligente.',
      '✨ O canal principal da Smart City quer transmitir uma entrevista com você.'
    ]
  },
  {
    id: 'flora_verde',
    name: 'Flora Verde',
    role: 'Eco-Sustentabilidade',
    image: '/characters/npc_flora_verde_essenza.png',
    dialogues: [
      '🌿 Precisamos trocar todas as embalagens por celulose regenerativa!',
      '🌿 O descarte das sobras foi convertido em energia limpa para a cidade!',
      '🌿 Plantei 3 árvores holográficas purificadoras de ar na calçada da fábrica.'
    ]
  },
  {
    id: 'gabi_social',
    name: 'Gabi Social Media',
    role: 'Gestora de Redes Holográficas',
    image: '/characters/npc_gabi_social.png',
    dialogues: [
      '📱 Chefe! Nossa simulação bateu 1 milhão de acessos simultâneos!',
      '📱 Tem 200 IA-bots perguntando o preço da jaqueta térmica.',
      '📱 Captura um motion comigo pro feed da empresa rapidão?!'
    ]
  },
  {
    id: 'lana_luxo',
    name: 'Lana Luxo',
    role: 'Consultora de Tecno-Costura',
    image: '/characters/npc_lana_luxo.png',
    dialogues: [
      '💎 Querido, esses sensores cardíacos precisam ser de titânio!',
      '💎 O acabamento dessa gola não tem regulação térmica, está muito básico.',
      '💎 Se não tiver integração com smartwatch, a concorrência vai engolir a Essenza.'
    ]
  },
  {
    id: 'laura_chinelo',
    name: 'Laura da Produção',
    role: 'Líder de Automação',
    image: '/characters/npc_laura_chinelo_essenza.png',
    dialogues: [
      '🧵 A esteira magnética de montagem travou de novo!',
      '🧵 Os técnicos pediram pra atualizar o software de costura antes do almoço.',
      '🧵 O lote de camisetas base-layer já está 80% embalado pelos drones!'
    ]
  },
  {
    id: 'rafa_rosa',
    name: 'Rafa Rosa',
    role: 'Visual Merchandising AR',
    image: '/characters/npc_rafa_rosa_essenza.png',
    dialogues: [
      '🛍️ Mudei a projeção da vitrine para um cenário em Marte, ficou incrível!',
      '🛍️ A luz dos provadores virtuais precisa ser ajustada, os avatares ficam opacos.',
      '🛍️ O aroma artificial na entrada da loja física triplicou a dopamina dos clientes.'
    ]
  },
  {
    id: 'tom_frota',
    name: 'Tom da Frota',
    role: 'Coordenador de Drones',
    image: '/characters/npc_tom_frota.png',
    dialogues: [
      '🚚 Um drone de carga perdeu o sinal de GPS perto do centro da cidade!',
      '🚚 O preço da bateria de íon-lítio subiu de novo nesta madrugada.',
      '🚚 Rota aérea comercial finalizada sem colisões, tudo no horário!'
    ]
  },
  {
    id: 'beto_eventos',
    name: 'Beto Eventos',
    role: 'Produtor de Holo-Feiras',
    image: '/characters/npc_beto_eventos_transp.png',
    dialogues: [
      '🎪 O pavilhão da FECART virtual não suporta tantos visitantes simultâneos!',
      '🎪 Contratei um buffet de impressões 3D alimentares pro evento.',
      '🎪 O avatar do mestre de cerimônias bugou bem na hora do discurso!'
    ]
  },
  {
    id: 'ze_musica',
    name: 'Zé da Música',
    role: 'Sound Designer Algorítmico',
    image: '/characters/npc_ze_musica_essenza.png',
    dialogues: [
      '🎵 A trilha sonora gerada por IA aumentou as vendas da coleção em 12%!',
      '🎵 Quem colocou chiado lofi na comunicação interna da fábrica?!',
      '🎵 A música reativa ao batimento cardíaco dos clientes está pronta.'
    ]
  },
  {
    id: 'antenor_manutencao',
    name: 'Seu Antenor',
    role: 'Chefe de Manutenção Quântica',
    image: '/characters/npc_antenor_manutencao.png',
    dialogues: [
      '🔧 Vou ter que reiniciar a malha elétrica do galpão por 2 nanosegundos!',
      '🔧 Troquei o processador de estado sólido do robô de triagem.',
      '🔧 Quem usou meu scanner de diagnóstico térmico e não guardou?'
    ]
  }
];
