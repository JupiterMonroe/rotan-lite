import { SessionTrustState, InterventionEvent, GateAction } from '@/lib/types';
import { TRUST_CONFIG } from '@/lib/constants';

export function createSession(sessionId: string): SessionTrustState {
  return {
    sessionId,
    totalInteractions: 0,
    interventionCount: 0,
    currentTrustLevel: TRUST_CONFIG.INITIAL_TRUST,
    trustDecayRate: TRUST_CONFIG.DECAY_PER_INTERVENTION,
    trustRecoveryRate: TRUST_CONFIG.RECOVERY_PER_CLEAN,
    interventionHistory: [],
  };
}

export function updateTrustState(state: SessionTrustState, event: InterventionEvent): SessionTrustState {
  let trustDelta = 0;
  
  // Calculate trust change based on gate action
  switch (event.gateDecision.action) {
    case 'PASS':
      trustDelta = TRUST_CONFIG.RECOVERY_PER_CLEAN; // +0.05
      break;
    case 'HEDGE':
      trustDelta = -0.075;
      break;
    case 'CLARIFY':
      trustDelta = -TRUST_CONFIG.DECAY_PER_INTERVENTION; // -0.15
      break;
    case 'BLOCK':
      trustDelta = -0.225;
      break;
  }
  
  // Update trust level with clamping
  const newTrustLevel = Math.max(
    TRUST_CONFIG.MIN_TRUST,
    Math.min(TRUST_CONFIG.MAX_TRUST, state.currentTrustLevel + trustDelta)
  );
  
  // Increment counters
  const isIntervention = event.gateDecision.action !== 'PASS';
  
  return {
    ...state,
    totalInteractions: state.totalInteractions + 1,
    interventionCount: state.interventionCount + (isIntervention ? 1 : 0),
    currentTrustLevel: newTrustLevel,
    interventionHistory: [...state.interventionHistory, event],
  };
}

export function getTrustSummary(state: SessionTrustState): { 
  level: number; 
  trend: string; 
  interventionRate: number;
} {
  const level = state.currentTrustLevel;
  
  // Calculate trend from recent history (last 5 interactions)
  const recentHistory = state.interventionHistory.slice(-5);
  let trend = 'stable';
  
  if (recentHistory.length >= 3) {
    const recentTrustChanges = recentHistory.map(event => {
      switch (event.gateDecision.action) {
        case 'PASS': return TRUST_CONFIG.RECOVERY_PER_CLEAN;
        case 'HEDGE': return -0.075;
        case 'CLARIFY': return -TRUST_CONFIG.DECAY_PER_INTERVENTION;
        case 'BLOCK': return -0.225;
        default: return 0;
      }
    });
    
    const avgChange = recentTrustChanges.reduce((sum, val) => sum + val, 0) / recentTrustChanges.length;
    
    if (avgChange > 0.02) {
      trend = 'improving';
    } else if (avgChange < -0.02) {
      trend = 'declining';
    }
  }
  
  // Calculate intervention rate
  const interventionRate = state.totalInteractions > 0 
    ? state.interventionCount / state.totalInteractions 
    : 0;
  
  return {
    level,
    trend,
    interventionRate,
  };
}

// Made with Bob
