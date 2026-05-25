"use client";

import React, { useState, useEffect } from "react";
import { 
  PrimaryUseCase, 
  UsageFrequency, 
  TaskComplexity, 
  ToolInput, 
  AuditPayload, 
  AuditResult, 
  ToolName 
} from "../types/audit";
import { 
  calculateAudit, 
  PRODUCT_CATALOG, 
  getSortedCatalog, 
  ProductCatalogItem 
} from "../utils/auditengine";

// Helper for tool name formatting
const formatToolName = (id: string): string => {
  if (id === "copilot") return "GitHub Copilot";
  if (id === "v0") return "v0 (by Vercel)";
  if (id === "openai_api") return "OpenAI API";
  if (id === "anthropic_api") return "Anthropic API";
  if (id === "gemini_api") return "Gemini API";
  return id.charAt(0).toUpperCase() + id.slice(1);
};

// Initial state - Scenario 1 (The Tech Bro Stack)
const SCENARIO_1: AuditPayload = {
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
};

const SCENARIO_2: AuditPayload = {
  teamSize: 1,
  primaryUseCase: "mixed",
  usageFrequency: "active",
  taskComplexity: "moderate",
  tools: [
    { toolName: "chatgpt", planName: "Team Plan", monthlySpend: 60, seats: 1 }
  ]
};

const SCENARIO_3: AuditPayload = {
  teamSize: 5,
  primaryUseCase: "writing",
  usageFrequency: "casual",
  taskComplexity: "moderate",
  tools: [
    { toolName: "claude", planName: "Pro", monthlySpend: 100, seats: 5 }
  ]
};

const SCENARIO_4: AuditPayload = {
  teamSize: 3,
  primaryUseCase: "coding",
  usageFrequency: "active",
  taskComplexity: "advanced",
  tools: [
    { toolName: "cursor", planName: "Pro", monthlySpend: 60, seats: 3 }
  ]
};

// Map tool catalog default values
const TOOL_DEFAULTS: Record<ToolName, { plan: string; spend: number }> = {
  cursor: { plan: "Pro", spend: 20 },
  copilot: { plan: "Individual Essential", spend: 10 },
  claude: { plan: "Pro", spend: 20 },
  chatgpt: { plan: "Plus", spend: 20 },
  windsurf: { plan: "Pro", spend: 20 },
  v0: { plan: "Premium", spend: 20 },
  openai_api: { plan: "o1 API", spend: 200 },
  anthropic_api: { plan: "Claude Sonnet 4.6 API", spend: 150 },
  gemini_api: { plan: "Gemini 2.5 Flash API", spend: 50 }
};

