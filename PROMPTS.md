# Prompt Engineering & Design — SpendOptima

Personalized financial critiques are generated using the Google Gemini 2.5 Flash API (with automated fallbacks to Anthropic's Claude and robust local template adapters). This document details our exact prompt templates and design decisions.

---

## 1. The Active Production Prompt Template
The prompt template is compiled dynamically inside `src/app/api/summary/route.ts` using the user's audit baseline metrics and raw calculations:

```text
You are a blunt, pragmatic, and highly experienced fractional CFO for technology startups.
Analyze the following AI tool subscription spend audit for a team of {teamSize} users specializing in {primaryUseCase}:

- Total Current Spend: ${totalCurrentSpend}/month
- Optimized Target Spend: ${totalRecommendedSpend}/month
- Total Monthly Savings: ${totalMonthlySavings}/month
- Total Annual Savings: ${totalAnnualSavings}/year
- Ecosystem Redundancy Overlap Score: {workspaceOverlapScore}% (higher means more duplicate features and waste across tools)

Per-Tool Breakdown & Core Findings:
{toolsText}

Write a direct, professional, and slightly blunt personalized executive spend summary (exactly 80 to 110 words) for the startup founder or engineering manager.
Focus on:
1. Identifying the single largest leak of capital or operational inefficiency.
2. A defensive recommendation (e.g., standardizing IDEs, consolidating redundant chatbots, shifting low-complexity background APIs to cheaper flash tiers).
3. Connect significant savings opportunity (>=$500/mo) to the ultimate solution: locking in discounted enterprise credits via Credex.
Do NOT use generic boilerplate introductions like "Here is your summary" or "Based on your audit." Dive straight into the critique. Keep the tone financial, analytical, and highly actionable.
```

---

## 2. Rationale behind the Prompt Structure

### A. Strict Role-Play Directives
Startup founders and engineering managers are busy and highly cynical. If the AI sounds like a generic assistant, they will ignore it. By instructing the model to act as a *"blunt, pragmatic fractional CFO,"* we force the model to adopt an authoritative, analytical, and highly direct tone.

### B. Specific Structured Context Injection
Rather than passing unstructured raw user inputs and letting the model guess the math, we pre-calculate all numbers (spend, savings, overlap) in the deterministic audit engine and pass the finalized numbers. This ensures that the AI summary is **100% aligned with the hard math shown on the screen**, preventing numerical hallucinations.

### C. Explicit Word-Count Clamp
We enforce a strict target of **80 to 110 words** (roughly a single punchy paragraph). This keeps the visual height consistent on the dashboard UI and ensures the review is scannable in under 15 seconds.

### D. Explicit Negative Constraints
By specifying *"Do NOT use generic boilerplate introductions,"* we prevent the model from wasting valuable space on fluff like *"I have analyzed your audit..."* or *"Congratulations on looking at your spend!"*

---

## 3. What We Tried That Didn't Work

### A. Letting the LLM calculate the savings
*What we tried*: Initially, we passed the raw list of tools and team sizes to the LLM and asked it to run the pricing comparison math and return the savings.
*Why it failed*: The LLM frequently hallucinated pricing details (e.g., asserting Cursor Teams was $20/mo instead of $40/mo) and made basic arithmetic errors, often generating math that contradicted the tool listings.
*The Correction*: We isolated the calculation logic entirely inside a deterministic TypeScript engine (`src/utils/auditengine.ts`) and used the LLM *only* for the synthesis and critique paragraph.

### B. Asking for a bulleted list
*What we tried*: We requested the model return its findings as a bulleted list of 3 items.
*Why it failed*: Bulleted lists frequently wrapped awkwardly on mobile screens, took up too much vertical space, and read like a generic duplicate of the "Actionable Recommendations" table already on the dashboard.
*The Correction*: We shifted the format to a single unified critique paragraph that reads like a premium CFO commentary.
