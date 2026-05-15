"use client";

import { useState } from 'react';
import { useRotanStore } from '@/store/useRotanStore';
import ConfidenceMeter from '@/components/dashboard/ConfidenceMeter';
import RiskScoreCard from '@/components/dashboard/RiskScoreCard';
import EvidenceFreshness from '@/components/dashboard/EvidenceFreshness';
import InterventionLog from '@/components/dashboard/InterventionLog';
import SessionTrustState from '@/components/dashboard/SessionTrustState';
import ResponseComparison from '@/components/dashboard/ResponseComparison';
import DemoPromptRunner from '@/components/demo/DemoPromptRunner';

export default function Home() {
  const {
    currentPrompt,
    rawResponse,
    isVerifying,
    currentIntervention,
    interventionLog,
    trustState,
    setPrompt,
    setRawResponse,
    runVerification,
  } = useRotanStore();

  const [mode, setMode] = useState<'manual' | 'demo'>('manual');

  const handleVerify = async () => {
    if (!currentPrompt || !rawResponse) return;
    await runVerification();
  };

  const trustLevel = trustState?.currentTrustLevel ?? 1.0;
  const trustColor = trustLevel > 0.7 ? '#10B981' : trustLevel > 0.4 ? '#F59E0B' : '#EF4444';

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8 border-b border-[#2A2D37] pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#E5E7EB] mb-2">ROTAN</h1>
            <p className="text-[#9CA3AF]">Runtime Verification for AI Coding Assistants</p>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full animate-pulse" 
              style={{ backgroundColor: trustColor }}
            />
            <span className="text-[#E5E7EB] font-mono">
              Trust: {(trustLevel * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </header>

      {/* Mode Toggle */}
      <div className="mb-6 flex items-center gap-2 bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('manual')}
          className={`px-6 py-2 rounded transition-colors ${
            mode === 'manual'
              ? 'bg-[#3B82F6] text-white'
              : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode('demo')}
          className={`px-6 py-2 rounded transition-colors ${
            mode === 'demo'
              ? 'bg-[#3B82F6] text-white'
              : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
          }`}
        >
          Demo Mode
        </button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Input/Demo & Comparison */}
        <div className="lg:col-span-3 space-y-6">
          {mode === 'manual' ? (
            /* Manual Input Section */
            <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">Verification Input</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Prompt</label>
                  <textarea
                    value={currentPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 bg-[#0F1117] border border-[#2A2D37] rounded px-3 py-2 text-[#E5E7EB] font-mono text-sm focus:outline-none focus:border-[#3B82F6]"
                    placeholder="Enter the prompt sent to the AI assistant..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Raw AI Response</label>
                  <textarea
                    value={rawResponse}
                    onChange={(e) => setRawResponse(e.target.value)}
                    className="w-full h-32 bg-[#0F1117] border border-[#2A2D37] rounded px-3 py-2 text-[#E5E7EB] font-mono text-sm focus:outline-none focus:border-[#3B82F6]"
                    placeholder="Paste the AI assistant's response here..."
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !currentPrompt || !rawResponse}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#2A2D37] disabled:text-[#6B7280] text-white font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Response'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Demo Mode Section */
            <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
              <DemoPromptRunner />
            </div>
          )}

          {/* Response Comparison */}
          <ResponseComparison
            rawResponse={rawResponse}
            gateDecision={currentIntervention?.gateDecision ?? null}
            isVerifying={isVerifying}
          />
        </div>

        {/* Right Column - Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <ConfidenceMeter
            confidenceLevel={currentIntervention?.riskAssessment.confidenceLevel ?? 0}
            evidenceAlignment={currentIntervention?.riskAssessment.evidenceAlignment ?? 0}
            mismatchScore={currentIntervention?.riskAssessment.mismatchScore ?? 0}
          />

          <RiskScoreCard
            riskAssessment={currentIntervention?.riskAssessment ?? null}
            isLoading={isVerifying}
          />

          <EvidenceFreshness
            checks={currentIntervention?.riskAssessment.checks ?? []}
          />

          <InterventionLog events={interventionLog} />

          <SessionTrustState trustState={trustState} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[#2A2D37] text-center text-[#6B7280] text-sm">
        ROTAN Lite — Built for IBM Hackathon 2026
      </footer>
    </div>
  );
}

// Made with Bob