export default function AuditDashboard() {
  const [mounted, setMounted] = useState(false);
  const [teamSize, setTeamSize] = useState<number>(1);
  const [primaryUseCase, setPrimaryUseCase] = useState<PrimaryUseCase>("coding");
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency>("active");
  const [taskComplexity, setTaskComplexity] = useState<TaskComplexity>("advanced");
  const [tools, setTools] = useState<ToolInput[]>(SCENARIO_1.tools);
  const [activeTab, setActiveTab] = useState<"audit" | "matrix">("audit");

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cfo_audit_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuditPayload;
        setTeamSize(parsed.teamSize || 1);
        setPrimaryUseCase(parsed.primaryUseCase || "coding");
        setUsageFrequency(parsed.usageFrequency || "active");
        setTaskComplexity(parsed.taskComplexity || "advanced");
        setTools(parsed.tools || []);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (!mounted) return;
    const payload: AuditPayload = {
      teamSize,
      primaryUseCase,
      usageFrequency,
      taskComplexity,
      tools
    };
    localStorage.setItem("cfo_audit_state", JSON.stringify(payload));
  }, [teamSize, primaryUseCase, usageFrequency, taskComplexity, tools, mounted]);

  const loadScenario = (scenario: AuditPayload) => {
    setTeamSize(scenario.teamSize);
    setPrimaryUseCase(scenario.primaryUseCase);
    setUsageFrequency(scenario.usageFrequency);
    setTaskComplexity(scenario.taskComplexity);
    setTools(scenario.tools);
  };

  const handleAddTool = (toolName: ToolName) => {
    const defaults = TOOL_DEFAULTS[toolName];
    setTools([...tools, {
      toolName,
      planName: defaults.plan,
      monthlySpend: defaults.spend,
      seats: 1
    }]);
  };

  const handleRemoveTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleUpdateTool = (index: number, fields: Partial<ToolInput>) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], ...fields };
    setTools(updated);
  };

  // Run calculations
  const payload: AuditPayload = {
    teamSize,
    primaryUseCase,
    usageFrequency,
    taskComplexity,
    tools
  };
  const auditResult: AuditResult = calculateAudit(payload);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Initializing CFO Audit Dashboard...</p>
        </div>
      </div>
    );
  }

  const sortedCatalog = getSortedCatalog();

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "REDUNDANCY":
        return "bg-rose-950/80 border-rose-500/30 text-rose-400";
      case "GHOST_SEATS":
        return "bg-amber-950/80 border-amber-500/30 text-amber-400";
      case "UNDERUTILIZATION":
        return "bg-sky-950/80 border-sky-500/30 text-sky-400";
      case "MODEL_ARBITRAGE":
        return "bg-indigo-950/80 border-indigo-500/30 text-indigo-400";
      case "FREE_TIER":
        return "bg-emerald-950/80 border-emerald-500/30 text-emerald-400";
      case "MESSY_INPUT":
        return "bg-orange-950/80 border-orange-500/30 text-orange-400";
      case "DUPLICATE_MERGE":
        return "bg-purple-950/80 border-purple-500/30 text-purple-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  const getConfidenceStyle = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-emerald-950/80 border-emerald-500/30 text-emerald-400";
      case "medium":
        return "bg-amber-950/80 border-amber-500/30 text-amber-400";
      case "low":
        return "bg-sky-950/80 border-sky-500/30 text-sky-400";
      default:
        return "bg-slate-850 border-slate-700 text-slate-400";
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 65) return "text-rose-400 bg-rose-950/20 border-rose-800/30";
    if (score > 35) return "text-amber-400 bg-amber-950/20 border-amber-800/30";
    return "text-emerald-400 bg-emerald-950/20 border-emerald-800/30";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                ANTIGRAVITY <span className="text-indigo-400 font-medium text-sm px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/40">CFO Spend Audit</span>
              </h1>
              <p className="text-xs text-slate-400">Stop AI subscription bloat & raw model waste</p>
            </div>
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                activeTab === "audit" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Spend Audit
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                activeTab === "matrix" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Utility & Pricing Matrix
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Scenario Loading Controls */}
        <section className="mb-8 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Interactive CFO Test Scenarios</h3>
              <p className="text-sm text-slate-300">Click to instantly populate the audit engine with pre-built test cases:</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                onClick={() => loadScenario(SCENARIO_1)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 text-left transition cursor-pointer"
              >
                <div className="text-indigo-300 font-bold">Test 1: Tech Bro Stack</div>
                <div className="text-slate-400 font-normal">Cursor + Copilot + ChatGPT + Claude</div>
              </button>
              <button
                onClick={() => loadScenario(SCENARIO_2)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 text-left transition cursor-pointer"
              >
                <div className="text-indigo-300 font-bold">Test 2: Lonely Team</div>
                <div className="text-slate-400 font-normal">1 seat ChatGPT Team ($60/mo)</div>
              </button>
              <button
                onClick={() => loadScenario(SCENARIO_3)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 text-left transition cursor-pointer"
              >
                <div className="text-indigo-300 font-bold">Test 3: Low-Usage Team</div>
                <div className="text-slate-400 font-normal">5 casual writers ($100/mo)</div>
              </button>
              <button
                onClick={() => loadScenario(SCENARIO_4)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 text-left transition cursor-pointer"
              >
                <div className="text-indigo-300 font-bold">Test 4: Clean Setup</div>
                <div className="text-slate-400 font-normal">3 Cursor users ($60/mo)</div>
              </button>
            </div>
          </div>
        </section>

        {activeTab === "audit" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side: Interactive form inputs */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card 1: Team profile */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-md font-bold text-white uppercase tracking-wider">1. Corporate Profile</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Team Size (Total Employees)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={teamSize}
                      onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 transition font-medium text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Primary Use Case
                    </label>
                    <select
                      value={primaryUseCase}
                      onChange={(e) => setPrimaryUseCase(e.target.value as PrimaryUseCase)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 transition font-semibold text-sm cursor-pointer"
                    >
                      <option value="coding">Software Engineering (Coding focus)</option>
                      <option value="writing">Content & Copywriting (Text focus)</option>
                      <option value="data">Data Processing (JSON, Sorting, DB)</option>
                      <option value="research">Market Research & Analysis</option>
                      <option value="mixed">General Mixed Use / Multi-Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Usage Frequency & Intensity
                    </label>
                    <select
                      value={usageFrequency}
                      onChange={(e) => setUsageFrequency(e.target.value as UsageFrequency)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 transition font-semibold text-sm cursor-pointer"
                    >
                      <option value="casual">Casual (Few times a week / Underutilized)</option>
                      <option value="active">Active (Daily interactive workflows)</option>
                      <option value="heavy">Heavy (Non-stop power-user sessions)</option>
                      <option value="automated">Automated (Background scripts / Webhooks / API runs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Task Complexity Level
                    </label>
                    <select
                      value={taskComplexity}
                      onChange={(e) => setTaskComplexity(e.target.value as TaskComplexity)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 transition font-semibold text-sm cursor-pointer"
                    >
                      <option value="simple">Simple (Data sorting, grammar fixes, minor checks)</option>
                      <option value="moderate">Moderate (Standard software development, analytical writing)</option>
                      <option value="advanced">Advanced (Deep reasoning, complex logic, architecture)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Subscription editor */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-md font-bold text-white uppercase tracking-wider">2. Configure Monthly AI Spend</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      Add a tool to Audit
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(TOOL_DEFAULTS) as ToolName[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTool(t)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-2xs font-semibold text-slate-300 hover:border-indigo-500 hover:text-white transition cursor-pointer"
                        >
                          + {formatToolName(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5 mt-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reported Active Subscriptions</h4>
                    {tools.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                        No subscriptions added. Select buttons above to add tools.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                        {tools.map((tool, idx) => (
                          <div 
                            key={idx} 
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-2.5 relative group hover:border-slate-700 transition"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveTool(idx)}
                              className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Delete subscription"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-indigo-400 font-extrabold uppercase">
                                {formatToolName(tool.toolName)}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="block text-3xs uppercase font-semibold text-slate-500 mb-1">Plan</label>
                                <input
                                  type="text"
                                  value={tool.planName}
                                  onChange={(e) => handleUpdateTool(idx, { planName: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-200"
                                />
                              </div>
                              <div>
                                <label className="block text-3xs uppercase font-semibold text-slate-500 mb-1">Seats</label>
                                <input
                                  type="number"
                                  value={tool.seats}
                                  onChange={(e) => handleUpdateTool(idx, { seats: parseFloat(e.target.value) })}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-200 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-3xs uppercase font-semibold text-slate-500 mb-1">Spend ($)</label>
                                <input
                                  type="number"
                                  value={tool.monthlySpend}
                                  onChange={(e) => handleUpdateTool(idx, { monthlySpend: parseFloat(e.target.value) })}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-200 font-black"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right side: CFO Report Dashboard */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* EXECUTIVE NUMBERS BAR */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-rose-950/40 shadow-lg shadow-rose-950/5 flex flex-col justify-between">
                  <span className="text-3xs uppercase tracking-wider font-bold text-slate-400">Current Spend</span>
                  <div className="mt-2 text-2xl font-black text-rose-400">
                    ${auditResult.totalCurrentSpend.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-sky-950/40 shadow-lg shadow-sky-950/5 flex flex-col justify-between">
                  <span className="text-3xs uppercase tracking-wider font-bold text-slate-400">Target Spend</span>
                  <div className="mt-2 text-2xl font-black text-sky-400">
                    ${auditResult.totalRecommendedSpend.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-900/30 shadow-lg shadow-emerald-950/5 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition"></div>
                  <span className="text-3xs uppercase tracking-wider font-bold text-emerald-400">Monthly Savings</span>
                  <div className="mt-2 text-2xl font-black text-emerald-400">
                    ${auditResult.totalMonthlySavings.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-900/30 shadow-lg shadow-amber-950/5 flex flex-col justify-between">
                  <span className="text-3xs uppercase tracking-wider font-bold text-amber-400">Annual Savings</span>
                  <div className="mt-2 text-2xl font-black text-amber-400">
                    ${auditResult.totalAnnualSavings.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">/yr</span>
                  </div>
                </div>

              </div>

              {/* ECOSYSTEM OVERLAP RISK RATING & PROGRESS BAR GRAPH */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                <div className="md:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center text-center">
                  <span className="text-3xs uppercase tracking-wider font-bold text-slate-400">Ecosystem Redundancy Rating</span>
                  <div className={`mt-3 h-20 w-20 rounded-full border-4 flex items-center justify-center font-black text-xl transition-all ${getRiskColor(auditResult.workspaceOverlapScore)}`}>
                    {auditResult.workspaceOverlapScore}%
                  </div>
                  <p className="mt-2.5 text-3xs text-slate-500 font-bold uppercase tracking-wider">
                    {auditResult.workspaceOverlapScore > 65 ? "Severe Overlap" : auditResult.workspaceOverlapScore > 35 ? "Moderate Overlap" : "Optimal Workspace"}
                  </p>
                </div>

                <div className="md:col-span-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">CFO Efficiency Target</h3>
                    {auditResult.totalCurrentSpend > 0 && (
                      <span className="text-xs font-semibold text-emerald-400">
                        {((auditResult.totalMonthlySavings / auditResult.totalCurrentSpend) * 100).toFixed(0)}% Budget Reduced
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="h-6 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-1 flex">
                      {auditResult.totalCurrentSpend > 0 ? (
                        <>
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${(auditResult.totalRecommendedSpend / auditResult.totalCurrentSpend) * 100}%` }}
                          ></div>
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(auditResult.totalMonthlySavings / auditResult.totalCurrentSpend) * 100}%` }}
                          ></div>
                        </>
                      ) : (
                        <div className="w-full text-center text-3xs text-slate-500 font-bold self-center uppercase">Add tools to visualize optimized budget</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-2xs text-slate-400 px-1 font-semibold uppercase">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Optimized Spend
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Recouped Savings
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ACTIONABLE AUDIT FINDINGS */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl min-h-[380px]">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h2 className="text-md font-bold text-white uppercase tracking-wider">3. Actionable CFO Recommendations</h2>
                  </div>
                  <span className="text-xs font-bold bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-slate-300">
                    {auditResult.breakdown.filter(item => item.potentialSavings > 0 || (item.findings && item.findings.length > 0)).length} Audited Layers
                  </span>
                </div>

                <div className="space-y-4">
                  {tools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
                      <svg className="h-12 w-12 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h4 className="font-bold text-slate-400">Empty Spend Audit Sheet</h4>
                      <p className="text-xs text-slate-600 max-w-xs mt-1">Please add active subscriptions on the left to activate the auditing logic.</p>
                    </div>
                  ) : (
                    auditResult.breakdown.map((item, idx) => {
                      const isSaving = item.potentialSavings > 0;
                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isSaving 
                              ? "bg-slate-900 border-indigo-900/60 shadow-lg shadow-indigo-950/10 animate-fade-in" 
                              : "bg-slate-950/40 border-slate-900"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/40">
                            <div className="space-y-1">
                              <span className="font-black text-sm tracking-wide text-white bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md uppercase font-bold">
                                {item.toolName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isSaving && (
                                <span className={`text-3xs font-extrabold uppercase px-2.5 py-1 rounded border ${getConfidenceStyle(item.confidence)}`}>
                                  {item.confidence} Confidence
                                </span>
                              )}
                              {isSaving && (
                                <div className="shrink-0 px-3 py-1 rounded-xl bg-indigo-950/50 border border-indigo-900/60 text-indigo-300 text-center">
                                  <div className="text-3xs uppercase font-extrabold tracking-wider">Recouped Saving</div>
                                  <div className="text-md font-black">${item.potentialSavings.toFixed(2)}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* DUAL LAYERED RECOMMENDATIONS (Issue 3 UI Display) */}
                          <div className="mt-3.5 space-y-4">
                            
                            {/* 1. PRIMARY RECOMMENDATION CARD */}
                            {item.primaryFinding ? (
                              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-950 shadow-md flex flex-col gap-2.5">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`text-3xs font-extrabold uppercase px-2.5 py-0.5 rounded border ${getBadgeStyle(item.primaryFinding.type)}`}>
                                    ★ Primary Recommendation: {item.primaryFinding.type.replace("_", " ")}
                                  </span>
                                  {item.primaryFinding.savings > 0 && (
                                    <span className="text-emerald-400 font-black text-xs">
                                      +${item.primaryFinding.savings.toFixed(2)} Recouped
                                    </span>
                                  )}
                                </div>
                                <div className="font-extrabold text-slate-100 text-xs mt-1 leading-snug">{item.primaryFinding.action}</div>
                                <div className="text-slate-400 leading-relaxed text-2xs">{item.primaryFinding.reason}</div>
                                
                                {/* EXPLANATION LAYER: REASONING SIGNALS */}
                                {item.primaryFinding.signals && item.primaryFinding.signals.length > 0 && (
                                  <div className="mt-1 pt-2.5 border-t border-slate-900/60">
                                    <div className="text-3xs uppercase font-extrabold text-slate-500 tracking-wider mb-1.5">Reasoning Signals Detected:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {item.primaryFinding.signals.map((sig, sidx) => (
                                        <span key={sidx} className="text-3xs px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
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
                                Optimal Subscription Layer: Perfectly aligned. No waste detected.
                              </div>
                            )}

                            {/* 2. SECONDARY OBSERVATIONS / OPTIMIZATION VECTORS */}
                            {item.secondaryFindings && item.secondaryFindings.length > 0 && (
                              <div className="space-y-2 mt-2 pt-3 border-t border-slate-800/40">
                                <h4 className="text-3xs uppercase font-extrabold text-indigo-400 tracking-wider mb-2">
                                  Secondary Optimization Observations ({item.secondaryFindings.length}):
                                </h4>
                                {item.secondaryFindings.map((finding, fidx) => (
                                  <div key={fidx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-900/60 flex flex-col gap-1.5 text-2xs">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <span className="text-3xs font-extrabold text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase">
                                        Observed: {finding.type.replace("_", " ")}
                                      </span>
                                      {finding.savings > 0 && (
                                        <span className="text-slate-400 font-semibold">
                                          Est. +${finding.savings.toFixed(2)} savings
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-bold text-slate-300 leading-snug">{finding.action}</div>
                                    <div className="text-slate-400 leading-relaxed">{finding.reason}</div>
                                    {finding.signals && finding.signals.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {finding.signals.map((sig, sidx) => (
                                          <span key={sidx} className="text-3xs text-slate-500 font-medium">
                                            • {sig}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 3. NORMALIZATION MERGES / WARNS */}
                            {item.findings && item.findings.filter(f => f.priority === 1).length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-slate-800/40">
                                {item.findings.filter(f => f.priority === 1).map((finding, fidx) => (
                                  <div key={fidx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900 flex flex-col gap-1 text-2xs">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-3xs font-extrabold uppercase px-2 py-0.5 rounded border ${getBadgeStyle(finding.type)}`}>
                                        {finding.type.replace("_", " ")}
                                      </span>
                                    </div>
                                    <div className="font-bold text-slate-300">{finding.action}</div>
                                    <div className="text-slate-500 leading-relaxed">{finding.reason}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* PRODUCT UTILITY & PRICING MATRIX TAB */
          <div className="space-y-8">
            <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
              <div className="pb-4 border-b border-slate-800 mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">AI Tool Utility & Pricing Matrix</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Benchmarked directly from verified <code className="text-indigo-400">PRICING_DATA.md</code> catalogs, sorted automatically by **Utility** (capability depth) first, followed by **Cost-Effectiveness** (budget efficiency).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCatalog.map((product) => {
                  return (
                    <div 
                      key={product.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-850 hover:border-indigo-900/80 transition flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-md text-white">{product.name}</h3>
                          <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
                            {product.category}
                          </span>
                        </div>

                        {/* RATING METERS */}
                        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-850 text-xs">
                          <div>
                            <div className="text-3xs uppercase font-bold text-slate-500 mb-0.5">Utility Index</div>
                            <div className="font-black text-indigo-400 flex items-center gap-1">
                              ⭐ {product.utility.toFixed(1)} / 5.0
                            </div>
                          </div>
                          <div>
                            <div className="text-3xs uppercase font-bold text-slate-500 mb-0.5">Cost-Effectiveness</div>
                            <div className="font-black text-indigo-400 flex items-center gap-1">
                              💰 {product.costEffectiveness.toFixed(1)} / 5.0
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {product.description}
                        </p>

                        <div className="space-y-2">
                          <div className="text-3xs uppercase font-extrabold tracking-wider text-slate-500">Benchmark Pros & Cons</div>
                          <ul className="text-2xs space-y-1">
                            {product.pros.map((pro, i) => (
                              <li key={i} className="text-indigo-300 flex items-center gap-1">
                                <span className="text-indigo-500">✓</span> {pro}
                              </li>
                            ))}
                            {product.cons.map((con, i) => (
                              <li key={i} className="text-slate-500 flex items-center gap-1">
                                <span className="text-slate-600">✗</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-900">
                        <div className="text-3xs uppercase font-bold text-slate-500 mb-1">Pricing Tiers</div>
                        <div className="text-2xs font-extrabold text-slate-300">
                          {product.pricing}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
