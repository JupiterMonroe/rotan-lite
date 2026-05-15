"use client";

import { InterventionEvent } from '@/lib/types';
import { format } from 'date-fns';

interface InterventionLogProps {
  events: InterventionEvent[];
}

export default function InterventionLog({ events }: InterventionLogProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PASS': return '✅';
      case 'HEDGE': return '⚠️';
      case 'CLARIFY': return '🔍';
      case 'BLOCK': return '🚫';
      default: return '•';
    }
  };

  const totalChecks = events.length;
  const totalInterventions = events.filter(e => e.gateDecision.action !== 'PASS').length;
  const totalBlocks = events.filter(e => e.gateDecision.action === 'BLOCK').length;
  const avgTrust = events.length > 0 
    ? events.reduce((sum, e) => sum + (e.riskAssessment.overallScore), 0) / events.length 
    : 100;

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Intervention Log</h3>
      
      <div className="bg-[#0F1117] border border-[#2A2D37] rounded p-4 font-mono text-sm max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-[#6B7280] text-center py-8">
            No interventions yet. Run a verification to begin.
          </div>
        ) : (
          <div className="space-y-2">
            {[...events].reverse().map((event, index) => (
              <div 
                key={event.id}
                className="flex items-start gap-3 text-xs border-b border-[#2A2D37] pb-2 last:border-0"
              >
                <span className="text-[#6B7280] shrink-0">
                  {format(event.timestamp, 'HH:mm:ss')}
                </span>
                <span className="text-lg shrink-0">
                  {getActionIcon(event.gateDecision.action)}
                </span>
                <div className="flex-1">
                  <div className="text-[#E5E7EB]">
                    {event.gateDecision.action} — {event.gateDecision.reason.substring(0, 60)}
                    {event.gateDecision.reason.length > 60 ? '...' : ''}
                  </div>
                  <div className="text-[#6B7280] mt-1">
                    Risk: {event.riskAssessment.overallScore.toFixed(0)} | 
                    {' '}{event.responseTimeMs}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#2A2D37] grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <div className="text-lg font-bold text-[#E5E7EB]">{totalChecks}</div>
            <div className="text-[#6B7280]">Checks</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#F59E0B]">{totalInterventions}</div>
            <div className="text-[#6B7280]">Interventions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#EF4444]">{totalBlocks}</div>
            <div className="text-[#6B7280]">Blocks</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#10B981]">{(100 - avgTrust).toFixed(0)}%</div>
            <div className="text-[#6B7280]">Avg Trust</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
