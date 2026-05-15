export type CheckType = "EXISTENCE" | "VERSION_VALIDITY" | "SELF_CONSISTENCY" | "GROUNDEDNESS" | "SECURITY";
export type Freshness = "LIVE" | "CACHED" | "STALE" | "UNAVAILABLE";
export type RiskCategory = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type GateAction = "PASS" | "HEDGE" | "CLARIFY" | "BLOCK";

export interface VerificationRequest {
  prompt: string;
  rawResponse: string;
  timestamp: Date;
  sessionId: string;
}

export interface VerificationCheck {
  checkType: CheckType;
  passed: boolean;
  confidence: number;
  evidence: string;
  source: string;
  freshness: Freshness;
  details: string;
}

export interface RiskAssessment {
  overallScore: number;
  confidenceLevel: number;
  evidenceAlignment: number;
  mismatchScore: number;
  riskCategory: RiskCategory;
  checks: VerificationCheck[];
}

export interface GateDecision {
  action: GateAction;
  reason: string;
  originalResponse: string;
  modifiedResponse: string | null;
  suggestedCorrection: string | null;
}

export interface InterventionEvent {
  id: string;
  timestamp: Date;
  prompt: string;
  gateDecision: GateDecision;
  riskAssessment: RiskAssessment;
  responseTimeMs: number;
}

export interface SessionTrustState {
  sessionId: string;
  totalInteractions: number;
  interventionCount: number;
  currentTrustLevel: number;
  trustDecayRate: number;
  trustRecoveryRate: number;
  interventionHistory: InterventionEvent[];
}

// Made with Bob
