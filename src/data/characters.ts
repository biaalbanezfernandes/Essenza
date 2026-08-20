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
    role: 'Barista & Mestre Copista',
    image: '/characters/npc_manuel_cafe_essenza.png',
    dialogues: [
      '☕ Chefe! O café gourmet acabou, posso comprar aquele de R$ 5,00?',
      '☕ Quem pegou a minha garrafa térmica personalizada?!',
      '☕ Café fresquinho passando! Vai querer com ou sem açúcar?'
    ]
  },
  {
    id: 'vini_estagiario',
    name: 'Vini Estagiário',
    role: 'Suporte de Operações',
    image: '/characters/npc_vini_estagiario.png',
    dialogues: [
      '📑 Chefe, mandei a planilha confidencial no grupo da família sem querer!',
      '📑 Como faz pra dar Ctrl+Z na vida real?!',
      '📑 Onde fica o almoxarifado mesmo? Me perdi no 2º andar...'
    ]
  },
  {
    id: 'fiscal_auditoria',
    name: 'Fiscal de Auditoria',
    role: 'Compliance & Tributos',
    image: '/characters/npc_fiscal_auditoria.png',
    dialogues: [
      '🔍 Cadê a nota fiscal número 4920 de 2024? Preciso pra ontem!',
      '🔍 Achei uma discrepância de R$ 0,12 no balancete da fábrica!',
      '🔍 Vim auditar se os impostos do algodão foram devidamente recolhidos.'
    ]
  },
  {
    id: 'zeze_copa',
    name: 'Dona Zezé',
    role: 'Governanta da Copa',
    image: '/characters/npc_zeze_copa.png',
    dialogues: [
      '🍰 Quem deixou a xícara suja dentro da pia de novo?!',
      '🍰 Acabou de sair bolo de cenoura com cobertura de chocolate na copa!',
      '🍰 Não pisa aí não que acabei de passar pano com desinfetante!'
    ]
  },
  {
    id: 'tico_suporte',
    name: 'Tico do Suporte',
    role: 'Helpdesk de TI',
    image: '/characters/npc_tico_suporte.png',
    dialogues: [
      '💻 Já tentou desligar o computador e ligar de novo?',
      '💻 O servidor caiu porque ligaram uma cafeteira na mesma tomada.',
      '💻 Atualização do Windows obrigatória em 3, 2, 1...'
    ]
  },
  {
    id: 'sofia_juridico',
    name: 'Dra. Sofia',
    role: 'Jurídico & Contratos',
    image: '/characters/npc_sofia_juridico_essenza.png',
    dialogues: [
      '⚖️ Chefe, precisa rubricar essas 48 páginas de contrato agora!',
      '⚖️ O jurídico NÃO autorizou aquela postagem polêmica no marketing!',
      '⚖️ Cuidado com a cláusula de exclusividade com o fornecedor têxtil.'
    ]
  },
  {
    id: 'rocha_seguranca',
    name: 'Inspetor Rocha',
    role: 'Segurança Patrimonial',
    image: '/characters/npc_rocha_seguranca_essenza.png',
    dialogues: [
      '🚨 Tem um carro prata com o farol aceso no estacionamento!',
      '🚨 Identificamos uma pessoa sem crachá perto do galpão de tecidos.',
      '🚨 Quem esqueceu a porta dos fundos destrancada ontem?'
    ]
  },
  {
    id: 'pedro_estoque',
    name: 'Pedro do Estoque',
    role: 'Encarregado de Almoxarifado',
    image: '/characters/npc_pedro_estoque_essenza.png',
    dialogues: [
      '📦 Chefe, chegou uma carreta lotada de caixas sem etiqueta!',
      '📦 Acabou a fita adesiva para lacrar os fardos de moletons!',
      '📦 O empilhadeirista sumiu no meio do carregamento!'
    ]
  },
  {
    id: 'duda_design',
    name: 'Duda do Design',
    role: 'Diretora de Criação',
    image: '/characters/npc_duda_design.png',
    dialogues: [
      '🎨 Qual tom de bege você prefere: Areia Suave ou Deserto Lunar?',
      '🎨 Mudei a logo da Essenza de novo, dá uma olhadinha!',
      '🎨 Essa fonte do catálogo precisa de pelo menos 2px a mais de kerning.'
    ]
  },
  {
    id: 'guto_vendas',
    name: 'Guto Vendas',
    role: 'Executivo Comercial',
    image: '/characters/npc_guto_vendas_essenza.png',
    dialogues: [
      '📈 Fechei uma encomenda de 500 polos, mas prometi 40% de desconto!',
      '📈 O cliente quer saber se entregamos até amanhã às 8h da manhã.',
      '📈 Bati a meta do mês! Cadê o meu bônus executivo?'
    ]
  },
  {
    id: 'carol_principe',
    name: 'Carol Príncipe',
    role: 'Relações Públicas',
    image: '/characters/npc_carol_principe_essenza.png',
    dialogues: [
      '✨ O influencer mais famoso do Brasil quer 10 roupas de graça!',
      '✨ Temos uma coletiva de imprensa em 10 minutos sobre a nova coleção.',
      '✨ A revista Vogue quer uma entrevista exclusiva com você hoje.'
    ]
  },
  {
    id: 'flora_verde',
    name: 'Flora Verde',
    role: 'Sustentabilidade & ESG',
    image: '/characters/npc_flora_verde_essenza.png',
    dialogues: [
      '🌿 Precisamos trocar todas as embalagens por papel 100% semente!',
      '🌿 O descarte dos retalhos de linho foi aprovado com selo verde!',
      '🌿 Plantei 3 mudinhas de ipê na calçada da fábrica.'
    ]
  },
  {
    id: 'gabi_social',
    name: 'Gabi Social Media',
    role: 'Gestora de Redes',
    image: '/characters/npc_gabi_social.png',
    dialogues: [
      '📱 Chefe! Um vídeo nosso bateu 1 milhão de views no TikTok!',
      '📱 Tem 200 pessoas perguntando o preço do moletom nos comentários.',
      '📱 Faz uma dancinha comigo pro reels da empresa rapidão?!'
    ]
  },
  {
    id: 'lana_luxo',
    name: 'Lana Luxo',
    role: 'Consultora de Alta Costura',
    image: '/characters/npc_lana_luxo.png',
    dialogues: [
      '💎 Querido, esses botões precisam ser de madrepérola italiana!',
      '💎 O acabamento dessa gola está muito comercial, precisamos de alta costura.',
      '💎 Se não tiver glamour, a concorrência vai engolir a Essenza.'
    ]
  },
  {
    id: 'laura_chinelo',
    name: 'Laura da Produção',
    role: 'Líder de Costura',
    image: '/characters/npc_laura_chinelo_essenza.png',
    dialogues: [
      '🧵 A máquina de overloque 4 travou de novo!',
      '🧵 As costureiras pediram mais 15 minutos de almoço hoje.',
      '🧵 O lote de camisetas básicas já está 80% embalado!'
    ]
  },
  {
    id: 'rafa_rosa',
    name: 'Rafa Rosa',
    role: 'Visual Merchandising',
    image: '/characters/npc_rafa_rosa_essenza.png',
    dialogues: [
      '🛍️ Mudei todos os manequins da vitrine para a cor rosa quartzo!',
      '🛍️ A iluminação da loja precisa ser mais quente e acolhedora.',
      '🛍️ O aroma de lavanda na entrada triplicou a permanência dos clientes.'
    ]
  },
  {
    id: 'tom_frota',
    name: 'Tom da Frota',
    role: 'Coordenador de Transportes',
    image: '/characters/npc_tom_frota.png',
    dialogues: [
      '🚚 A van de entregas furou o pneu na Marginal!',
      '🚚 O preço do diesel subiu de novo nesta madrugada.',
      '🚚 Rota do litoral finalizada com 2 horas de antecedência!'
    ]
  },
  {
    id: 'beto_eventos',
    name: 'Beto Eventos',
    role: 'Organizador de Feiras',
    image: '/characters/npc_beto_eventos_transp.png',
    dialogues: [
      '🎪 O estande da FECART precisa de mais 5 holofotes de LED!',
      '🎪 Contratei um buffet de salgadinhos pro lançamento da coleção.',
      '🎪 O microfone da apresentação deu microfonia bem na hora do discurso!'
    ]
  },
  {
    id: 'ze_musica',
    name: 'Zé da Música',
    role: 'Sound Designer de Loja',
    image: '/characters/npc_ze_musica_essenza.png',
    dialogues: [
      '🎵 A playlist de Bossa Nova moderna aumentou o ticket médio em 12%!',
      '🎵 Quem colocou heavy metal na caixa de som do refeitório?!',
      '🎵 Criei um jingle exclusivo para o comercial de rádio da Essenza.'
    ]
  },
  {
    id: 'antenor_manutencao',
    name: 'Seu Antenor',
    role: 'Chefe de Manutenção',
    image: '/characters/npc_antenor_manutencao.png',
    dialogues: [
      '🔧 Vou ter que desligar o quadro de força por 2 minutinhos!',
      '🔧 Troquei o rolamento do compressor de ar da fábrica.',
      '🔧 Quem usou a chave de fenda 10 e não guardou na caixa de ferramentas?'
    ]
  }
];
