// scripts/test-engine.ts
import { calculateAudit } from '../src/utils/auditengine';
import { AuditPayload } from '../src/types/audit';

interface TestCase {
  name: string;
  category: "VALID_INPUTS" | "INVALID_INPUTS" | "EDGE_CASES" | "BUSINESS_LOGIC" | "STABILITY";
  payload: AuditPayload;
  assert: (result: any) => { passed: boolean; message: string };
}

const TEST_CASES: TestCase[] = [
  // ==========================================
  // CATEGORY 1: VALID INPUTS
  // ==========================================
  {
    name: "Standard Plans Overlap (Test 1 Stack)",
    category: "VALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: 20, seats: 1 },
        { toolName: "copilot", planName: "Individual Essential", monthlySpend: 10, seats: 1 },
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 20, seats: 1 },
        { toolName: "claude", planName: "Pro", monthlySpend: 20, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings.toFixed(2) === "21.00" && r.totalRecommendedSpend.toFixed(2) === "49.00";
      return { passed, message: `Expected savings $21.00 (Copilot and ChatGPT redundant, adjusted by 70% realism coefficient). Got savings: $${r.totalMonthlySavings.toFixed(2)}, recommend spend: $${r.totalRecommendedSpend.toFixed(2)}` };
    }
  },
  {
    name: "Already Optimized Operation (Test 4 Stack)",
    category: "VALID_INPUTS",
    payload: {
      teamSize: 3,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: 60, seats: 3 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 0 && r.totalRecommendedSpend === 60;
      return { passed, message: `Expected $0 savings. Got savings: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "Direct Windsurf + Copilot Overlap",
    category: "VALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "windsurf", planName: "Pro", monthlySpend: 20, seats: 1 },
        { toolName: "copilot", planName: "Individual Essential", monthlySpend: 10, seats: 1 }
      ]
    },
    assert: (r) => {
      const copilotFinding = r.breakdown.find((b: any) => b.toolName === "COPILOT");
      const passed = copilotRecomHasType(copilotFinding, "REDUNDANCY") && r.totalMonthlySavings.toFixed(2) === "7.00";
      return { passed, message: `Expected Copilot redundancy ($7.00 savings, 70% realism adjusted). Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },

  // ==========================================
  // CATEGORY 2: INVALID INPUTS (STABILITY)
  // ==========================================
  {
    name: "NaN Monthly Spend Safeguard",
    category: "INVALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: NaN, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalCurrentSpend === 0 && r.totalMonthlySavings === 0 && r.breakdown[0].findings[0].type === "MESSY_INPUT";
      return { passed, message: `Expected spend to clamp to $0.00 and flag MESSY_INPUT. Got spend: $${r.totalCurrentSpend}` };
    }
  },
  {
    name: "Missing/Empty Tool Name Safeguard",
    category: "INVALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "", planName: "Pro", monthlySpend: 20, seats: 1 },
        { toolName: "  " as any, planName: "Pro", monthlySpend: 20, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalCurrentSpend === 0 && r.breakdown.length === 0;
      return { passed, message: `Expected empty strings to be gracefully bypassed. Got count: ${r.breakdown.length}, spend: $${r.totalCurrentSpend}` };
    }
  },
  {
    name: "Negative Monthly Spend Safeguard",
    category: "INVALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: -100, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalCurrentSpend === 0 && r.breakdown[0].findings[0].type === "MESSY_INPUT";
      return { passed, message: `Expected negative spend clamped to $0 and flag MESSY_INPUT. Got spend: $${r.totalCurrentSpend}` };
    }
  },
  {
    name: "Decimal Seat Count Normalization",
    category: "INVALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: 50, seats: 2.5 }
      ]
    },
    assert: (r) => {
      const passed = r.breakdown[0].findings[0].type === "MESSY_INPUT" && r.totalCurrentSpend === 50;
      return { passed, message: `Expected decimal seats clamp to integer 2 and flag MESSY_INPUT. Got findings count: ${r.breakdown[0].findings.length}` };
    }
  },
  {
    name: "Zero Seats Dormant Tier Normalization",
    category: "INVALID_INPUTS",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "claude", planName: "Pro", monthlySpend: 40, seats: 0 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 40 && r.totalRecommendedSpend === 0 && r.breakdown[0].findings[0].type === "MESSY_INPUT";
      return { passed, message: `Expected $40 savings from decommissioning 0 seats. Got savings: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },

  // ==========================================
  // CATEGORY 3: EDGE CASES
  // ==========================================
  {
    name: "Enterprise Scalability (Huge Spends)",
    category: "EDGE_CASES",
    payload: {
      teamSize: 500,
      primaryUseCase: "mixed",
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "claude", planName: "Enterprise Tier", monthlySpend: 1500000, seats: 500 }
      ]
    },
    assert: (r) => {
      const passed = r.totalCurrentSpend === 1500000 && r.totalMonthlySavings === 0;
      return { passed, message: `Expected $1.5M spend with $0 savings. Got spend: $${r.totalCurrentSpend.toFixed(2)}, savings: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "Duplicate Tool Consolidations",
    category: "EDGE_CASES",
    payload: {
      teamSize: 5,
      primaryUseCase: "mixed",
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 40, seats: 2 },
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 60, seats: 3 }
      ]
    },
    assert: (r) => {
      const passed = r.breakdown.length === 1 && r.breakdown[0].findings.some((f: any) => f.type === "DUPLICATE_MERGE") && r.totalCurrentSpend === 100;
      return { passed, message: `Expected duplicates consolidated into 1 record ($100 spend, DUPLICATE_MERGE flag). Got count: ${r.breakdown.length}, spend: $${r.totalCurrentSpend}` };
    }
  },
  {
    name: "Impossible Savings Prevention (Recommending Expensive Tiers)",
    category: "EDGE_CASES",
    payload: {
      teamSize: 1,
      primaryUseCase: "writing",
      usageFrequency: "casual",
      taskComplexity: "simple",
      tools: [
        { toolName: "chatgpt", planName: "Custom Low-Tier", monthlySpend: 2, seats: 1 } // Less than API switch ($4.50)
      ]
    },
    assert: (r) => {
      const passed = r.totalRecommendedSpend <= r.totalCurrentSpend;
      return { passed, message: `Expected recommended spend to be clamped at current spend ($2.00) or below. Got: $${r.totalRecommendedSpend}` };
    }
  },
  {
    name: "Ecosystem Multi-Overlap (Cursor + Copilot + ChatGPT + Claude + v0)",
    category: "EDGE_CASES",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: 20, seats: 1 },
        { toolName: "copilot", planName: "Individual Essential", monthlySpend: 10, seats: 1 },
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 20, seats: 1 },
        { toolName: "claude", planName: "Pro", monthlySpend: 20, seats: 1 },
        { toolName: "v0", planName: "Premium", monthlySpend: 20, seats: 1 }
      ]
    },
    assert: (r) => {
      const cgRec = r.breakdown.find((b: any) => b.toolName === "CHATGPT");
      // ChatGPT matches redundancy with Claude Pro, which wins (Priority 5)
      const hasChatgptOverlap = cgRec?.findings?.some((f: any) => f.type === "REDUNDANCY");
      const passed = r.totalMonthlySavings.toFixed(2) === "21.00" && hasChatgptOverlap; // Copilot (10 * 0.7 = 7) + ChatGPT (20 * 0.7 = 14) = 21.00 savings
      return { passed, message: `Expected $21.00 total savings (Copilot drop $7 + ChatGPT drop $14, adjusted by friction coefficient). Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },

  // ==========================================
  // CATEGORY 4: BUSINESS LOGIC TESTS
  // ==========================================
  {
    name: "Claude Team Floor Downgrade (3 Seats minimum trap)",
    category: "BUSINESS_LOGIC",
    payload: {
      teamSize: 3,
      primaryUseCase: "writing",
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "claude", planName: "Team Standard", monthlySpend: 150, seats: 3 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 90 && r.totalRecommendedSpend === 60;
      return { passed, message: `Expected $90 savings due to 5-seat minimum Floor ($150 spend -> $60 target). Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "ChatGPT Team Phantom Seat Downgrade (1 seat)",
    category: "BUSINESS_LOGIC",
    payload: {
      teamSize: 1,
      primaryUseCase: "mixed",
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "chatgpt", planName: "Team", monthlySpend: 60, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 40 && r.totalRecommendedSpend === 20;
      return { passed, message: `Expected $40 savings from Team-to-Plus downgrade. Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "Casual Research API Direct Switch",
    category: "BUSINESS_LOGIC",
    payload: {
      teamSize: 5,
      primaryUseCase: "research",
      usageFrequency: "casual",
      taskComplexity: "moderate",
      tools: [
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 100, seats: 5 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 77.50 && r.totalRecommendedSpend === 22.50;
      return { passed, message: `Expected $77.50 savings due to API metered keys. Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "Annual Savings Accuracy Check",
    category: "BUSINESS_LOGIC",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: 20, seats: 1 },
        { toolName: "copilot", planName: "Individual Essential", monthlySpend: 10, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalAnnualSavings.toFixed(2) === (r.totalMonthlySavings * 12).toFixed(2) && r.totalAnnualSavings.toFixed(2) === "84.00"; // 7 * 12 = 84
      return { passed, message: `Expected Annual savings to be $84. Got: $${r.totalAnnualSavings.toFixed(2)}` };
    }
  },
  {
    name: "Model Arbitrage Raw API o1 to Gemini Flash",
    category: "BUSINESS_LOGIC",
    payload: {
      teamSize: 1,
      primaryUseCase: "data",
      usageFrequency: "automated",
      taskComplexity: "simple",
      tools: [
        { toolName: "openai_api", planName: "o1 API usage", monthlySpend: 1000, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 960 && r.totalRecommendedSpend === 40;
      return { passed, message: `Expected 96% savings ($960) migrating automated sorting to Gemini Flash. Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },

  // ==========================================
  // CATEGORY 5: STABILITY TESTS (CONTRADICTION & PRIORITIES)
  // ==========================================
  {
    name: "Contradiction Resolution (Decommission wins over API/Free)",
    category: "STABILITY",
    payload: {
      teamSize: 1,
      primaryUseCase: "writing",
      usageFrequency: "casual",
      taskComplexity: "simple",
      tools: [
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 20, seats: 1 },
        { toolName: "claude", planName: "Pro", monthlySpend: 20, seats: 1 }
      ]
    },
    assert: (r) => {
      const cgRec = r.breakdown.find((b: any) => b.toolName === "CHATGPT");
      // ChatGPT hits Priority 5 redundancy (savings = 20 * 0.7 = 14)
      // Claude Pro hits Priority 3 Free tier downgrade (savings = 20 * 1.0 = 20)
      // Total savings = 14 + 20 = 34.00
      const passed = r.totalMonthlySavings.toFixed(2) === "34.00" && cgRec.recommendedAction.includes("Consolidate Chat Web Assistants");
      return { passed, message: `Expected $34.00 savings from ChatGPT consolidation and Claude free-tier downgrade (Priority 5 wins). Got: $${r.totalMonthlySavings.toFixed(2)}, action: "${cgRec.recommendedAction}"` };
    }
  },
  {
    name: "Unknown Use Case Fallback Gracefully",
    category: "STABILITY",
    payload: {
      teamSize: 2,
      primaryUseCase: "growth_marketing_hacks" as any,
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "chatgpt", planName: "Plus", monthlySpend: 40, seats: 2 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings === 0 && r.totalRecommendedSpend === 40;
      return { passed, message: `Expected generic fallback to maintain spend ($40). Got savings: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "Unknown Shadow IT Tool Check",
    category: "STABILITY",
    payload: {
      teamSize: 1,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "moderate",
      tools: [
        { toolName: "notion_ai" as any, planName: "Plus Tier", monthlySpend: 16, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.breakdown[0].findings[0].action.includes("Verify operational necessity") && r.totalMonthlySavings === 0;
      return { passed, message: `Expected fallback shadow IT warning with $0 savings. Got: $${r.totalMonthlySavings.toFixed(2)}, action: "${r.breakdown[0].findings[0].action}"` };
    }
  },
  {
    name: "Case Sensitivity Normalization Check",
    category: "STABILITY",
    payload: {
      teamSize: 1,
      primaryUseCase: "CODING" as any,
      usageFrequency: "ACTIVE" as any,
      taskComplexity: "ADVANCED" as any,
      tools: [
        { toolName: "Cursor" as any, planName: "PRO", monthlySpend: 20, seats: 1 },
        { toolName: "CoPilot" as any, planName: "ESSENTIAL", monthlySpend: 10, seats: 1 }
      ]
    },
    assert: (r) => {
      const passed = r.totalMonthlySavings.toFixed(2) === "7.00" && r.totalRecommendedSpend.toFixed(2) === "23.00"; // Copilot redundant: 10 * 0.7 = 7 savings
      return { passed, message: `Expected normalized inputs to evaluate Copilot overlap ($7.00 savings). Got: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  },
  {
    name: "Ecosystem Conflict Alert (Cursor + Windsurf active)",
    category: "STABILITY",
    payload: {
      teamSize: 5,
      primaryUseCase: "coding",
      usageFrequency: "active",
      taskComplexity: "advanced",
      tools: [
        { toolName: "cursor", planName: "Pro", monthlySpend: 60, seats: 3 },
        { toolName: "windsurf", planName: "Pro", monthlySpend: 40, seats: 2 }
      ]
    },
    assert: (r) => {
      const curRec = r.breakdown.find((b: any) => b.toolName === "CURSOR");
      const hasConflictAlert = curRec?.findings?.some((f: any) => f.action.includes("Consolidate IDE Editors"));
      const passed = r.totalMonthlySavings.toFixed(2) === "42.00" && hasConflictAlert; // Drops Cursor (redundant: 60 * 0.70 = 42.00 savings)
      return { passed, message: `Expected $42.00 savings from dropping Cursor to resolve conflict (60 * 0.7), plus IDE conflict warnings. Got savings: $${r.totalMonthlySavings.toFixed(2)}` };
    }
  }
];

function copilotRecomHasType(rec: any, type: string): boolean {
  return rec?.findings?.some((f: any) => f.type === type);
}

function runTestSuite() {
  console.log("\n==========================================================================");
  console.log("🔥 RUNNING ULTIMATE SIGNAL-BASED CFO AUDIT ENGINE TEST SUITE (22 CASES) 🔥");
  console.log("==========================================================================\n");

  const categories = ["VALID_INPUTS", "INVALID_INPUTS", "EDGE_CASES", "BUSINESS_LOGIC", "STABILITY"] as const;

  let totalPassed = 0;

  categories.forEach((cat) => {
    const catTests = TEST_CASES.filter(t => t.category === cat);
    console.log(`▶ CATEGORY: ${cat} (${catTests.length} cases)`);
    console.log("--------------------------------------------------------------------------");

    let catPassed = 0;
    catTests.forEach((test, idx) => {
      const startStr = `  [CASE ${String(idx + 1).padStart(2, '0')}] ${test.name.padEnd(55)}`;
      try {
        const result = calculateAudit(test.payload);
        const assertion = test.assert(result);

        if (assertion.passed) {
          catPassed++;
          totalPassed++;
          console.log(`${startStr} ✅ PASSED`);
        } else {
          console.log(`${startStr} ❌ FAILED`);
          console.log(`       ↳ Reason: ${assertion.message}\n`);
        }
      } catch (e: any) {
        console.log(`${startStr} 💥 CRASHED`);
        console.error(e);
        console.log("");
      }
    });
    console.log(`  Subtotal: ${catPassed} / ${catTests.length} Passed\n`);
  });

  console.log("==========================================================================");
  console.log(`📊 FINAL REPORT: ${totalPassed} / ${TEST_CASES.length} Cases Passed (${Math.round((totalPassed / TEST_CASES.length) * 100)}%)`);
  console.log("==========================================================================\n");

  if (totalPassed === TEST_CASES.length) {
    console.log("👑 CONGRATULATIONS! ALL 22 HIGH-MATURITY TEST CASES PASSED FLawlessly!");
    console.log("Your signal-based intelligence audit engine is production-grade and bulletproof.");
    process.exit(0);
  } else {
    console.log("⚠️ TEST FAILURE DETECTED. Please review the failures above.");
    process.exit(1);
  }
}

runTestSuite();
