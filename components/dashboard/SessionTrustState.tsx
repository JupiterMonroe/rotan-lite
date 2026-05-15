"use client";

import { SessionTrustState } from '@/lib/types';

interface SessionTrustStateProps {
  trustState: SessionTrustState | null;
}

export default function SessionTrustState({ trustState }: SessionTrustStateProps) {
  if (!trustState) {
    return (
      <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Session Trust State</h3>
        <div className="text-center py-4 text-[#6B7280] text-sm">
          No session data yet
        </div>
      </div>
    );
  }

  const trustLevel = trustState.currentTrustLevel;
  const trustPercentage = (trustLevel * 100).toFixed(0);
  
  // Calculate color based on trust level
  const getTrustColor = (level: number) => {
    if (level > 0.7) return '#10B981'; // Green
    if (level > 0.4) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const trustColor = getTrustColor(trustLevel);

  // Determine trend
  const getTrend = () => {
    if (trustState.interventionHistory.length < 2) return 'stable';
    
    const recent = trustState.interventionHistory.slice(-3);
    const interventions = recent.filter(e => e.gateDecision.action !== 'PASS').length;
    
    if (interventions === 0) return 'improving';
    if (interventions >= 2) return 'declining';
    return 'stable';
  };

  const trend = getTrend();
  const trendIcon = trend === 'improving' ? '↗' : trend === 'declining' ? '↘' : '→';
  const trendColor = trend === 'improving' ? 'text-green-400' : trend === 'declining' ? 'text-red-400' : 'text-[#9CA3AF]';

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Session Trust State</h3>
      
      <div className="space-y-4">
        {/* Trust Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#9CA3AF]">Trust Level</span>
            <span className="text-lg font-bold text-[#E5E7EB]">{trustPercentage}%</span>
          </div>
          <div className="relative h-8 bg-[#0F1117] rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 transition-all duration-500 flex items-center justify-center"
              style={{ 
                width: `${trustPercentage}%`,
                background: `linear-gradient(to right, ${trustColor}, ${trustColor}dd)`
              }}
            >
              <span className="text-xs font-bold text-white px-2">
                {trustPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-between p-3 bg-[#0F1117] rounded">
          <span className="text-sm text-[#9CA3AF]">Trend</span>
          <span className={`text-sm font-semibold ${trendColor} flex items-center gap-1`}>
            <span className="text-lg">{trendIcon}</span>
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#0F1117] rounded text-center">
            <div className="text-2xl font-bold text-[#E5E7EB]">
              {trustState.totalInteractions}
            </div>
            <div className="text-xs text-[#6B7280]">Total Interactions</div>
          </div>
          <div className="p-3 bg-[#0F1117] rounded text-center">
            <div className="text-2xl font-bold text-[#F59E0B]">
              {trustState.interventionCount}
            </div>
            <div className="text-xs text-[#6B7280]">Interventions</div>
          </div>
        </div>

        {/* Rates */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Decay Rate:</span>
            <span className="text-[#E5E7EB] font-mono">-{(trustState.trustDecayRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Recovery Rate:</span>
            <span className="text-[#E5E7EB] font-mono">+{(trustState.trustRecoveryRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
