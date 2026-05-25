// src/types/audit.ts

export type PrimaryUseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed' | string;

export type UsageFrequency = 'casual' | 'active' | 'heavy' | 'automated' | string;

export type TaskComplexity = 'simple' | 'moderate' | 'advanced' | string;

export type ToolName = 
  | 'cursor' 
  | 'copilot' 
  | 'claude' 
  | 'chatgpt' 
  | 'windsurf' 
  | 'v0' 
  | 'openai_api' 
  | 'anthropic_api' 
  | 'gemini_api'
  | string;

export type ConfidenceScore = 'high' | 'medium' | 'low';

export interface ToolInput {
  toolName: ToolName;
  planName: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditPayload {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  usageFrequency: UsageFrequency;
  taskComplexity: TaskComplexity;
  tools: ToolInput[];
}

export interface AuditFinding {
  action: string;
  savings: number;
  reason: string;
  type: 'REDUNDANCY' | 'GHOST_SEATS' | 'UNDERUTILIZATION' | 'MODEL_ARBITRAGE' | 'MESSY_INPUT' | 'FREE_TIER' | 'DUPLICATE_MERGE';
  confidence: ConfidenceScore;
  signals: string[]; // Reasoning Chain
  priority: number;  // For conflict arbitration
}

export interface ToolRecommendation {
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  potentialSavings: number;
  reason: string;
  confidence: ConfidenceScore;
  findings?: AuditFinding[];
  primaryFinding?: AuditFinding;
  secondaryFindings?: AuditFinding[];
}

export interface AuditResult {
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  workspaceOverlapScore: number; // 0 to 100 ecosystem risk rating
  breakdown: ToolRecommendation[];
}