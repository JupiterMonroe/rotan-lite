"use client";

import { RiskAssessment } from '@/lib/types';
import { RISK_COLORS } from '@/lib/constants';

interface RiskScoreCardProps {
  riskAssessment: RiskAssessment | null;
  isLoading: boolean;
}

export default function RiskScoreCard({ riskAssessment, isLoading }: RiskScoreCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-[#2A2D37] rounded w-32 mb-4" />
        <div className="h-24 bg-[#2A2D37] rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-[#2A2D37] rounded" />
          <div className="h-4 bg-[#2A2D37] rounded" />
          <div className="h-4 bg-[#2A2D37] rounded" />
        </div>
      </div>
    );
  }

  if (!riskAssessment) {
    return (
      <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Risk Score</h3>
        <div className="text-center py-8 text-[#6B7280]">
          No assessment yet
        </div>
      </div>
    );
  }

  const riskColor = RISK_COLORS[riskAssessment.riskCategory];
  const checkTypes = ['EXISTENCE', 'VERSION_VALIDITY', 'SELF_CONSISTENCY', 'GROUNDEDNESS', 'SECURITY'];
  
  const checkScores = checkTypes.map(type => {
    const checks = riskAssessment.checks.filter(c => c.checkType === type);
    if (checks.length === 0) return { type, score: 0, count: 0 };
    const passed = checks.filter(c => c.passed).length;
    return { type, score: (passed / checks.length) * 100, count: checks.length };
  }).filter(c => c.count > 0);

  return (
    <div className="bg-[#1A1D27] border border-[#2A2D37] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Risk Score</h3>
      
      <div className="text-center mb-6">
        <div 
          className="text-6xl font-bold mb-2"
          style={{ color: riskColor.bg }}
        >
          {riskAssessment.overallScore.toFixed(0)}
        </div>
        <div 
          className="inline-block px-4 py-1 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: riskColor.bg,
            color: riskColor.text
          }}
        >
          {riskColor.label}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-[#9CA3AF] mb-2">Check Scores</div>
        {checkScores.map(({ type, score, count }) => (
          <div key={type}>
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
              <span>{type.replace('_', ' ')}</span>
              <span>{score.toFixed(0)}% ({count})</span>
            </div>
            <div className="h-2 bg-[#0F1117] rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${score}%`,
                  backgroundColor: score > 70 ? '#10B981' : score > 40 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#2A2D37] grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-[#E5E7EB]">
            {(riskAssessment.confidenceLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-[#9CA3AF]">Confidence</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#E5E7EB]">
            {(riskAssessment.evidenceAlignment * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-[#9CA3AF]">Evidence</div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
