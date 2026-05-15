import { VerificationCheck, RiskAssessment, RiskCategory } from '@/lib/types';
import { GATE_THRESHOLDS } from '@/lib/constants';

export function analyzeConfidenceLanguage(response: string): number {
  const lowercaseResponse = response.toLowerCase();
  
  // High confidence markers
  const highConfidenceWords = [
    'is', 'does', 'will', 'simply', 'just', 'run', 'install', 'use',
    'does not exist', 'there is no', 'definitely', 'certainly', 'always',
    'never', 'must', 'should', 'can', 'works', 'enables', 'provides'
  ];
  
  // Low confidence markers
  const lowConfidenceWords = [
    'might', 'could', 'possibly', 'i think', 'i believe', 'not sure',
    'may not', 'perhaps', 'maybe', 'probably', 'seems', 'appears',
    'likely', 'unlikely', 'uncertain'
  ];
  
  let highCount = 0;
  let lowCount = 0;
  
  highConfidenceWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseResponse.match(regex);
    if (matches) highCount += matches.length;
  });
  
  lowConfidenceWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseResponse.match(regex);
    if (matches) lowCount += matches.length;
  });
  
  // Calculate ratio
  const totalMarkers = highCount + lowCount;
  if (totalMarkers === 0) return 0.5; // Neutral if no markers
  
  const ratio = highCount / totalMarkers;
  return Math.max(0, Math.min(1, ratio)); // Clamp between 0 and 1
}

export function calculateMismatchScore(confidenceLevel: number, evidenceAlignment: number): number {
  // Mismatch occurs when confidence is high but evidence is low
  const mismatch = Math.max(0, confidenceLevel - evidenceAlignment);
  return mismatch;
}

export function calculateOverallRisk(checks: VerificationCheck[], confidenceLevel: number): RiskAssessment {
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.passed).length;
  const failedChecks = totalChecks - passedChecks;
  
  // Evidence alignment: ratio of passed checks
  const evidenceAlignment = totalChecks > 0 ? passedChecks / totalChecks : 1.0;
  
  // Calculate mismatch score
  const mismatchScore = calculateMismatchScore(confidenceLevel, evidenceAlignment);
  
  // Overall risk score: weighted combination
  const failedCheckRatio = totalChecks > 0 ? failedChecks / totalChecks : 0;
  const overallScore = Math.min(100, (failedCheckRatio * 60) + (mismatchScore * 40));
  
  // Determine risk category based on thresholds
  let riskCategory: RiskCategory;
  if (overallScore <= GATE_THRESHOLDS.PASS) {
    riskCategory = 'LOW';
  } else if (overallScore <= GATE_THRESHOLDS.HEDGE) {
    riskCategory = 'MEDIUM';
  } else if (overallScore <= GATE_THRESHOLDS.CLARIFY) {
    riskCategory = 'HIGH';
  } else {
    riskCategory = 'CRITICAL';
  }
  
  return {
    overallScore,
    confidenceLevel,
    evidenceAlignment,
    mismatchScore,
    riskCategory,
    checks,
  };
}

// Made with Bob
