// src/utils/pricingConfig.ts

export const PRICING_CONFIG = {
  // Retail Individual Plan Costs
  retail: {
    cursor_pro: 20,
    windsurf_pro: 20,
    copilot_individual: 10,
    claude_pro: 20,
    chatgpt_plus: 20,
    v0_premium: 20,
  },

  // Team Floor Minimums and Seat Pricing
  teamFloors: {
    claude: {
      minSeats: 5,
      pricePerSeat: 30,
      minMonthlySpend: 150, // 5 * 30
    },
    chatgpt: {
      minSeats: 2,
      pricePerSeat: 30,
      minMonthlySpend: 60, // 2 * 30
    },
    cursor: {
      minSeats: 2,
      pricePerSeat: 40,
    },
    windsurf: {
      minSeats: 2,
      pricePerSeat: 40,
    }
  },

  // Pay-As-You-Go API Direct Cost Estimations
  apiMetered: {
    casualUserEstimatePerSeat: 4.50, // Average monthly API spend for casual content writers
  },

  // Model Arbitrage API Cost Ratios (Gemini 2.5 Flash replacement)
  arbitrage: {
    o1_to_gemini_flash_cost_ratio: 0.04, // 96% reduction in structural background API spent
    opus_to_gemini_flash_cost_ratio: 0.05, // 95% reduction in simple parsing automated tasks
  },

  // Financial Realism & Migration Friction Guards
  realism: {
    consolidationSavingsCoefficient: 0.70, // Retains 30% as migration friction buffer; only claims 70% savings for redundances
  }
};
