// src/app/report/[id]/page.tsx
import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseService } from "../../../utils/database";
import { ToolRecommendation } from "../../../types/audit";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic SEO and Open Graph metadata server-side
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const audit = await DatabaseService.getAudit(id);

  if (!audit) {
    return {
      title: "Report Not Found - SpendOptima",
      description: "The requested spend optimization audit report could not be found.",
    };
  }

  const savings = audit.result.totalMonthlySavings;
  const annualSavings = audit.result.totalAnnualSavings;

  return {
    title: `Startup AI Spend Audit - Saved $${savings.toFixed(0)}/mo`,
    description: `SpendOptima surfaced $${savings.toFixed(0)}/mo ($${annualSavings.toFixed(0)}/yr) in subscription overlaps and AI waste. Run your free audit!`,
    openGraph: {
      title: `Startup AI Spend Audit - Saved $${savings.toFixed(0)}/mo`,
      description: `SpendOptima surfaced $${savings.toFixed(0)}/mo ($${annualSavings.toFixed(0)}/yr) in subscription overlaps and AI waste. Run your free audit!`,
      type: "website",
      siteName: "SpendOptima by Credex",
    },
    twitter: {
      card: "summary_large_image",
      title: `Startup AI Spend Audit - Saved $${savings.toFixed(0)}/mo`,
      description: `SpendOptima surfaced $${savings.toFixed(0)}/mo ($${annualSavings.toFixed(0)}/yr) in subscription overlaps and AI waste. Run your free audit!`,
    }
  };
}

