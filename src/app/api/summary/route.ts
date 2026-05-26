// src/app/api/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuditResult } from "../../../types/audit";

export async function POST(req: NextRequest) {
  try {
    const { auditResult, teamSize, primaryUseCase } = await req.json();

    if (!auditResult) {
      return NextResponse.json({ error: "Missing audit results" }, { status: 400 });
    }

    const {
      totalCurrentSpend,
      totalRecommendedSpend,
      totalMonthlySavings,
      totalAnnualSavings,
      workspaceOverlapScore,
      breakdown
    } = auditResult as AuditResult;

    // Construct the context prompt for the AI
    const toolsText = breakdown
      .map(
        (b) =>
          `- ${b.toolName}: current spend $${b.currentSpend}/mo. Recommended action: "${b.recommendedAction}". Potential Savings: $${b.potentialSavings}/mo. Reason: "${b.reason}"`
      )
      .join("\n");

    const promptText = `You are a blunt, pragmatic, and highly experienced fractional CFO for technology startups.
Analyze the following AI tool subscription spend audit for a team of ${teamSize} users specializing in ${primaryUseCase}:

- Total Current Spend: $${totalCurrentSpend.toFixed(2)}/month
- Optimized Target Spend: $${totalRecommendedSpend.toFixed(2)}/month
- Total Monthly Savings: $${totalMonthlySavings.toFixed(2)}/month
- Total Annual Savings: $${totalAnnualSavings.toFixed(2)}/year
- Ecosystem Redundancy Overlap Score: ${workspaceOverlapScore}% (higher means more duplicate features and waste across tools)

Per-Tool Breakdown & Core Findings:
${toolsText}

Write a direct, professional, and slightly blunt personalized executive spend summary (exactly 80 to 110 words) for the startup founder or engineering manager.
Focus on:
1. Identifying the single largest leak of capital or operational inefficiency.
2. A defensive recommendation (e.g., standardizing IDEs, consolidating redundant chatbots, shifting low-complexity background APIs to cheaper flash tiers).
3. Connect significant savings opportunity (>=$500/mo) to the ultimate solution: locking in discounted enterprise credits via Credex.
Do NOT use generic boilerplate introductions like "Here is your summary" or "Based on your audit." Dive straight into the critique. Keep the tone financial, analytical, and highly actionable.`;

    let generatedText = "";
    let methodUsed = "";

    // 1. Try Gemini API if key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.3,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          methodUsed = "gemini";
        } else {
          console.error("Gemini API error status:", response.status);
        }
      } catch (err) {
        console.error("Failed to connect to Gemini API:", err);
      }
    }

    // 2. Try Anthropic API if Gemini fails/missing, and Anthropic key is available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!generatedText && anthropicKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 250,
            messages: [{ role: "user", content: promptText }],
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          generatedText = data.content?.[0]?.text?.trim() || "";
          methodUsed = "anthropic";
        } else {
          console.error("Anthropic API error status:", response.status);
        }
      } catch (err) {
        console.error("Failed to connect to Anthropic API:", err);
      }
    }

    // 3. High-Quality Deterministic CFO Fallback if both API integrations are unavailable or fail
    if (!generatedText) {
      methodUsed = "fallback";
      if (totalMonthlySavings <= 10) {
        generatedText = `Your current AI subscription stack is exceptionally lean and highly optimized. Operating at $${totalCurrentSpend.toFixed(2)}/mo for ${teamSize} developer(s), your tool configurations exhibit zero duplicate overlapping capacities (Ecosystem Overlap: ${workspaceOverlapScore}%). By avoiding expensive redundant chat interfaces and maintaining clean vendor hygiene, you are retaining maximum capital efficiency. No immediate migrations or subscription downgrades are recommended. Continue monitoring usage to prevent creeping subscription bloat as the team scales.`;
      } else {
        const majorLeak = workspaceOverlapScore > 50 
          ? "severe multi-tool overlap (e.g., dual editor or duplicate chat assistant licenses)"
          : totalCurrentSpend > 200 && breakdown.some(b => b.toolName.toLowerCase().includes("api"))
          ? "highly inefficient metered raw API routing (using premium reasoning models like o1 or Opus on simple data pipelines)"
          : "phantom ghost seat overhead in flat-rate team plans";
          
        const savingsPitch = totalMonthlySavings >= 500
          ? ` This represents massive leakage of $${totalAnnualSavings.toFixed(2)} annually. To capture these savings without disrupting dev flows, consolidate licenses and partner with Credex to procure enterprise-grade Claude, Cursor, and ChatGPT credits at deep discounts.`
          : ` Consolidating these duplications and scaling down to individual tiers or metered APIs immediately trims operational bloat and keeps your runway secure.`;

        generatedText = `Your AI portfolio suffers from noticeable inefficiencies, leaking $${totalMonthlySavings.toFixed(2)}/month. The root issue stems from ${majorLeak}, which inflates your operational budget by ${((totalMonthlySavings / totalCurrentSpend) * 100).toFixed(0)}%. You should immediately consolidate redundant subscription layers and enforce single-editor standardization across your ${teamSize} seat footprint.${savingsPitch}`;
      }
    }

    return NextResponse.json({
      summary: generatedText,
      method: methodUsed,
    });
  } catch (error: any) {
    console.error("POST /api/summary server error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
