// src/types/audit.ts

export type PrimaryUseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export interface ToolInput {
  toolName: 'cursor' | 'copilot' | 'claude' | 'chatgpt';
  planName: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditPayload {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  tools: ToolInput[];
}

export interface ToolRecommendation {
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  potentialSavings: number;
  reason: string;
}

export interface AuditResult {
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  breakdown: ToolRecommendation[];
}