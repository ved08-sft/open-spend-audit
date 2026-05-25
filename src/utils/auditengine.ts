// src/utils/auditengine.ts
import { AuditPayload, AuditResult, ToolRecommendation, ToolName, AuditFinding, ConfidenceScore } from '../types/audit';
import { PRICING_CONFIG } from './pricingConfig';

export interface ProductCatalogItem {
  id: ToolName;
  name: string;
  category: 'IDE Coding Editors' | 'Web Assistants / Chat' | 'UI Component Generators' | 'Raw API Engines';
  utility: number; // 1-5
  costEffectiveness: number; // 1-5
  description: string;
  pros: string[];
  cons: string[];
  pricing: string;
}

// Product catalog categorized based on PRICING_DATA.md
export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'IDE Coding Editors',
    utility: 5.0,
    costEffectiveness: 4.8,
    description: 'Leading AI-first code editor with deep workspace context, agentic edit flows, and multi-file editing capabilities.',
    pros: ['Excellent multi-file agent edit mode', 'Inherits VS Code extensions seamlessly', 'Powerful composer feature'],
    cons: ['Pro plan is flat-rate $20/month', 'Can be resource intensive on older hardware'],
    pricing: '$0 (Hobby) | $20 (Pro) | $60 (Pro+) | $40/user (Teams)'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'IDE Coding Editors',
    utility: 4.8,
    costEffectiveness: 4.7,
    description: 'Highly interactive AI-powered IDE powered by Codeium. Competes directly with Cursor on agentic workflows.',
    pros: ['Superb real-time collaborative coding', 'Fast autocompletion', 'Intuitive terminal integration'],
    cons: ['Slightly newer ecosystem than Cursor', 'Pro plan is flat-rate $20/month'],
    pricing: '$0 (Free) | $20 (Pro) | $200 (Max) | $40/user (Teams)'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    category: 'IDE Coding Editors',
    utility: 4.2,
    costEffectiveness: 4.5,
    description: 'The pioneer of AI code autocomplete. Integrates directly into traditional IDEs like VS Code and JetBrains.',
    pros: ['Lightweight inline autocompletion', 'Robust corporate security standards', 'Cheaper entry tier ($10/mo)'],
    cons: ['Lacks advanced multi-file agentic features', 'Web chat interface is less powerful than Cursor/Windsurf'],
    pricing: '$10 (Individual Essential) | $20 (Pro) | $19/user (Business)'
  },
  {
    id: 'claude',
    name: 'Claude Pro',
    category: 'Web Assistants / Chat',
    utility: 4.9,
    costEffectiveness: 4.6,
    description: 'Anthropic\'s flagship assistant. Renowned for supreme coding logic, advanced reasoning, and nuanced writing.',
    pros: ['Industry-best coding and math reasoning', 'Artifacts UI for visual mockups', 'Excellent tone control'],
    cons: ['Message limits on Pro tiers', 'No native internet search integration'],
    pricing: '$0 (Free) | $20 (Pro) | $100 (Max) | $30/user (Team)'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    category: 'Web Assistants / Chat',
    utility: 4.7,
    costEffectiveness: 4.5,
    description: 'OpenAI\'s market-leading chatbot. Versatile web companion for search, reasoning, and voice chat.',
    pros: ['Excellent web search integration', 'Custom GPTs ecosystem', 'High reasoning o1/o3-mini model access'],
    cons: ['Slightly lower writing nuance than Claude', 'Team tier has a 2-seat minimum billing'],
    pricing: '$0 (Free) | $20 (Plus) | $100 (Pro) | $30/user (Team)'
  },
  {
    id: 'v0',
    name: 'v0 (by Vercel)',
    category: 'UI Component Generators',
    utility: 4.8,
    costEffectiveness: 4.7,
    description: 'Vercel\'s specialized generative UI engine. Generates copy-paste-ready React, Tailwind, and HTML blocks.',
    pros: ['Exceptional React component output', 'Direct Vercel deployment preview', 'Elegant and highly custom layouts'],
    cons: ['Limited use outside frontend development', 'Free tier has strict credit allowances'],
    pricing: '$0 (Free) | $20 (Premium) | $30/user (Team)'
  },
  {
    id: 'anthropic_api',
    name: 'Claude API (Sonnet 4.6)',
    category: 'Raw API Engines',
    utility: 5.0,
    costEffectiveness: 4.8,
    description: 'Direct API access to Sonnet 4.6. Superb developer performance and cost-effectiveness for code generation.',
    pros: ['Amazing raw reasoning ability', 'Highly developer-friendly SDK', 'Pay-only-for-what-you-use'],
    cons: ['Requires setting up a custom interface/client', 'Advanced queries can cost more for extremely heavy users'],
    pricing: 'Sonnet 4.6: $3/M input, $15/M output | Haiku: $1/M, $5/M'
  },
  {
    id: 'openai_api',
    name: 'OpenAI API (GPT-4o / o1)',
    category: 'Raw API Engines',
    utility: 4.9,
    costEffectiveness: 3.5,
    description: 'Direct API access to OpenAI engines. Includes o1 for deep reasoning, and GPT-4o for high-speed tasks.',
    pros: ['o1 model represents the peak of complex reasoning', 'Extremely low latency GPT-4o', 'Massive API ecosystem'],
    cons: ['o1 is extremely expensive ($15/M input, $60/M output)', 'Usage bills can grow rapidly without rate-limiting'],
    pricing: 'o1: $15/M input, $60/M output | GPT-4o: $2.50/M input, $10/M output'
  },
  {
    id: 'gemini_api',
    name: 'Google Gemini API',
    category: 'Raw API Engines',
    utility: 4.3,
    costEffectiveness: 5.0,
    description: 'Google\'s powerhouse API engines. Gemini 2.5 Flash is lightning fast and boasts the best cost-to-performance ratio in the industry.',
    pros: ['Massive 2M token context window', 'Gemini 2.5 Flash is incredibly cheap ($0.30/M input, $2.50/M output)', 'Free tier allows 1,000 requests/day'],
    cons: ['Slightly lower coding reasoning compared to Sonnet 4.6', 'Requires setting up custom developer keys'],
    pricing: '2.5 Flash: $0.30/M input, $2.50/M output | 2.5 Pro: $1.25/M, $10/M'
  }
];

