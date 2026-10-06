import React from 'react';

interface ScoreBarProps {
  score: number;
  max?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  reverseColor?: boolean; // For risk probability where high = red
  className?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  score,
  max = 100,
  showText = true,
  size = 'md',
  reverseColor = false,
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, (score / max) * 100));

  let colorClass = 'bg-[#6FCF97]';
  let textClass = 'text-[#6FCF97]';

  if (reverseColor) {
    if (percent >= 60) {
      colorClass = 'bg-[#EB5757]';
      textClass = 'text-[#EB5757]';
    } else if (percent >= 30) {
      colorClass = 'bg-[#F2C94C]';
      textClass = 'text-[#F2C94C]';
    } else {
      colorClass = 'bg-[#6FCF97]';
      textClass = 'text-[#6FCF97]';
    }
  } else {
    if (percent < 50) {
      colorClass = 'bg-[#EB5757]';
      textClass = 'text-[#EB5757]';
    } else if (percent < 70) {
      colorClass = 'bg-[#F2C94C]';
      textClass = 'text-[#F2C94C]';
    } else {
      colorClass = 'bg-[#6FCF97]';
      textClass = 'text-[#6FCF97]';
    }
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-xs mb-1">
        {showText && <span className={`font-semibold ${textClass}`}>{score.toFixed(1)}%</span>}
      </div>
      <div className={`w-full bg-[#222936] rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
