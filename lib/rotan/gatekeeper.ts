import { RiskAssessment, GateDecision, SessionTrustState, VerificationCheck, GateAction } from '@/lib/types';
import { GATE_THRESHOLDS } from '@/lib/constants';

export function makeGateDecision(risk: RiskAssessment, trustState: SessionTrustState): GateDecision {
  // Adjust risk based on trust level (lower trust = higher perceived risk)
  const adjustedRisk = Math.min(100, risk.overallScore * (1 / trustState.currentTrustLevel));
  
  let action: GateAction;
  let reason: string;
  let modifiedResponse: string | null = null;
  let suggestedCorrection: string | null = null;
  
  if (adjustedRisk <= GATE_THRESHOLDS.PASS) {
    // PASS: All checks passed
    action = 'PASS';
    reason = 'All checks passed. Response verified against live sources.';
    modifiedResponse = null;
    suggestedCorrection = null;
  } else if (adjustedRisk <= GATE_THRESHOLDS.HEDGE) {
    // HEDGE: Minor concerns, prepend warning
    action = 'HEDGE';
    reason = `Minor verification concerns detected (risk: ${adjustedRisk.toFixed(1)}). Proceeding with caution.`;
    
    const failedChecks = risk.checks.filter(c => !c.passed);
    const warningText = `⚠️ ROTAN Notice: This response contains unverified claims. ${failedChecks.length} check(s) failed. Please verify independently.\n\n`;
    modifiedResponse = warningText + risk.checks[0]?.details || '';
    suggestedCorrection = null;
  } else if (adjustedRisk <= GATE_THRESHOLDS.CLARIFY) {
    // CLARIFY: Significant issues, provide detailed explanation
    action = 'CLARIFY';
    reason = `Significant verification failures detected (risk: ${adjustedRisk.toFixed(1)}). Clarification required.`;
    
    const failedChecks = risk.checks.filter(c => !c.passed);
    const clarificationText = `🔍 ROTAN Clarification Required:\n\n` +
      `The following claims could not be verified:\n\n` +
      failedChecks.map((check, i) => 
        `${i + 1}. ${check.checkType}: ${check.evidence}\n   Source: ${check.source} (${check.freshness})`
      ).join('\n\n') +
      `\n\nPlease verify these claims independently before proceeding.`;
    
    modifiedResponse = clarificationText;
    suggestedCorrection = generateCorrectedResponse('', risk.checks);
  } else {
    // BLOCK: Critical issues, full block with correction
    action = 'BLOCK';
    reason = `Critical verification failures detected (risk: ${adjustedRisk.toFixed(1)}). Response blocked for safety.`;
    
    const failedChecks = risk.checks.filter(c => !c.passed);
    const blockText = `🛑 ROTAN BLOCKED THIS RESPONSE\n\n` +
      `Critical issues detected:\n\n` +
      failedChecks.map((check, i) => 
        `${i + 1}. ${check.checkType}: ${check.evidence}\n   Source: ${check.source}`
      ).join('\n\n');
    
    modifiedResponse = blockText;
    suggestedCorrection = generateCorrectedResponse('', risk.checks);
  }
  
  return {
    action,
    reason,
    originalResponse: '',
    modifiedResponse,
    suggestedCorrection,
  };
}

export function generateCorrectedResponse(original: string, checks: VerificationCheck[]): string {
  const failedChecks = checks.filter(c => !c.passed);
  
  if (failedChecks.length === 0) {
    return 'No corrections needed. All checks passed.';
  }
  
  const corrections = failedChecks.map(check => {
    let correction = `ROTAN Correction:\n`;
    
    if (check.checkType === 'EXISTENCE') {
      if (check.evidence.includes('does not exist')) {
        correction += `❌ Claimed resource does not exist\n`;
        correction += `✓ Evidence: ${check.evidence}\n`;
        correction += `📍 Source: ${check.source}`;
      }
    } else if (check.checkType === 'VERSION_VALIDITY') {
      correction += `❌ Version claim is incorrect\n`;
      correction += `✓ ${check.evidence}\n`;
      correction += `📍 Source: ${check.source}`;
    } else if (check.checkType === 'SELF_CONSISTENCY') {
      correction += `⚠️ ${check.evidence}\n`;
      correction += `📍 ${check.details}`;
    } else {
      correction += `❌ ${check.checkType} check failed\n`;
      correction += `✓ ${check.evidence}\n`;
      correction += `📍 Source: ${check.source}`;
    }
    
    return correction;
  });
  
  return corrections.join('\n\n---\n\n');
}

// Made with Bob