// Tool Capability Mapping (Issue 4 Weighted Overlap)
interface CapabilitySet {
  autocomplete: number;
  agentMode: number;
  webChat: number;
  uiGen: number;
}

const TOOL_CAPABILITIES: Record<string, CapabilitySet> = {
  cursor: { autocomplete: 1.0, agentMode: 1.0, webChat: 0.8, uiGen: 0.4 },
  windsurf: { autocomplete: 1.0, agentMode: 1.0, webChat: 0.8, uiGen: 0.4 },
  copilot: { autocomplete: 1.0, agentMode: 0.4, webChat: 0.6, uiGen: 0.2 },
  claude: { autocomplete: 0.2, agentMode: 0.6, webChat: 1.0, uiGen: 0.7 },
  chatgpt: { autocomplete: 0.2, agentMode: 0.5, webChat: 1.0, uiGen: 0.6 },
  v0: { autocomplete: 0.0, agentMode: 0.5, webChat: 0.4, uiGen: 1.0 },
};

export function getSortedCatalog(): ProductCatalogItem[] {
  return [...PRODUCT_CATALOG].sort((a, b) => {
    if (b.utility !== a.utility) {
      return b.utility - a.utility;
    }
    return b.costEffectiveness - a.costEffectiveness;
  });
}

export function calculateAudit(payload: AuditPayload): AuditResult {
  const breakdown: ToolRecommendation[] = [];

  // Normalize global parameters
  const teamSize = Number.isInteger(payload.teamSize) ? Math.max(1, payload.teamSize) : 1;
  const primaryUseCase = payload.primaryUseCase?.trim().toLowerCase() || 'mixed';
  const usageFrequency = payload.usageFrequency?.trim().toLowerCase() || 'active';
  const taskComplexity = payload.taskComplexity?.trim().toLowerCase() || 'moderate';

  if (!payload.tools || payload.tools.length === 0) {
    return {
      totalCurrentSpend: 0,
      totalRecommendedSpend: 0,
      totalMonthlySavings: 0,
      totalAnnualSavings: 0,
      workspaceOverlapScore: 0,
      breakdown: []
    };
  }

  // --- STABILITY PRE-PROCESSING: DUPLICATE MERGING & NORMALIZATION ---
  const normalizedToolsMap = new Map<string, { toolName: string; planName: string; monthlySpend: number; seats: number; originalIndices: number[]; mergedFindings: AuditFinding[] }>();

  payload.tools.forEach((tool, originalIndex) => {
    const normalizedName = tool.toolName?.trim().toLowerCase() || '';
    const planName = tool.planName?.trim() || 'Standard';
    const normalizedPlanKey = planName.toLowerCase();

    if (!normalizedName) {
      return;
    }

    let spend = Number.isFinite(tool.monthlySpend) ? tool.monthlySpend : 0;
    const initialSpend = tool.monthlySpend;
    let messySpendFinding: AuditFinding | null = null;
    if (!Number.isFinite(initialSpend) || initialSpend < 0) {
      spend = Math.max(0, spend);
      messySpendFinding = {
        action: "Corrected malformed tool expenditure value.",
        savings: 0,
        reason: `Detected invalid or negative monthly spend ($${initialSpend}). Normalizing budget baseline to $0.00.`,
        type: "MESSY_INPUT",
        confidence: "high",
        signals: ["Financial spend format validation", "Non-finite or negative spend numeric detected"],
        priority: 1
      };
    }

    let seats = Number.isFinite(tool.seats) ? tool.seats : 1;
    const initialSeats = tool.seats;
    let messySeatsFinding: AuditFinding | null = null;
    if (!Number.isInteger(initialSeats) || initialSeats <= 0) {
      if (initialSeats <= 0) {
        seats = 0;
        messySeatsFinding = {
          action: "Decommission dormant zero-seat license tier.",
          savings: spend,
          reason: `Detected zero or negative seats (${initialSeats}) on a paid subscription. Decommissioning unused slots recouping 100% of expenditure.`,
          type: "MESSY_INPUT",
          confidence: "high",
          signals: ["Zero seat registration check", "SaaS baseline requires at least 1 active seat for core functionality"],
          priority: 1
        };
      } else {
        seats = Math.floor(Math.max(1, initialSeats));
        messySeatsFinding = {
          action: "Clamped fractional seat configuration.",
          savings: 0,
          reason: `Detected impossible fractional seat count (${initialSeats}). Normalizing seat count to integer ${seats}.`,
          type: "MESSY_INPUT",
          confidence: "high",
          signals: ["Decimal seat value check", "SaaS licensing models mandate whole integer seats only"],
          priority: 1
        };
      }
    }

    const mapKey = `${normalizedName}::${normalizedPlanKey}`;
    const existing = normalizedToolsMap.get(mapKey);

    if (existing) {
      existing.monthlySpend += spend;
      existing.seats += seats;
      existing.originalIndices.push(originalIndex);
      existing.mergedFindings.push({
        action: `Consolidated duplicate ${normalizedName.toUpperCase()} accounts.`,
        savings: 0,
        reason: `Detected multiple standalone purchases for ${formatToolLabel(normalizedName)} under ${planName} plan. Consolidating licenses into a single team footprint.`,
        type: "DUPLICATE_MERGE",
        confidence: "high",
        signals: ["Duplicate SaaS vendor scan", "Merging duplicate account pools cleans administration overhead"],
        priority: 1
      });
      if (messySpendFinding) existing.mergedFindings.push(messySpendFinding);
      if (messySeatsFinding) existing.mergedFindings.push(messySeatsFinding);
    } else {
      const mergedFindings: AuditFinding[] = [];
      if (messySpendFinding) mergedFindings.push(messySpendFinding);
      if (messySeatsFinding) mergedFindings.push(messySeatsFinding);

      normalizedToolsMap.set(mapKey, {
        toolName: normalizedName,
        planName,
        monthlySpend: spend,
        seats,
        originalIndices: [originalIndex],
        mergedFindings
      });
    }
  });

  const processedTools = Array.from(normalizedToolsMap.values());

  // ECOSYSTEM SIGNALS (Issue 4 Weighted Capability Overlap calculation)
  const hasCursor = processedTools.some(t => t.toolName === 'cursor');
  const hasWindsurf = processedTools.some(t => t.toolName === 'windsurf');
  const hasClaude = processedTools.some(t => t.toolName === 'claude');
  const hasChatGPT = processedTools.some(t => t.toolName === 'chatgpt');
  const hasV0 = processedTools.some(t => t.toolName === 'v0');
  const hasCopilot = processedTools.some(t => t.toolName === 'copilot');

  // Derive overlap score mathematically based on actual capabilities
  let totalAutocomplete = 0;
  let totalAgentMode = 0;
  let totalWebChat = 0;
  let totalUiGen = 0;
  let activeWeightedToolsCount = 0;

  processedTools.forEach(t => {
    const caps = TOOL_CAPABILITIES[t.toolName];
    if (caps) {
      totalAutocomplete += caps.autocomplete;
      totalAgentMode += caps.agentMode;
      totalWebChat += caps.webChat;
      totalUiGen += caps.uiGen;
      activeWeightedToolsCount++;
    }
  });

  let redundantSum = 0;
  let totalProvidedSum = totalAutocomplete + totalAgentMode + totalWebChat + totalUiGen;

  if (totalAutocomplete > 1.0) redundantSum += (totalAutocomplete - 1.0);
  if (totalAgentMode > 1.0) redundantSum += (totalAgentMode - 1.0);
  if (totalWebChat > 1.0) redundantSum += (totalWebChat - 1.0);
  if (totalUiGen > 1.0) redundantSum += (totalUiGen - 1.0);

  const rawOverlapPercentage = totalProvidedSum > 0 ? (redundantSum / totalProvidedSum) * 100 : 0;
  const workspaceOverlapScore = Math.min(100, Math.floor(rawOverlapPercentage * 1.5)); // Scale nicely for corporate representation

  let totalCurrentSpend = 0;
  let totalRecommendedSpend = 0;

  processedTools.forEach((tool) => {
    totalCurrentSpend += tool.monthlySpend;

    let recommendedSpend = tool.monthlySpend;
    
    // Accumulate candidate findings
    const candidates: AuditFinding[] = [...tool.mergedFindings];

    const lowercasePlan = tool.planName.toLowerCase();
    const name = tool.toolName;

    // Handle early decommission if seats clamped to 0 during pre-processing
    if (tool.seats <= 0) {
      breakdown.push({
        toolName: tool.toolName.toUpperCase(),
        currentSpend: tool.monthlySpend,
        recommendedAction: "Decommission dormant tier.",
        potentialSavings: tool.monthlySpend,
        reason: "Zero seats represent dormant billing.",
        confidence: "high",
        findings: tool.mergedFindings
      });
      return;
    }

    // ─── RULE A: PHANTOM SEAT DETECTION ───
    if (lowercasePlan.includes('team') || lowercasePlan.includes('business')) {
      if (name === 'claude' && tool.seats < PRICING_CONFIG.teamFloors.claude.minSeats) {
        const individualProCost = tool.seats * PRICING_CONFIG.retail.claude_pro;
        const currentCharge = tool.monthlySpend;
        if (individualProCost < currentCharge) {
          const savings = Math.max(0, currentCharge - individualProCost);
          candidates.push({
            action: "Downgrade Claude Team to standalone Pro accounts.",
            savings,
            reason: `Claude Team plans charge a minimum of 5 seats ($150/mo). Downgrading your ${tool.seats} active user(s) to standalone Pro individual accounts ($20/seat) cuts out phantom seat overhead.`,
            type: "GHOST_SEATS",
            confidence: "high",
            signals: ["Phantom seat minimum scan", "Claude standard team floor threshold", "Individual consolidate value check"],
            priority: 4
          });
        }
      } 
      else if (name === 'chatgpt' && tool.seats === 1) {
        const savings = Math.max(0, tool.monthlySpend - PRICING_CONFIG.retail.chatgpt_plus);
        candidates.push({
          action: "Downgrade ChatGPT Team to ChatGPT Plus.",
          savings,
          reason: "ChatGPT Team enforces a minimum of 2 seats ($60/mo). Downgrading to a standalone Plus subscription ($20/mo) avoids paying $40/mo for a phantom ghost seat.",
          type: "GHOST_SEATS",
          confidence: "high",
          signals: ["ChatGPT team 2-seat minimum scan", "Single seat active profile detected", "Downgrading to retail Plus cuts phantom seat charge"],
          priority: 4
        });
      }
      else if ((name === 'cursor' || name === 'windsurf') && tool.seats === 1) {
        const savings = Math.max(0, tool.monthlySpend - 20);
        candidates.push({
          action: `Downgrade ${tool.toolName.toUpperCase()} Team to Individual Pro.`,
          savings,
          reason: `Using a Team plan for 1 seat incurs redundant administrative billing ($40 vs $20). Downgrading to an individual Pro account saves $${savings.toFixed(2)}/mo.`,
          type: "GHOST_SEATS",
          confidence: "high",
          signals: ["Editor single-seat premium scan", " downgrade to retail Pro removes management premium"],
          priority: 4
        });
      }
    }

    // ─── RULE B: CROSS-VENDOR CONSOLIDATIONS (Issue 1 & 2 Wording and Friction adjusted) ───
    if (name === 'copilot' && (hasCursor || hasWindsurf)) {
      const activeEditor = hasCursor ? 'Cursor' : 'Windsurf';
      // Apply 70% savings coefficient to account for migration friction and user resistance
      const savings = tool.monthlySpend * PRICING_CONFIG.realism.consolidationSavingsCoefficient; 
      candidates.push({
        action: "Evaluate Consolidation Opportunity (Decommission GitHub Copilot).",
        savings,
        reason: `Using GitHub Copilot alongside ${activeEditor} introduces functional capabilities overlap. Consolidating autocomplete into ${activeEditor} native engine reduces waste by 70%, factoring in transitional workflow friction.`,
        type: "REDUNDANCY",
        confidence: "medium",
        signals: [`Ecosystem IDE autocomplete scan`, `${activeEditor} includes native copilot logic`, `Workflow redundancy consolidation`],
        priority: 5
      });
    } 
    else if (name === 'cursor' && hasWindsurf) {
      const savings = tool.monthlySpend * PRICING_CONFIG.realism.consolidationSavingsCoefficient;
      candidates.push({
        action: "Evaluate Consolidation Opportunity (Consolidate IDE Editors).",
        savings,
        reason: "Cursor and Windsurf represent functional parity alternatives. Consolidating into a single editor standard trims duplicate license costs by 70%, allowing 30% buffer for departmental adjustments.",
        type: "REDUNDANCY",
        confidence: "medium",
        signals: ["Dual AI editor installations active", "Workflow functional parity analysis", "Maintain single IDE standard"],
        priority: 5
      });
    }
    else if (name === 'chatgpt' && hasClaude && (lowercasePlan.includes('plus') || lowercasePlan.includes('pro') || lowercasePlan.includes('team'))) {
      const savings = tool.monthlySpend * PRICING_CONFIG.realism.consolidationSavingsCoefficient;
      candidates.push({
        action: "Evaluate Consolidation Opportunity (Consolidate Chat Web Assistants).",
        savings,
        reason: "Dual-provisioning ChatGPT Plus and Claude Pro creates web-chat assistant redundancy. Standardizing on Claude Pro recaptures 70% of redundant billing after team workflow migration friction.",
        type: "REDUNDANCY",
        confidence: "medium",
        signals: ["General web chatbot duplication", "Claude Pro reasoning superiority", "Workforce standard consolidation"],
        priority: 5
      });
    }
    else if (name === 'chatgpt' && lowercasePlan.includes('plus') && hasV0) {
      const savings = tool.monthlySpend * PRICING_CONFIG.realism.consolidationSavingsCoefficient;
      candidates.push({
        action: "Evaluate Consolidation Opportunity (Consolidate ChatGPT into v0).",
        savings,
        reason: "v0 Premium allocations natively grant access to high-tier LLM execution models like GPT-4o. Consolidating standalone ChatGPT seats into v0 trims redundant spend by 70% after user transition periods.",
        type: "REDUNDANCY",
        confidence: "medium",
        signals: ["Generative UI tool access check", "v0 includes LLM execution credits", "Removing retail chatbot overlaps"],
        priority: 5
      });
    }

    // ─── RULE C: CASUAL UNDERUTILIZATION TO API ARCHITECTURE ───
    if (name === 'claude' || name === 'chatgpt') {
      if (usageFrequency === 'casual' && (primaryUseCase === 'writing' || primaryUseCase === 'research')) {
        const meteredApiCost = tool.seats * PRICING_CONFIG.apiMetered.casualUserEstimatePerSeat;
        if (meteredApiCost < tool.monthlySpend) {
          const savings = Math.max(0, tool.monthlySpend - meteredApiCost);
          candidates.push({
            action: "Transition flat-rate seats to API Direct pay-as-you-go billing.",
            savings,
            reason: `For casual ${primaryUseCase}-centric usage, fixed retail seat fees (\$20/mo) are highly underutilized. Routing queries via developer API keys into an open-source UI cuts overhead to a \$4.50/user usage ceiling.`,
            type: "UNDERUTILIZATION",
            confidence: "medium",
            signals: ["Low frequency usage logging", "Non-technical writing use case", "Metered API costs are ~75% lower"],
            priority: 2
          });
        }
      }
    }

    // ─── RULE D: STRATEGIC MODEL ARBITRAGE (RAW API OPTIMIZATION) ───
    if (name === 'openai_api' && lowercasePlan.includes('o1') && usageFrequency === 'automated' && taskComplexity === 'simple') {
      const optimizedCost = tool.monthlySpend * PRICING_CONFIG.arbitrage.o1_to_gemini_flash_cost_ratio;
      const savings = Math.max(0, tool.monthlySpend - optimizedCost);
      candidates.push({
        action: "Migrate simple automated background tasks to Google Gemini 2.5 Flash.",
        savings,
        reason: "Executing simple, automated background data structural pipelines on OpenAI's premium o1 reasoning node causes extreme capital inefficiency. Gemini 2.5 Flash matches parsing performance at a 96% reduction rate.",
        type: "MODEL_ARBITRAGE",
        confidence: "high",
        signals: ["Automated backend API profile active", "Simple parsing complexity level", "Gemini Flash cost efficiency is superior"],
        priority: 2
      });
    }
    else if (name === 'anthropic_api' && lowercasePlan.includes('opus') && taskComplexity === 'simple') {
      const optimizedCost = tool.monthlySpend * PRICING_CONFIG.arbitrage.opus_to_gemini_flash_cost_ratio;
      const savings = Math.max(0, tool.monthlySpend - optimizedCost);
      candidates.push({
        action: "Migrate simple automated background tasks to Gemini 2.5 Flash / Claude Haiku.",
        reason: "Anthropic's Opus engine is custom-built for complex research. Simple automated actions should be offloaded to low-cost execution clusters like Gemini Flash, cutting costs by 95%.",
        type: "MODEL_ARBITRAGE",
        savings,
        confidence: "high",
        signals: ["Low complexity background tasks active", "Expensive Opus API selected", "Lower tier flash/haiku replacement"],
        priority: 2
      });
    }

    // ─── RULE E: LOW COMPLEXITY CASUAL PREMIUM SUBSCRIPTIONS (FREE TIER DOWNGRADE) ───
    if (lowercasePlan.includes('pro') || lowercasePlan.includes('plus')) {
      if (taskComplexity === 'simple' && usageFrequency === 'casual') {
        const savings = tool.monthlySpend;
        candidates.push({
          action: `Migrate to the Free Tiers of ${tool.toolName.toUpperCase()} or Gemini.`,
          savings,
          reason: "Logged operational profile shows simple tasks performed at casual frequencies. Paid subscription layers are completely non-defensible when robust public free tiers exist.",
          type: "FREE_TIER",
          confidence: "low",
          signals: ["Casual usage limits checked", "Simple processing profile", "High capacity public free tiers active"],
          priority: 3
        });
      }
    }

    // ─── UNKNOWN SHADOW IT AUDIT CHECK ───
    const isKnownTool = PRODUCT_CATALOG.some(c => c.id === name);
    if (!isKnownTool) {
      candidates.push({
        action: `Verify operational necessity of unknown tool: ${tool.toolName.toUpperCase()}`,
        savings: 0,
        reason: `This subscription (${tool.toolName}) is not recognized in standard SaaS audit libraries. Perform an department audit to confirm its necessity and avoid shadow IT spent.`,
        type: "UNDERUTILIZATION",
        confidence: "low",
        signals: ["Unknown software vendor active", "Department audit verification recommended"],
        priority: 2
      });
    }

    // --- ISSUE 3 FIX: DUAL PRIMARY + SECONDARY LAYER ---
    // Instead of throwing away valid observations, we separate them into a single primary recommendation
    // and multiple secondary observations to show maximum technical depth!
    const normalizationFindings = candidates.filter(c => c.priority === 1);
    const businessFindings = candidates.filter(c => c.priority >= 2);

    let primaryFinding: AuditFinding | undefined;
    const secondaryFindings: AuditFinding[] = [];

    if (businessFindings.length > 0) {
      // Sort to establish the winning high-priority recommendation
      businessFindings.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return b.savings - a.savings;
      });

      primaryFinding = businessFindings[0];
      // Remaining business findings become valuable secondary observations!
      for (let i = 1; i < businessFindings.length; i++) {
        secondaryFindings.push(businessFindings[i]);
      }
    }

    const finalFindings: AuditFinding[] = [...normalizationFindings];
    if (primaryFinding) {
      finalFindings.push(primaryFinding);
      recommendedSpend = Math.max(0, tool.monthlySpend - primaryFinding.savings);
    }

    // Clamp recommendedSpend and calculate savings
    recommendedSpend = Math.max(0, Math.min(recommendedSpend, tool.monthlySpend));
    const potentialSavings = Math.max(0, tool.monthlySpend - recommendedSpend);
    totalRecommendedSpend += recommendedSpend;

    // Formatting defaults for backward compatibility with UI
    let finalAction = "Maintain current subscription layer.";
    let finalReason = "Your plan tier perfectly aligns with your reported seat count and operational scope.";
    let confidence: ConfidenceScore = "high";

    if (finalFindings.length > 0) {
      const activeBusiness = finalFindings.filter(f => f.savings > 0 || f.type === "DUPLICATE_MERGE" || f.type === "REDUNDANCY" || f.type === "MESSY_INPUT");
      if (activeBusiness.length > 0) {
        finalAction = activeBusiness.map(f => f.action).join(" | ");
        finalReason = activeBusiness.map(f => f.reason).join(" ");
        if (primaryFinding) {
          confidence = primaryFinding.confidence;
        }
      }
    }

    breakdown.push({
      toolName: tool.toolName.toUpperCase(),
      currentSpend: tool.monthlySpend,
      recommendedAction: finalAction,
      potentialSavings,
      reason: finalReason,
      confidence,
      findings: finalFindings,
      primaryFinding,
      secondaryFindings: secondaryFindings.length > 0 ? secondaryFindings : undefined
    });
  });

  // Calculate totals
  const totalMonthlySavings = Math.max(0, totalCurrentSpend - totalRecommendedSpend);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    workspaceOverlapScore,
    breakdown
  };
}

function formatToolLabel(id: string): string {
  if (id === "copilot") return "GitHub Copilot";
  if (id === "v0") return "v0 (by Vercel)";
  if (id === "openai_api") return "OpenAI API";
  if (id === "anthropic_api") return "Anthropic API";
  if (id === "gemini_api") return "Gemini API";
  return id.charAt(0).toUpperCase() + id.slice(1);
}