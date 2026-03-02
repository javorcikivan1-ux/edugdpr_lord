/**
 * CENTRÁLNA KALKULAČKA CEN LICENCIÍ
 * Používa sa v TrainingMarketplace a CompanyTrainingsView
 */

export interface PricingResult {
  total: number | null;
  isCustom: boolean;
  avgPrice: string;
  breakdown?: {
    base: number;
    premium: number;
    expert: number;
    standard: number;
    premiumCount: number;
    expertCount: number;
    standardCount: number;
    totalLicenses: number;
  };
}

export const calculateSmartPricing = (total: number, premium: number, expert: number): PricingResult => {
  // Custom ceny pre veľké objednávky
  if (total > 150) {
    return { 
      total: null, 
      isCustom: true, 
      avgPrice: '0',
      breakdown: {
        base: 0,
        premium: 0,
        expert: 0,
        standard: 0,
        premiumCount: premium,
        expertCount: expert,
        standardCount: total - premium,
        totalLicenses: total + expert
      }
    };
  }

  // Konštanty
  const PREMIUM_SURCHARGE = 12; // €12 príplatok za Premium
  const EXPERT_SURCHARGE = 5;    // €5 príplatok za Expert
  
  // Tier pricing pre základné (Standard) licencie
  const tiers = [
    { max: 5, price: 30 },   // 1-5: €30 za kus
    { max: 10, price: 25 },  // 6-10: €25 za kus
    { max: 20, price: 18 },  // 11-20: €18 za kus
    { max: 50, price: 12 },  // 21-50: €12 za kus
    { max: 150, price: 6 }   // 51-150: €6 za kus
  ];

  // Výpočet základnej ceny (Standard licencie)
  let baseTotal = 0;
  let remaining = total;
  let lastMax = 0;

  for (const tier of tiers) {
    const countInTier = Math.min(remaining, tier.max - lastMax);
    if (countInTier <= 0) break;
    
    baseTotal += countInTier * tier.price;
    remaining -= countInTier;
    lastMax = tier.max;
  }

  // Výpočet príplatkov
  const premiumSurcharge = premium * PREMIUM_SURCHARGE;
  const expertSurcharge = expert * EXPERT_SURCHARGE;
  
  // Celková cena
  const finalTotal = baseTotal + premiumSurcharge + expertSurcharge;
  
  // Počet jednotlivých typov
  const standardCount = Math.max(0, total - premium);

  return {
    total: finalTotal,
    isCustom: false,
    avgPrice: (finalTotal / (total || 1)).toFixed(2),
    breakdown: {
      base: baseTotal,
      premium: premiumSurcharge,
      expert: expertSurcharge,
      standard: baseTotal - (premiumSurcharge + expertSurcharge),
      premiumCount: premium,
      expertCount: expert,
      standardCount: standardCount,
      totalLicenses: total + expert // Expert licencie sú navyše
    }
  };
};

/**
 * Validácia objednávky
 */
export const validateOrder = (total: number, premium: number, expert: number): { isValid: boolean; error?: string } => {
  if (total <= 0) {
    return { isValid: false, error: 'Celkový počet licencií musí byť väčší ako 0' };
  }
  
  if (premium < 0 || expert < 0) {
    return { isValid: false, error: 'Počet Premium a Expert licencií nemôže byť záporný' };
  }
  
  // Premium licencie nemôžu presiahnuť celkový počet
  if (premium > total) {
    return { isValid: false, error: 'Počet Premium licencií nemôže presiahnuť celkový počet zamestnancov' };
  }
  
  // Expert licencie sú navyše k Premium, takže môžu byť ľubovoľný počet
  // Validácia pre Expert licencie nie je potrebná, pretože sú doplnkové
  
  return { isValid: true };
};

/**
 * Formátovanie ceny pre zobrazenie
 */
export const formatPrice = (price: number | null): string => {
  if (price === null) return 'Custom cena';
  return `€${price.toFixed(2)}`;
};

/**
 * Získanie popisu tieru
 */
export const getTierDescription = (count: number): string => {
  if (count <= 5) return '€30 za licenciu';
  if (count <= 10) return '€25 za licenciu';
  if (count <= 20) return '€18 za licenciu';
  if (count <= 50) return '€12 za licenciu';
  if (count <= 150) return '€6 za licenciu';
  return 'Custom cena';
};