export default async function SharedReportPage({ params }: PageProps) {
  const { id } = await params;
  const audit = await DatabaseService.getAudit(id);

  if (!audit) {
    notFound();
  }

  const { payload, result, createdAt } = audit;
  const { totalCurrentSpend, totalRecommendedSpend, totalMonthlySavings, totalAnnualSavings, workspaceOverlapScore, breakdown } = result;

  const dateFormatted = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "REDUNDANCY": return "bg-rose-950/80 border-rose-500/30 text-rose-400";
      case "GHOST_SEATS": return "bg-amber-950/80 border-amber-500/30 text-amber-400";
      case "UNDERUTILIZATION": return "bg-sky-950/80 border-sky-500/30 text-sky-400";
      case "MODEL_ARBITRAGE": return "bg-indigo-950/80 border-indigo-500/30 text-indigo-400";
      case "FREE_TIER": return "bg-emerald-950/80 border-emerald-500/30 text-emerald-400";
      case "MESSY_INPUT": return "bg-orange-950/80 border-orange-500/30 text-orange-400";
      case "DUPLICATE_MERGE": return "bg-purple-950/80 border-purple-500/30 text-purple-400";
      default: return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  const getConfidenceStyle = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-emerald-950/80 border-emerald-500/30 text-emerald-400";
      case "medium": return "bg-amber-950/80 border-amber-500/30 text-amber-400";
      case "low": return "bg-sky-950/80 border-sky-500/30 text-sky-400";
      default: return "bg-slate-850 border-slate-700 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] font-sans antialiased pb-20 selection:bg-[#00f0ff] selection:text-black">
      
      {/* Background radial gradients */}
      <div className="spatial-bg" />

      {/* Header Banner */}
      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur-[40px] sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-9 w-9 rounded-xl bg-[#00f0ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/30 glow-breathe text-black">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </Link>
            <div>
              <h1 className="font-display text-lg font-black tracking-tight text-white flex items-center gap-2">
                SPENDOPTIMA <span className="font-sans text-[#00f0ff] font-medium text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-[#00f0ff]/30">Shared Report</span>
              </h1>
              <p className="text-4xs uppercase tracking-widest text-[#b9cacb] font-semibold">Anonymized startup subscription audit</p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="px-4 py-1.5 rounded-lg text-xs font-extrabold tracking-wide uppercase transition-all hologram-btn cursor-pointer text-center"
          >
            Run Your Audit
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        
        {/* Intro Card */}
        <section className="mb-8 p-6 rounded-2xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#00f0ff]/5 rounded-full blur-2xl"></div>
          <span className="text-3xs uppercase font-extrabold text-[#00f0ff] tracking-widest bg-cyan-950/30 border border-[#00f0ff]/20 px-2.5 py-1 rounded">Anonymized Audit Record</span>
          <h2 className="text-xl font-black text-white mt-4 tracking-tight">AI SUBSCRIPTION EFFICIENCY REPORT</h2>
          <p className="text-xs text-[#b9cacb] mt-1.5 font-medium">
            Compiled on <strong className="text-white">{dateFormatted}</strong> for a team specializing in <strong className="text-[#00f0ff] capitalize">{payload.primaryUseCase}</strong> workflows.
          </p>
        </section>

        {/* HERO METRICS SECTION */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl glass-panel flex flex-col justify-between">
            <span className="text-4xs uppercase tracking-widest font-black text-slate-400">Initial Spend</span>
            <div className="mt-2 text-xl font-black text-rose-400 text-kinetic">${totalCurrentSpend.toFixed(0)}<span className="text-3xs font-normal text-slate-500">/mo</span></div>
          </div>
          
          <div className="p-4 rounded-xl glass-panel flex flex-col justify-between">
            <span className="text-4xs uppercase tracking-widest font-black text-slate-400">Target Spend</span>
            <div className="mt-2 text-xl font-black text-sky-400 text-kinetic">${totalRecommendedSpend.toFixed(0)}<span className="text-3xs font-normal text-slate-500">/mo</span></div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 h-12 w-12 bg-emerald-500/5 rounded-full blur-xl"></div>
            <span className="text-4xs uppercase tracking-widest font-black text-emerald-400">Monthly Savings</span>
            <div className="mt-2 text-xl font-black text-emerald-400 text-kinetic">${totalMonthlySavings.toFixed(0)}<span className="text-3xs font-normal text-slate-500">/mo</span></div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex flex-col justify-between">
            <span className="text-4xs uppercase tracking-widest font-black text-amber-400">Annual Savings</span>
            <div className="mt-2 text-xl font-black text-[#ffb800] text-kinetic">${totalAnnualSavings.toFixed(0)}<span className="text-3xs font-normal text-slate-500">/yr</span></div>
          </div>
        </section>

        {/* ECOSYSTEM OVERLAP RISK BAR */}
        <section className="p-6 rounded-2xl glass-panel mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="shrink-0 flex flex-col items-center">
            <span className="text-4xs uppercase tracking-widest font-black text-slate-400 mb-2">Ecosystem Redundancy</span>
            <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center font-display font-black text-lg transition-all hologram-ring glow-breathe ${
              workspaceOverlapScore > 65 ? "text-rose-400 border-rose-500/30 bg-rose-950/10" :
              workspaceOverlapScore > 35 ? "text-[#ffb800] border-[#ffb800]/30 bg-amber-950/10" :
              "text-emerald-400 border-emerald-500/30 bg-emerald-950/10"
            }`}>
              {workspaceOverlapScore}%
            </div>
          </div>

          <div className="flex-1 w-full space-y-3.5">
            <div>
              <h3 className="text-3xs font-black text-slate-450 uppercase tracking-widest">Ecosystem Efficiency Score</h3>
              <p className="text-2xs text-[#b9cacb] mt-1 font-medium leading-relaxed">
                {workspaceOverlapScore > 65 
                  ? "Severe multi-tool overlaps detected. Duplicate features are causing unnecessary runway drain."
                  : workspaceOverlapScore > 35 
                  ? "Moderate subscription overlaps detected. Consolidating tools could recoup useful cash flow."
                  : "Excellent subscription alignment! This setup contains negligible waste or redundant licenses."}
              </p>
            </div>
            
            <div className="h-5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-1 flex">
              {totalCurrentSpend > 0 ? (
                <>
                  <div 
                    className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                    style={{ width: `${(totalRecommendedSpend / totalCurrentSpend) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(totalMonthlySavings / totalCurrentSpend) * 100}%` }}
                  ></div>
                </>
              ) : (
                <div className="w-full text-center text-4xs text-slate-500 font-bold self-center uppercase tracking-widest">No active portfolio subscriptions</div>
              )}
            </div>
            <div className="flex items-center justify-between text-4xs text-slate-400 px-1 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-600"></span> Optimized Target Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Unlocked Runway Savings
              </span>
            </div>
          </div>
        </section>

        {/* DETAILED RECOMMENDATIONS */}
        <section className="space-y-6">
          <h3 className="text-4xs uppercase font-black text-slate-500 tracking-widest">Defensible Audited Tiers</h3>

          <div className="space-y-4">
            {breakdown.map((item: ToolRecommendation, idx: number) => {
              const isSaving = item.potentialSavings > 0;
              return (
                <div 
                  key={idx}
                  className={`p-5 rounded-xl border transition-all ${
                    isSaving 
                      ? "bg-[#1c1b1b]/30 border-[#00f0ff]/20 shadow-lg" 
                      : "bg-black/20 border-white/5"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="space-y-1">
                      <span className="font-display font-black text-xs tracking-wider text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded uppercase">
                        {item.toolName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaving && (
                        <span className={`text-4xs font-black uppercase px-2 py-0.5 rounded border ${getConfidenceStyle(item.confidence)}`}>
                          {item.confidence} Confidence
                        </span>
                      )}
                      {isSaving && (
                        <div className="shrink-0 px-3 py-0.5 rounded bg-cyan-950/30 border border-[#00f0ff]/30 text-[#00f0ff] text-center">
                          <div className="text-2xs font-black">${item.potentialSavings.toFixed(0)} saved</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations displays */}
                  <div className="mt-3.5 space-y-4">
                    {item.primaryFinding ? (
                      <div className="p-3.5 rounded-xl bg-black/40 border border-[#00f0ff]/20 flex flex-col gap-2.5">
                        <span className={`text-4xs font-black uppercase px-2 py-0.5 rounded border ${getBadgeStyle(item.primaryFinding.type)}`}>
                          ★ Recommendation: {item.primaryFinding.type.replace("_", " ")}
                        </span>
                        <div className="font-extrabold text-slate-100 text-xs mt-1 leading-snug">{item.primaryFinding.action}</div>
                        <div className="text-slate-400 leading-relaxed text-2xs">{item.primaryFinding.reason}</div>
                        
                        {item.primaryFinding.signals && item.primaryFinding.signals.length > 0 && (
                          <div className="mt-1 pt-2.5 border-t border-white/5">
                            <div className="flex flex-wrap gap-1">
                              {item.primaryFinding.signals.map((sig, sidx) => (
                                <span key={sidx} className="text-4xs px-2 py-0.5 rounded bg-black border border-white/10 text-slate-400 font-semibold">
                                  ✓ {sig}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xs text-slate-500 font-semibold uppercase flex items-center gap-1.5 py-1 px-1">
                        <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                        </svg>
                        Optimal Subscription. No waste detected.
                      </div>
                    )}

                    {item.secondaryFindings && item.secondaryFindings.length > 0 && (
                      <div className="space-y-2 mt-2 pt-3 border-t border-white/5">
                        <h4 className="text-4xs uppercase font-black text-[#00f0ff] tracking-wider mb-2">Secondary Insights:</h4>
                        {item.secondaryFindings.map((finding, fidx) => (
                          <div key={fidx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1.5 text-2xs">
                            <span className="text-4xs font-black text-slate-400 bg-black border border-white/10 px-2 py-0.5 rounded uppercase self-start">
                              {finding.type.replace("_", " ")}
                            </span>
                            <div className="font-extrabold text-slate-300 leading-snug">{finding.action}</div>
                            <div className="text-slate-400 leading-relaxed">{finding.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* VIRAL SIGNUP CAPTURE LOOP FOR VISITORS */}
        <section className="mt-12 p-6 rounded-2xl glass-panel relative overflow-hidden text-center space-y-4">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#00f0ff]/5 rounded-full blur-2xl"></div>
          <h3 className="font-display font-black text-white text-lg tracking-tight uppercase">How much is your team leaking?</h3>
          <p className="text-2xs text-[#b9cacb] max-w-lg mx-auto leading-relaxed font-medium">
            AI billing is a complex black box. In 30 seconds, SpendOptima will audit your subscriptions, reveal expensive shadow IT tool bloat, and show how to recoup up to 40% of your budget.
          </p>
          <div className="pt-2">
            <Link 
              href="/"
              className="inline-block hologram-btn text-xs py-3 px-6 rounded-xl transition cursor-pointer"
            >
              Analyze Your AI Spend For Free
            </Link>
          </div>
        </section>

      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-20 text-center border-t border-white/10 pt-8 text-4xs text-slate-650 uppercase tracking-widest font-black">
        SpendOptima © 2026 is powered by Credex | Secure Discounted B2B Credits
      </footer>
    </div>
  );
}
