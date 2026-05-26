// src/app/page.tsx
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

  // Lead and report state
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Honeypot spam trap
  
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [reportId, setReportId] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // AI generated summary states
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

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

  // Client-side mouse 3D parallax & magnetic hover tracker
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const layers = document.querySelectorAll('.parallax-layer');
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (e.clientX - centerX);
      const moveY = (e.clientY - centerY);

      layers.forEach((layer) => {
        const htmlLayer = layer as HTMLElement;
        const depth = parseFloat(htmlLayer.dataset.depth || '0.05');
        const x = moveX * depth;
        const y = moveY * depth;
        htmlLayer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      const magneticElements = document.querySelectorAll('.magnetic-glow');
      magneticElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        htmlEl.style.setProperty('--x', `${x}px`);
        htmlEl.style.setProperty('--y', `${y}px`);
      });
    };

    const handleMouseLeave = () => {
      const layers = document.querySelectorAll('.parallax-layer');
      layers.forEach((layer) => {
        const htmlLayer = layer as HTMLElement;
        htmlLayer.style.transform = `translate3d(0, 0, 0)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mounted]);

  const loadScenario = (scenario: AuditPayload) => {
    setTeamSize(scenario.teamSize);
    setPrimaryUseCase(scenario.primaryUseCase);
    setUsageFrequency(scenario.usageFrequency);
    setTaskComplexity(scenario.taskComplexity);
    setTools(scenario.tools);
    // Reset submission states on new test loaded
    setLeadSubmitted(false);
    setReportId("");
    setAiSummary("");
    setSummaryError("");
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

  // Run dynamic on-screen mathematical audit
  const payload: AuditPayload = {
    teamSize,
    primaryUseCase,
    usageFrequency,
    taskComplexity,
    tools
  };
  const auditResult: AuditResult = calculateAudit(payload);

  // Submit Lead & Calculate Permanent Shareable Report + AI Critique
  const handleFinalizeReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email.trim() === "") return;

    setIsSubmittingLead(true);
    setSummaryError("");

    try {
      // Step 1: Save audit anonymously via API route to get permanent reportId
      const auditResponse = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!auditResponse.ok) {
        throw new Error("Baseline calculation registry failed.");
      }

      const auditData = await auditResponse.json();
      const savedReportId = auditData.auditId;
      setReportId(savedReportId);

      // Step 2: Submit B2B lead to route (saves email, triggers Resend transactional confirmation email)
      const leadResponse = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: savedReportId,
          email,
          companyName,
          role,
          teamSize,
          honeypot
        })
      });

      if (!leadResponse.ok) {
        const errorData = await leadResponse.json();
        throw new Error(errorData.error || "Failed to secure lead registry.");
      }

      // Step 3: Trigger the personalized AI CFO critique
      setIsGeneratingSummary(true);
      const summaryResponse = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditResult,
          teamSize,
          primaryUseCase
        })
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setAiSummary(summaryData.summary);
      } else {
        setSummaryError("CFO node experienced a temporary threshold limit. Local template analysis applied.");
      }

      setLeadSubmitted(true);
    } catch (err: any) {
      console.error("Audit finalization failed:", err);
      alert(err.message || "An unexpected error occurred while locking in your report.");
    } finally {
      setIsSubmittingLead(false);
      setIsGeneratingSummary(false);
    }
  };

  const copyToClipboard = () => {
    const link = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#e5e2e1] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00f0ff] border-t-transparent"></div>
          <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Initializing CFO Audit Dashboard...</p>
        </div>
      </div>
    );
  }

  const sortedCatalog = getSortedCatalog();

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "REDUNDANCY": return "bg-rose-950/50 border-rose-500/30 text-rose-400";
      case "GHOST_SEATS": return "bg-amber-950/50 border-amber-500/30 text-amber-400";
      case "UNDERUTILIZATION": return "bg-sky-950/50 border-sky-500/30 text-sky-400";
      case "MODEL_ARBITRAGE": return "bg-indigo-950/50 border-indigo-500/30 text-indigo-400";
      case "FREE_TIER": return "bg-emerald-950/50 border-emerald-500/30 text-emerald-400";
      case "MESSY_INPUT": return "bg-orange-950/50 border-orange-500/30 text-orange-400";
      case "DUPLICATE_MERGE": return "bg-purple-950/50 border-purple-500/30 text-purple-400";
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

  const getRiskColor = (score: number) => {
    if (score > 65) return "text-rose-400 border-rose-500/30 bg-rose-950/10";
    if (score > 35) return "text-[#ffb800] border-[#ffb800]/30 bg-amber-950/10";
    return "text-emerald-400 border-emerald-500/30 bg-emerald-950/10";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] font-sans antialiased pb-16 selection:bg-[#00f0ff] selection:text-black spatial-scene overflow-hidden">
      
      {/* Background radial gradients */}
      <div className="spatial-bg parallax-layer" data-depth="0.02" />

      {/* Top Banner Navigation Header */}
      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur-[40px] sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00f0ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/30 glow-breathe">
              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg font-black tracking-tight text-white flex items-center gap-2">
                SPENDOPTIMA <span className="font-sans text-[#00f0ff] font-medium text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-[#00f0ff]/30">AI Spend Audit</span>
              </h1>
              <p className="text-4xs uppercase tracking-widest text-[#b9cacb] font-semibold">CFO Engine & Pre-negotiated Credits by Credex</p>
            </div>
          </div>

          <div className="flex gap-1.5 p-1 bg-black/60 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "audit" 
                  ? "bg-[#00f0ff] text-black shadow-md" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Spend Audit
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-1.5 rounded-lg text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "matrix" 
                  ? "bg-[#00f0ff] text-black shadow-md" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pricing Matrix
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 entrance-stagger">
        
        {/* INTERACTIVE PRE-BUILT SCENARIOS */}
        <section className="mb-8 p-4 rounded-2xl bg-white/3 border border-white/8 backdrop-blur-[40px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-3xs uppercase tracking-widest text-[#00f0ff] font-extrabold">Fractional CFO Interactive Scenarios</h3>
              <p className="text-2xs text-[#b9cacb] mt-1">Select a pre-populated B2B startup portfolio to test optimized strategies immediately:</p>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
              <button
                onClick={() => loadScenario(SCENARIO_1)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-left border border-white/8 transition cursor-pointer"
              >
                <div className="text-[#00f0ff] font-black text-2xs uppercase">Test 1: Silicon Valley Stack</div>
                <div className="text-[#b9cacb] text-3xs font-semibold mt-1">Cursor + Copilot + ChatGPT + Claude overlap</div>
              </button>
              
              <button
                onClick={() => loadScenario(SCENARIO_2)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-left border border-white/8 transition cursor-pointer"
              >
                <div className="text-[#00f0ff] font-black text-2xs uppercase">Test 2: Lonely Team Plan</div>
                <div className="text-[#b9cacb] text-3xs font-semibold mt-1">1 seat ChatGPT Team ($60/mo phantom fee)</div>
              </button>

              <button
                onClick={() => loadScenario(SCENARIO_3)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-left border border-white/8 transition cursor-pointer"
              >
                <div className="text-[#00f0ff] font-black text-2xs uppercase">Test 3: Underutilized Team</div>
                <div className="text-[#b9cacb] text-3xs font-semibold mt-1">5 casual content writers ($100/mo Claude fees)</div>
              </button>

              <button
                onClick={() => loadScenario(SCENARIO_4)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-left border border-white/8 transition cursor-pointer"
              >
                <div className="text-[#00f0ff] font-black text-2xs uppercase">Test 4: Streamlined Standard</div>
                <div className="text-[#b9cacb] text-3xs font-semibold mt-1">3 standard Cursor seats (already optimal)</div>
              </button>
            </div>
          </div>
        </section>

        {activeTab === "audit" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT INPUT FORM */}
            <div className="lg:col-span-5 space-y-6 parallax-layer" data-depth="0.06">
              
              {/* Profile Config Card */}
              <div className="p-6 rounded-2xl glass-panel relative overflow-hidden magnetic-glow">
                <div className="absolute top-0 right-0 h-24 w-24 bg-[#00f0ff]/5 rounded-full blur-xl"></div>
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-white/8">
                  <div className="h-7 w-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-sm font-black text-white uppercase tracking-wider">1. Startup Profile</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-4xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Total Employees / Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={teamSize}
                      onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full hud-input text-sm font-bold pb-2"
                    />
                  </div>

                  <div>
                    <label className="block text-4xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Core Target Workflows
                    </label>
                    <select
                      value={primaryUseCase}
                      onChange={(e) => setPrimaryUseCase(e.target.value as PrimaryUseCase)}
                      className="w-full hud-input text-xs font-semibold pb-2 cursor-pointer bg-slate-900"
                    >
                      <option value="coding">Software Engineering (Coding focus)</option>
                      <option value="writing">Content & Copywriting (Text focus)</option>
                      <option value="data">Data Processing (JSON, Parsing, Database)</option>
                      <option value="research">Market Research & Deep Analysis</option>
                      <option value="mixed">General Mixed Use (Multi-Department)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-4xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Usage Intensity & Frequency
                    </label>
                    <select
                      value={usageFrequency}
                      onChange={(e) => setUsageFrequency(e.target.value as UsageFrequency)}
                      className="w-full hud-input text-xs font-semibold pb-2 cursor-pointer bg-slate-900"
                    >
                      <option value="casual">Casual (Underutilized flat-rate seats)</option>
                      <option value="active">Active (Daily interactive team workflows)</option>
                      <option value="heavy">Heavy (High frequency power-user sessions)</option>
                      <option value="automated">Automated background API engines (High traffic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-4xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Task Complexity Level
                    </label>
                    <select
                      value={taskComplexity}
                      onChange={(e) => setTaskComplexity(e.target.value as TaskComplexity)}
                      className="w-full hud-input text-xs font-semibold pb-2 cursor-pointer bg-slate-900"
                    >
                      <option value="simple">Simple (Grammar checks, data formatting, minor scripts)</option>
                      <option value="moderate">Moderate (Standard coding, core analytical writing)</option>
                      <option value="advanced">Advanced (Deep contextual reasoning, complex logic)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spend Configuration Card */}
              <div className="p-6 rounded-2xl glass-panel relative magnetic-glow">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-white/8">
                  <div className="h-7 w-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-sm font-black text-white uppercase tracking-wider">2. Configure Subscriptions</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-4xs font-black text-slate-400 uppercase tracking-widest mb-2.5">
                      Add a tool to the Audit Sheet
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(TOOL_DEFAULTS) as ToolName[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTool(t)}
                          className="px-2 py-1.5 rounded-lg border border-white/10 hover:border-[#00f0ff]/40 text-4xs font-extrabold text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          + {formatToolName(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5 mt-5">
                    <h4 className="text-4xs uppercase font-black text-slate-500 tracking-wider">Reported Active Subscriptions</h4>
                    {tools.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs font-semibold">
                        No active tools added. Select products above to populate.
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                        {tools.map((tool, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 rounded-xl bg-white/2 border border-white/8 flex flex-col gap-3.5 relative group hover:border-[#00f0ff]/20 transition"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveTool(idx)}
                              className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition"
                              title="Remove Tool"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-xs text-[#00f0ff] uppercase tracking-wide">
                                {formatToolName(tool.toolName)}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5 text-xs">
                              <div>
                                <label className="block text-4xs uppercase font-black text-slate-500 mb-1">Plan</label>
                                <input
                                  type="text"
                                  value={tool.planName}
                                  onChange={(e) => handleUpdateTool(idx, { planName: e.target.value })}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-2xs focus:outline-none focus:border-[#00f0ff] text-slate-200"
                                />
                              </div>
                              <div>
                                <label className="block text-4xs uppercase font-black text-slate-500 mb-1">Seats</label>
                                <input
                                  type="number"
                                  value={tool.seats}
                                  onChange={(e) => handleUpdateTool(idx, { seats: parseFloat(e.target.value) })}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-2xs focus:outline-none focus:border-[#00f0ff] text-slate-200 font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-4xs uppercase font-black text-slate-500 mb-1">Spend ($)</label>
                                <input
                                  type="number"
                                  value={tool.monthlySpend}
                                  onChange={(e) => handleUpdateTool(idx, { monthlySpend: parseFloat(e.target.value) })}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-2xs focus:outline-none focus:border-[#00f0ff] text-slate-200 font-black"
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

            {/* RIGHT CFO AUDIT REPORT */}
            <div className="lg:col-span-7 space-y-6 parallax-layer" data-depth="0.03">
              
              {/* SAVINGS HERO PANEL */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-4 rounded-xl glass-panel flex flex-col justify-between magnetic-glow">
                  <span className="text-4xs uppercase tracking-widest font-black text-slate-400">Current Spend</span>
                  <div className="mt-2.5 text-xl font-black text-rose-400 text-kinetic">
                    ${auditResult.totalCurrentSpend.toFixed(2)}
                    <span className="text-3xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>
 
                <div className="p-4 rounded-xl glass-panel flex flex-col justify-between magnetic-glow">
                  <span className="text-4xs uppercase tracking-widest font-black text-slate-400">Target Spend</span>
                  <div className="mt-2.5 text-xl font-black text-sky-400 text-kinetic">
                    ${auditResult.totalRecommendedSpend.toFixed(2)}
                    <span className="text-3xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>
 
                <div className="p-4 rounded-xl glass-panel flex flex-col justify-between relative overflow-hidden group magnetic-glow">
                  <div className="absolute top-0 right-0 h-12 w-12 bg-emerald-500/5 rounded-full blur-xl"></div>
                  <span className="text-4xs uppercase tracking-widest font-black text-emerald-400">Monthly Savings</span>
                  <div className="mt-2.5 text-xl font-black text-emerald-400 text-kinetic">
                    ${auditResult.totalMonthlySavings.toFixed(2)}
                    <span className="text-3xs font-normal text-slate-500">/mo</span>
                  </div>
                </div>
 
                <div className="p-4 rounded-xl glass-panel flex flex-col justify-between magnetic-glow">
                  <span className="text-4xs uppercase tracking-widest font-black text-amber-400">Annual Savings</span>
                  <div className="mt-2.5 text-xl font-black text-[#ffb800] text-kinetic">
                    ${auditResult.totalAnnualSavings.toFixed(2)}
                    <span className="text-3xs font-normal text-slate-500">/yr</span>
                  </div>
                </div>
 
              </div>
 
              {/* OVERLAP RISK AND RATING METER */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                <div className="md:col-span-4 p-5 rounded-2xl glass-panel text-center flex flex-col items-center justify-center magnetic-glow">
                  <span className="text-4xs uppercase tracking-widest font-black text-slate-400">Ecosystem Redundancy</span>
                  <div className={`mt-3 h-16 w-16 rounded-full border-4 flex items-center justify-center font-display font-black text-lg transition-all hologram-ring glow-breathe ${getRiskColor(auditResult.workspaceOverlapScore)}`}>
                    {auditResult.workspaceOverlapScore}%
                  </div>
                  <p className="mt-2 text-4xs font-black uppercase tracking-wider text-slate-500">
                    {auditResult.workspaceOverlapScore > 65 ? "Severe Overlap" : auditResult.workspaceOverlapScore > 35 ? "Moderate Overlap" : "Optimal Alignment"}
                  </p>
                </div>

                <div className="md:col-span-8 p-5 rounded-2xl glass-panel flex flex-col justify-between magnetic-glow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-3xs font-black text-slate-400 uppercase tracking-widest">CFO Efficiency Reduction</h3>
                    {auditResult.totalCurrentSpend > 0 && (
                      <span className="text-xs font-bold text-[#00f0ff]">
                        {((auditResult.totalMonthlySavings / auditResult.totalCurrentSpend) * 100).toFixed(0)}% Budget Downgraded
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="h-5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-1 flex">
                      {auditResult.totalCurrentSpend > 0 ? (
                        <>
                          <div 
                            className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                            style={{ width: `${(auditResult.totalRecommendedSpend / auditResult.totalCurrentSpend) * 100}%` }}
                          ></div>
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(auditResult.totalMonthlySavings / auditResult.totalCurrentSpend) * 100}%` }}
                          ></div>
                        </>
                      ) : (
                        <div className="w-full text-center text-4xs text-slate-500 font-bold self-center uppercase tracking-widest">Add subscriptions to map targets</div>
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
                </div>

              </div>

              {/* DYNAMIC CONVERSION FUNNEL: EMAIL LEAD CAPTURE & AI PERSISTENT REPORT */}
              <div className="p-6 rounded-2xl glass-panel relative overflow-hidden magnetic-glow">
                <div className="absolute top-0 right-0 h-32 w-32 bg-[#00f0ff]/5 rounded-full blur-2xl"></div>
                
                {!leadSubmitted ? (
                  /* STEP 1: LEAD CAPTURE EMAIL GATE */
                  <form onSubmit={handleFinalizeReport} className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-white/8">
                      <span className="text-lg">📬</span>
                      <div>
                        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Finalize CFO Report & Unlock AI Review</h3>
                        <p className="text-3xs text-[#b9cacb] font-medium">Verify your email to secure a dynamic public URL, send your report, and trigger an automated AI analysis.</p>
                      </div>
                    </div>

                    {/* Honeypot hidden input for spam protection */}
                    <input 
                      type="text" 
                      name="website" 
                      value={honeypot} 
                      onChange={(e) => setHoneypot(e.target.value)} 
                      className="hidden" 
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Business Email (Required)</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="founder@yourstartup.com" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-2xs focus:outline-none focus:border-[#00f0ff] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company Name</label>
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Stripe" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-2xs focus:outline-none focus:border-[#00f0ff] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Role</label>
                        <input 
                          type="text" 
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="CTO / Engineering VP" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-2xs focus:outline-none focus:border-[#00f0ff] text-slate-200"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={isSubmittingLead}
                          className="w-full hologram-btn text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isSubmittingLead ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
                              Finalizing Report...
                            </>
                          ) : (
                            "Generate Report & AI Summary"
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* STEP 2: DISPLAY AI SUMMARY + VIRAL SHARE URL + CREDEX CONVERSIONS */
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* 1. SHAREABLE URL CARD */}
                    <div className="p-4 rounded-xl bg-black/40 border border-[#00f0ff]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-4xs font-black text-[#00f0ff] uppercase tracking-widest bg-cyan-950/30 border border-[#00f0ff]/20 px-2 py-0.5 rounded">VIRAL SHARE LINK</span>
                        <h4 className="text-2xs font-extrabold text-slate-200 mt-1">Anonymized report generated successfully!</h4>
                        <p className="text-3xs text-slate-500">Email and company details are stripped from the public URL.</p>
                      </div>
                      
                      <button
                        onClick={copyToClipboard}
                        className="shrink-0 hologram-btn text-3xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {copiedLink ? "Link Copied!" : "Copy Report Link"}
                      </button>
                    </div>

                    {/* 2. AI SUMMARY CRITIQUE */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 relative">
                      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/8">
                        <span className="text-xs">🤖</span>
                        <span className="font-display font-black text-xs text-white uppercase tracking-wide">Personalized CFO Critique</span>
                      </div>
                      
                      {isGeneratingSummary ? (
                        <div className="space-y-2 py-3">
                          <div className="h-3 w-full bg-slate-900 animate-pulse rounded"></div>
                          <div className="h-3 w-5/6 bg-slate-900 animate-pulse rounded"></div>
                          <div className="h-3 w-4/5 bg-slate-900 animate-pulse rounded"></div>
                        </div>
                      ) : summaryError ? (
                        <p className="text-xs text-rose-400 font-medium italic">{summaryError}</p>
                      ) : (
                        <p className="text-2xs text-[#e5e2e1] leading-relaxed font-medium">
                          {aiSummary}
                        </p>
                      )}
                    </div>

                    {/* 3. CONDITIONAL VALUE-BASED CREDEX BANNER */}
                    {auditResult.totalMonthlySavings >= 500 ? (
                      <div className="p-4 rounded-xl bg-cyan-950/20 border border-[#00f0ff]/30 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-3xs uppercase font-extrabold text-[#00f0ff] tracking-wider bg-cyan-900/40 border border-[#00f0ff]/30 px-2 py-0.5 rounded">High Savings Consult</span>
                          <h4 className="text-2xs font-extrabold text-white">Save ${auditResult.totalMonthlySavings.toFixed(0)}/mo with pre-negotiated credit contracts.</h4>
                          <p className="text-3xs text-slate-400">Credex sources discounted Cursor, Claude, and ChatGPT Enterprise credits seamlessly.</p>
                        </div>
                        <a 
                          href="https://calendly.com/credex-audit" 
                          target="_blank" 
                          rel="noreferrer"
                          className="shrink-0 hologram-btn text-3xs py-2.5 px-4 rounded-lg cursor-pointer text-center"
                        >
                          Schedule Free Consult
                        </a>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-950/15 border border-emerald-900/30 text-2xs text-emerald-400 text-center font-bold">
                        🛡️ Your SaaS architecture is highly efficient! We will notify you automatically when new discount pools apply to your stack.
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* ACTIONABLE AUDIT FINDINGS TABLE */}
              <div className="p-6 rounded-2xl glass-panel min-h-[380px] magnetic-glow">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/8">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h2 className="font-display text-sm font-black text-white uppercase tracking-wider">3. Actionable CFO Recommendations</h2>
                  </div>
                  <span className="text-3xs font-extrabold bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300 uppercase tracking-widest">
                    {auditResult.breakdown.filter(item => item.potentialSavings > 0 || (item.findings && item.findings.length > 0)).length} Layers Audited
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

                          {/* DUAL LAYERED RECOMMENDATIONS */}
                          <div className="mt-3.5 space-y-4">
                            
                            {/* 1. PRIMARY RECOMMENDATION */}
                            {item.primaryFinding ? (
                              <div className="p-3.5 rounded-xl bg-black/40 border border-[#00f0ff]/20 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className={`text-4xs font-black uppercase px-2 py-0.5 rounded border ${getBadgeStyle(item.primaryFinding.type)}`}>
                                    ★ Recommendation: {item.primaryFinding.type.replace("_", " ")}
                                  </span>
                                  {item.primaryFinding.savings > 0 && (
                                    <span className="text-emerald-400 font-black text-2xs">
                                      +${item.primaryFinding.savings.toFixed(2)} Recouped
                                    </span>
                                  )}
                                </div>
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

                            {/* 2. SECONDARY OBSERVATIONS */}
                            {item.secondaryFindings && item.secondaryFindings.length > 0 && (
                              <div className="space-y-2 mt-2 pt-3 border-t border-white/5">
                                <h4 className="text-4xs uppercase font-black text-[#00f0ff] tracking-wider mb-2">
                                  Secondary Optimization Observations ({item.secondaryFindings.length}):
                                </h4>
                                {item.secondaryFindings.map((finding, fidx) => (
                                  <div key={fidx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1.5 text-2xs">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <span className="text-4xs font-black text-slate-400 bg-black border border-white/10 px-2 py-0.5 rounded uppercase">
                                        Observed: {finding.type.replace("_", " ")}
                                      </span>
                                      {finding.savings > 0 && (
                                        <span className="text-slate-400 font-bold">
                                          Est. +${finding.savings.toFixed(2)} savings
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-extrabold text-slate-300 leading-snug">{finding.action}</div>
                                    <div className="text-slate-400 leading-relaxed">{finding.reason}</div>
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
          /* BENCHMARK MATRIX TAB */
          <div className="space-y-8 animate-fade-in">
            <section className="p-6 rounded-2xl glass-panel">
              <div className="pb-4 border-b border-white/10 mb-6">
                <h2 className="font-display text-lg font-black text-white uppercase tracking-wider">AI Tool Utility & Pricing Matrix</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Benchmarked directly from verified <code className="text-[#00f0ff]">PRICING_DATA.md</code> catalogs, sorted automatically by **Utility** (capability depth) first, followed by **Cost-Effectiveness** (budget efficiency).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCatalog.map((product) => (
                  <div 
                    key={product.id}
                    className="p-5 rounded-xl bg-black/40 border border-white/10 hover:border-[#00f0ff]/30 transition flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-black text-sm text-white">{product.name}</h3>
                        <span className="text-4xs font-black uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          {product.category}
                        </span>
                      </div>

                      {/* RATING METERS */}
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/60 border border-white/10 text-xs">
                        <div>
                          <div className="text-4xs uppercase font-bold text-slate-500 mb-0.5">Utility Index</div>
                          <div className="font-black text-[#00f0ff] flex items-center gap-1">
                            ⭐ {product.utility.toFixed(1)} / 5.0
                          </div>
                        </div>
                        <div>
                          <div className="text-4xs uppercase font-bold text-slate-500 mb-0.5">Cost-Effectiveness</div>
                          <div className="font-black text-[#00f0ff] flex items-center gap-1">
                            💰 {product.costEffectiveness.toFixed(1)} / 5.0
                          </div>
                        </div>
                      </div>

                      <p className="text-2xs text-[#b9cacb] leading-relaxed font-medium">
                        {product.description}
                      </p>

                      <div className="space-y-2">
                        <div className="text-4xs uppercase font-black tracking-wider text-slate-500">Benchmark Pros & Cons</div>
                        <ul className="text-3xs space-y-1.5 font-medium">
                          {product.pros.map((pro, i) => (
                            <li key={i} className="text-cyan-300 flex items-center gap-1.5">
                              <span className="text-[#00f0ff] text-xs">✓</span> {pro}
                            </li>
                          ))}
                          {product.cons.map((con, i) => (
                            <li key={i} className="text-slate-500 flex items-center gap-1.5">
                              <span className="text-slate-600 text-xs">✗</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/5">
                      <div className="text-4xs uppercase font-bold text-slate-500 mb-1">Pricing Tiers</div>
                      <div className="text-2xs font-extrabold text-slate-300">
                        {product.pricing}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
