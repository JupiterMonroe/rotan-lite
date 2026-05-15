"use client";

import { useState } from 'react';
import { useRotanStore } from '@/store/useRotanStore';
import { DEMO_SCENARIOS } from '@/lib/constants';

export default function DemoPromptRunner() {
  const { loadDemoScenario, runVerification, isVerifying } = useRotanStore();
  const [runningAll, setRunningAll] = useState(false);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number | null>(null);

  const handleRunScenario = async (scenarioId: string) => {
    loadDemoScenario(scenarioId);
    setTimeout(async () => {
      await runVerification();
    }, 100);
  };

  const handleRunAllDemos = async () => {
    setRunningAll(true);
    
    for (let i = 0; i < DEMO_SCENARIOS.length; i++) {
      setCurrentScenarioIndex(i);
      const scenario = DEMO_SCENARIOS[i];
      
      loadDemoScenario(scenario.id);
      await new Promise(resolve => setTimeout(resolve, 100));
      await runVerification();
      
      // Wait 3 seconds before next scenario
      if (i < DEMO_SCENARIOS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    setRunningAll(false);
    setCurrentScenarioIndex(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'STALE_KNOWLEDGE': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'HALLUCINATED_API': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PHANTOM_DEPENDENCY': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'VERSION_DRIFT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'UNSAFE_PATTERN': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Run All button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#E5E7EB]">Demo Scenarios</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Pre-configured test cases demonstrating ROTAN's verification capabilities
          </p>
        </div>
        <button
          onClick={handleRunAllDemos}
          disabled={runningAll || isVerifying}
          className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#2A2D37] disabled:text-[#6B7280] text-white font-semibold py-3 px-6 rounded transition-colors flex items-center gap-2"
        >
          {runningAll ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running All...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run All Demos
            </>
          )}
        </button>
      </div>

      {/* Progress indicator */}
      {runningAll && currentScenarioIndex !== null && (
        <div className="bg-[#3B82F6]/10 border border-[#3B82F6] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#E5E7EB] font-semibold">
              Running Scenario {currentScenarioIndex + 1} of {DEMO_SCENARIOS.length}
            </span>
          </div>
          <div className="mt-3 h-2 bg-[#0F1117] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3B82F6] transition-all duration-300"
              style={{ width: `${((currentScenarioIndex + 1) / DEMO_SCENARIOS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Scenario cards */}
      <div className="grid gap-4">
        {DEMO_SCENARIOS.map((scenario, index) => (
          <div 
            key={scenario.id}
            className={`bg-[#1A1D27] border rounded-lg p-6 transition-all ${
              runningAll && currentScenarioIndex === index 
                ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/50' 
                : 'border-[#2A2D37]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#E5E7EB]">
                    {scenario.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(scenario.category)}`}>
                    {scenario.category.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-semibold ${getSeverityColor(scenario.severity)}`}>
                    {scenario.severity}
                  </span>
                </div>
                <p className="text-sm text-[#9CA3AF] mb-3">
                  {scenario.expectedFailure}
                </p>
              </div>
              <button
                onClick={() => handleRunScenario(scenario.id)}
                disabled={isVerifying || runningAll}
                className="bg-[#2A2D37] hover:bg-[#3A3D47] disabled:opacity-50 text-[#E5E7EB] px-4 py-2 rounded transition-colors flex items-center gap-2 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run
              </button>
            </div>

            {/* Prompt preview */}
            <div className="bg-[#0F1117] border border-[#2A2D37] rounded p-3">
              <div className="text-xs text-[#6B7280] mb-1">Prompt:</div>
              <div className="text-sm text-[#E5E7EB] font-mono">
                {scenario.prompt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
