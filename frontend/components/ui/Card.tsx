import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'teal' | 'navy' | 'warm' | 'green' | 'amber';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-white',
    teal: 'bg-teal-light border-teal',
    navy: 'bg-navy-light border-navy',
    warm: 'bg-warm-light border-warm',
    green: 'bg-green-light border-green',
    amber: 'bg-amber-light border-amber',
  };

  return (
    <div
      className={cn(
        'rounded-lg border shadow-sm p-4 border-[#d0d0d0]',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
};
