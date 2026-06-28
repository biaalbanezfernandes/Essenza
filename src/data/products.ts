import type { Product } from './types';

export const products: Product[] = [
  {
    id: 'camiseta_basica',
    name: 'Camiseta Básica',
    defaultPrice: 29.90,
    productionCost: 10.00,
    seasonality: 'Ano todo',
    description: 'Camiseta de algodão básica, alta saída e margem estável.'
  },
  {
    id: 'polo_essenza',
    name: 'Polo Essenza',
    defaultPrice: 59.90,
    productionCost: 20.00,
    seasonality: 'Ano todo',
    description: 'Camisa polo casual premium com acabamento diferenciado.'
  },
  {
    id: 'moletom',
    name: 'Moletom',
    defaultPrice: 89.90,
    productionCost: 32.00,
    seasonality: 'Inverno',
    description: 'Moletom aconchegante com interior flanelado, pico de vendas no frio.'
  },
  {
    id: 'calca_jeans',
    name: 'Calça Jeans',
    defaultPrice: 99.90,
    productionCost: 38.00,
    seasonality: 'Ano todo',
    description: 'Calça jeans slim fit clássica com alta durabilidade.'
  },
  {
    id: 'vestido_linho',
    name: 'Vestido Linho',
    defaultPrice: 79.90,
    productionCost: 28.00,
    seasonality: 'Verão',
    description: 'Vestido leve de linho para climas quentes, alta demanda no verão.'
  },
  {
    id: 'kit_meia_cueca',
    name: 'Kit Meia e Cueca',
    defaultPrice: 39.90,
    productionCost: 12.00,
    seasonality: 'Ano todo',
    description: 'Kit essencial de alta rotatividade, ideal para complementar o caixa.'
  }
];
