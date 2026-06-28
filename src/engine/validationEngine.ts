import type { PlayerDecision } from '../data/types';
import { products } from '../data/products';
import { SimulationConstants } from '../config/simulationConstants';
import { calculateBottleneckMultiplier } from './marketEngine';

export interface ValidationResult {
  type: 'danger' | 'warning' | 'info' | 'success';
  message: string;
}

export interface ProductionRequirements {
  materials: number;
  labor: number;
}

/**
 * Calculate production requirements for materials and labor
 * based on production quantities and product costs
 */
export function calculateProductionRequirements(
  productionQty: { [productId: string]: number }
): ProductionRequirements {
  const { productionCostSplit } = SimulationConstants;
  let materials = 0;
  let labor = 0;

  products.forEach((product) => {
    const qty = productionQty[product.id] || 0;
    const cost = qty * product.productionCost;
    materials += cost * productionCostSplit.materialsRatio;
    labor += cost * productionCostSplit.productionRatio;
  });

  return { materials, labor };
}

/**
 * Check if there's a bottleneck in materials or labor investment
 */
export function checkBottlenecks(
  investments: { materials: number; production: number },
  requirements: ProductionRequirements
): { hasBottleneck: boolean; multiplier: number; messages: string[] } {
  const multiplier = calculateBottleneckMultiplier(investments, {
    materials: requirements.materials,
    production: requirements.labor,
  });
  const hasBottleneck = multiplier < 1.0;
  const messages: string[] = [];

  if (requirements.materials > 0 && investments.materials < requirements.materials) {
    messages.push(
      `Gargalo de Matéria-Prima: Investimento (R$ ${investments.materials.toLocaleString('pt-BR')}) ` +
      `insuficiente para produção planejada (necessário R$ ${requirements.materials.toLocaleString('pt-BR')}).`
    );
  }
  if (requirements.labor > 0 && investments.production < requirements.labor) {
    messages.push(
      `Gargalo de Mão de Obra: Investimento (R$ ${investments.production.toLocaleString('pt-BR')}) ` +
      `insuficiente para escala produtiva (necessário R$ ${requirements.labor.toLocaleString('pt-BR')}).`
    );
  }

  return { hasBottleneck, multiplier, messages };
}

/**
 * Generate live S.S.I.S. advice based on current decision state
 */
export function generateLiveSsisAdvice(
  pendingDecision: PlayerDecision,
  currentCash: number
): ValidationResult {
  const { validation } = SimulationConstants;
  const totalInvestments = 
    pendingDecision.investments.materials + 
    pendingDecision.investments.production + 
    pendingDecision.investments.marketing + 
    pendingDecision.investments.logistics;

  // Critical: Over budget
  if (totalInvestments > currentCash) {
    return {
      type: 'danger',
      message: `Aviso crítico: Os investimentos (R$ ${totalInvestments.toLocaleString('pt-BR')}) ` +
        `ultrapassam seu saldo de caixa (R$ ${currentCash.toLocaleString('pt-BR')}). ` +
        `Reduza os investimentos para processar a rodada.`
    };
  }

  // Warning: Bottlenecks
  const requirements = calculateProductionRequirements(pendingDecision.productionQty);
  const { hasBottleneck, messages: bottleneckMessages } = checkBottlenecks(
    pendingDecision.investments,
    requirements
  );

  if (hasBottleneck) {
    return {
      type: 'warning',
      message: bottleneckMessages.join(' ')
    };
  }

  // Info: Low marketing
  if (pendingDecision.investments.marketing < validation.marketingMinimum) {
    return {
      type: 'info',
      message: 'Recomendação de Marketing: Investimento em promoção muito modesto. ' +
        'Você pode perder quota de mercado para o Rival B (Premium).'
    };
  }

  // Info: High pricing
  let pricingHigh = false;
  products.forEach((p) => {
    const price = pendingDecision.prices[p.id] || p.defaultPrice;
    if (price > p.defaultPrice * validation.pricingHighMultiplier) {
      pricingHigh = true;
    }
  });

  if (pricingHigh) {
    return {
      type: 'info',
      message: 'Aviso Comercial: Alguns de seus preços estão bastante elevados. ' +
        'Certifique-se de sustentar essa margem com alto investimento em Marketing para construir valor de marca.'
    };
  }

  // Success: Balanced planning
  return {
    type: 'success',
    message: 'Planejamento operacional equilibrado. O S.S.I.S. estima bom aproveitamento de mercado sob as diretrizes configuradas.'
  };
}

/**
 * Calculate total investment amount
 */
export function calculateTotalInvestments(decision: PlayerDecision): number {
  return (
    decision.investments.materials +
    decision.investments.production +
    decision.investments.marketing +
    decision.investments.logistics
  );
}

/**
 * Calculate remaining cash after investments
 */
export function calculateRemainingCash(currentCash: number, decision: PlayerDecision): number {
  return currentCash - calculateTotalInvestments(decision);
}

/**
 * Validate if decision is submittable
 */
export function isDecisionValid(decision: PlayerDecision, currentCash: number): boolean {
  const totalInvestments = calculateTotalInvestments(decision);
  return totalInvestments > 0 && totalInvestments <= currentCash;
}