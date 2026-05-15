"use client";

import { GateDecision } from '@/lib/types';

interface ResponseComparisonProps {
  rawResponse: string;
  gateDecision: GateDecision | null;
  isVerifying: boolean;
}

export default function ResponseComparison({ rawResponse, gateDecision, isVerifying }: ResponseComparisonProps) {
  const getHeaderStyle = (action: string | undefined) => {
    switch (action) {
      case 'PASS':
        return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', label: 'Verified' };
      case 'HEDGE':
        return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', label: 'Caution' };
      case 'CLARIFY':
        return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', label: 'Intervention' };
      case 'BLOCK':
        return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', label: 'BLOCKED — Stale Knowledge' };
      default:
        return { bg: 'bg-[#2A2D37]', border: 'border-[#2A2D37]', text: 'text-[#6B7280]', label: 'Awaiting verification...' };
    }
  };

  const style = getHeaderStyle(gateDecision?.action);

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">Response Comparison</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* LEFT: Original Response */}
        <div className="bg-[#0F1117] border border-[#2A2D37] rounded-lg overflow-hidden">
          <div className="bg-[#2A2D37] px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#E5E7EB]">AI Assistant (Unverified)</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">
              RAW
            </span>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {rawResponse ? (
              <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono">
                {rawResponse}
              </pre>
            ) : (
              <div className="text-[#6B7280] text-sm">No response yet...</div>
            )}
          </div>
        </div>

        {/* RIGHT: Verified/Modified Response */}
        <div className={`bg-[#0F1117] border ${style.border} rounded-lg overflow-hidden ${gateDecision?.action === 'BLOCK' ? 'animate-pulse' : ''}`}>
          <div className={`${style.bg} px-4 py-2 flex items-center justify-between border-b ${style.border}`}>
            <span className={`text-sm font-semibold ${style.text}`}>
              {style.label}
            </span>
            {gateDecision && (
              <span className={`text-xs px-2 py-1 rounded ${style.bg} ${style.text}`}>
                {gateDecision.action}
              </span>
            )}
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {isVerifying ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#6B7280]">Verifying response...</span>
                </div>
              </div>
            ) : !gateDecision ? (
              <div className="text-[#6B7280] text-sm py-12 text-center">
                Awaiting verification...
              </div>
            ) : gateDecision.action === 'PASS' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">No issues found</span>
                </div>
                <p className="text-sm text-[#9CA3AF]">
                  All verification checks passed. The response has been validated against live sources.
                </p>
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-sm text-[#E5E7EB]">{gateDecision.reason}</p>
                </div>
              </div>
            ) : gateDecision.action === 'HEDGE' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold">Proceed with caution</span>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-sm text-[#E5E7EB] mb-2">{gateDecision.reason}</p>
                </div>
                {gateDecision.modifiedResponse && (
                  <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono mt-3 p-3 bg-[#1A1D27] rounded">
                    {gateDecision.modifiedResponse}
                  </pre>
                )}
              </div>
            ) : gateDecision.action === 'CLARIFY' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Clarification Required</span>
                </div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-[#E5E7EB]">{gateDecision.reason}</p>
                </div>
                {gateDecision.modifiedResponse && (
                  <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono mt-3 p-3 bg-[#1A1D27] rounded">
                    {gateDecision.modifiedResponse}
                  </pre>
                )}
                {gateDecision.suggestedCorrection && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div className="text-xs text-green-400 font-semibold mb-2">Suggested Correction:</div>
                    <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono">
                      {gateDecision.suggestedCorrection}
                    </pre>
                  </div>
                )}
              </div>
            ) : gateDecision.action === 'BLOCK' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="font-semibold">RESPONSE BLOCKED</span>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-400 font-semibold">{gateDecision.reason}</p>
                </div>
                
                {/* Original with strikethrough */}
                <div className="mt-4">
                  <div className="text-xs text-[#6B7280] mb-2">Original Response (Blocked):</div>
                  <div className="p-3 bg-[#1A1D27] rounded line-through opacity-50">
                    <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono">
                      {rawResponse.substring(0, 200)}...
                    </pre>
                  </div>
                </div>

                {/* Correction */}
                {gateDecision.suggestedCorrection && (
                  <div className="mt-4 p-4 bg-green-500/10 border-2 border-green-500 rounded">
                    <div className="text-sm text-green-400 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified Correction:
                    </div>
                    <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono">
                      {gateDecision.suggestedCorrection}
                    </pre>
                  </div>
                )}

                {gateDecision.modifiedResponse && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-mono">
                      {gateDecision.modifiedResponse}
                    </pre>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
