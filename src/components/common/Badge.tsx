import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'low' | 'medium' | 'high' | 'blue' | 'neutral' | 'purple' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    low: 'bg-[#162722] text-[#6FCF97] border-[#224738]',
    success: 'bg-[#162722] text-[#6FCF97] border-[#224738]',
    medium: 'bg-[#2B2616] text-[#F2C94C] border-[#4E3F1F]',
    high: 'bg-[#2E1A1D] text-[#EB5757] border-[#5A242B]',
    blue: 'bg-[#182338] text-[#6EA8FE] border-[#253A5E]',
    purple: 'bg-[#201F3B] text-[#8B9CFF] border-[#363468]',
    neutral: 'bg-[#222936] text-[#AAB2C0] border-[#2E3747]',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 leading-none',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ level: string; size?: 'xs' | 'sm' | 'md' | 'lg' }> = ({
  level,
  size = 'md',
}) => {
  const norm = level.toLowerCase();
  if (norm.includes('high') || norm === 'high') {
    return (
      <Badge variant="high" size={size}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#EB5757] mr-1.5" />
        High Risk
      </Badge>
    );
  }
  if (norm.includes('medium') || norm === 'medium') {
    return (
      <Badge variant="medium" size={size}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#F2C94C] mr-1.5" />
        Medium Risk
      </Badge>
    );
  }
  return (
    <Badge variant="low" size={size}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#6FCF97] mr-1.5" />
      Low Risk
    </Badge>
  );
};
