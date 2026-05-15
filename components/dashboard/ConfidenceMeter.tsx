"use client";

interface ConfidenceMeterProps {
  confidenceLevel: number;
  evidenceAlignment: number;
  mismatchScore: number;
}

export default function ConfidenceMeter({ confidenceLevel, evidenceAlignment, mismatchScore }: ConfidenceMeterProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const confidenceOffset = circumference - (confidenceLevel * circumference);
  const evidenceOffset = circumference - (evidenceAlignment * circumference);
  
  const hasMismatch = mismatchScore > 0.5;
  const evidenceColor = hasMismatch ? '#EF4444' : '#10B981';

  return (
    <div className={`bg-[#1A1D27] border ${hasMismatch ? 'border-red-500 animate-pulse' : 'border-[#2A2D37]'} rounded-lg p-6`}>
      <h3 className="text-lg font-semibold text-[#E5E7EB] mb-4">Confidence Meter</h3>
      
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90" width="192" height="192">
            {/* Background circles */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#2A2D37"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r={radius - 20}
              stroke="#2A2D37"
              strokeWidth="12"
              fill="none"
            />
            
            {/* Confidence arc (outer) */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#3B82F6"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={confidenceOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            
            {/* Evidence arc (inner) */}
            <circle
              cx="96"
              cy="96"
              r={radius - 20}
              stroke={evidenceColor}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={evidenceOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-[#E5E7EB]">
              {(mismatchScore * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-[#9CA3AF] mt-1">Mismatch</div>
          </div>
        </div>
        
        {/* Labels */}
        <div className="mt-6 space-y-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span className="text-sm text-[#9CA3AF]">AI Confidence:</span>
            </div>
            <span className="text-sm font-mono text-[#E5E7EB]">
              {(confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: evidenceColor }} />
              <span className="text-sm text-[#9CA3AF]">Evidence:</span>
            </div>
            <span className="text-sm font-mono text-[#E5E7EB]">
              {(evidenceAlignment * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
