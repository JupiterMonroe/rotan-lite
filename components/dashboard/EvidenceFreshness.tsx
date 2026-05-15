"use client";

import { VerificationCheck } from '@/lib/types';
import { format } from 'date-fns';

interface EvidenceFreshnessProps {
  checks: VerificationCheck[];
}

export default function EvidenceFreshness({ checks }: EvidenceFreshnessProps) {
  const getFreshnessBadge = (freshness: string) => {
    switch (freshness) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        );
      case 'CACHED':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            CACHED
          </span>
        );
      case 'STALE':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            STALE
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            UNAVAILABLE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Evidence Freshness</h3>
      
      {checks.length === 0 ? (
        <div className="text-center py-4 text-[#6B7280] text-sm">
          No verification checks yet
        </div>
      ) : (
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div 
              key={index}
              className="bg-[#0F1117] border border-[#2A2D37] rounded p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#E5E7EB] mb-1">
                    {check.source}
                  </div>
                  <div className="text-xs text-[#9CA3AF]">
                    {check.checkType.replace('_', ' ')}
                  </div>
                </div>
                {getFreshnessBadge(check.freshness)}
              </div>
              
              <div className="text-xs text-[#9CA3AF] mb-2">
                {check.evidence}
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={check.passed ? 'text-green-400' : 'text-red-400'}>
                  {check.passed ? '✓ Passed' : '✗ Failed'}
                </span>
                <span className="text-[#6B7280]">
                  {format(new Date(), 'HH:mm:ss')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Made with Bob
