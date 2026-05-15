import { create } from 'zustand';
import axios from 'axios';
import { InterventionEvent, SessionTrustState } from '@/lib/types';
import { DEMO_SCENARIOS } from '@/lib/constants';

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface RotanState {
  sessionId: string;
  trustState: SessionTrustState | null;
  currentPrompt: string;
  rawResponse: string;
  isVerifying: boolean;
  currentIntervention: InterventionEvent | null;
  interventionLog: InterventionEvent[];
  totalChecks: number;
  totalInterventions: number;
  totalBlocks: number;
  averageRiskScore: number;
  isDemoMode: boolean;
  activeDemoScenario: string | null;
  
  setPrompt: (prompt: string) => void;
  setRawResponse: (response: string) => void;
  runVerification: () => Promise<void>;
  clearCurrent: () => void;
  resetSession: () => void;
  toggleDemoMode: () => void;
  loadDemoScenario: (scenarioId: string) => void;
  runDemoSequence: () => Promise<void>;
}

export const useRotanStore = create<RotanState>((set, get) => ({
  sessionId: generateSessionId(),
  trustState: null,
  currentPrompt: '',
  rawResponse: '',
  isVerifying: false,
  currentIntervention: null,
  interventionLog: [],
  totalChecks: 0,
  totalInterventions: 0,
  totalBlocks: 0,
  averageRiskScore: 0,
  isDemoMode: false,
  activeDemoScenario: null,

  setPrompt: (prompt: string) => set({ currentPrompt: prompt }),

  setRawResponse: (response: string) => set({ rawResponse: response }),

  runVerification: async () => {
    const state = get();
    set({ isVerifying: true });

    try {
      const response = await axios.post('/api/verify', {
        prompt: state.currentPrompt,
        rawResponse: state.rawResponse,
        sessionId: state.sessionId,
      });

      const data = response.data;
      
      // Validate response structure
      if (!data.success || !data.intervention) {
        throw new Error('Invalid response from verification API');
      }

      const intervention: InterventionEvent = data.intervention;
      
      // Validate intervention has required fields
      if (!intervention.gateDecision || !intervention.riskAssessment) {
        throw new Error('Incomplete intervention data');
      }

      const newLog = [...state.interventionLog, intervention];
      const newTotalChecks = state.totalChecks + 1;
      const newTotalInterventions = intervention.gateDecision?.action !== 'PASS'
        ? state.totalInterventions + 1
        : state.totalInterventions;
      const newTotalBlocks = intervention.gateDecision?.action === 'BLOCK'
        ? state.totalBlocks + 1
        : state.totalBlocks;

      const totalRisk = newLog.reduce((sum, event) => sum + (event.riskAssessment?.overallScore || 0), 0);
      const newAverageRiskScore = newLog.length > 0 ? totalRisk / newLog.length : 0;

      set({
        currentIntervention: intervention,
        interventionLog: newLog,
        totalChecks: newTotalChecks,
        totalInterventions: newTotalInterventions,
        totalBlocks: newTotalBlocks,
        averageRiskScore: newAverageRiskScore,
        trustState: data.trustState || state.trustState,
        isVerifying: false,
      });
    } catch (error) {
      console.error('Verification failed:', error);
      set({ isVerifying: false });
      // Optionally show error to user
      alert('Verification failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  clearCurrent: () => set({
    currentPrompt: '',
    rawResponse: '',
    currentIntervention: null,
    activeDemoScenario: null,
  }),

  resetSession: () => set({
    sessionId: generateSessionId(),
    trustState: null,
    currentPrompt: '',
    rawResponse: '',
    isVerifying: false,
    currentIntervention: null,
    interventionLog: [],
    totalChecks: 0,
    totalInterventions: 0,
    totalBlocks: 0,
    averageRiskScore: 0,
    isDemoMode: false,
    activeDemoScenario: null,
  }),

  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

  loadDemoScenario: (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      set({
        currentPrompt: scenario.prompt,
        rawResponse: scenario.simulatedRawResponse,
        activeDemoScenario: scenarioId,
      });
    }
  },

  runDemoSequence: async () => {
    const state = get();
    set({ isDemoMode: true });

    for (const scenario of DEMO_SCENARIOS) {
      get().loadDemoScenario(scenario.id);
      await get().runVerification();
      
      // Wait 3 seconds before next scenario
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  },
}));

// Made with Bob
