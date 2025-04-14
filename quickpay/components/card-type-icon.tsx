import React from 'react';
import { CreditCard } from 'lucide-react';

interface CardTypeIconProps {
  type: string;
  className?: string;
}

export function CardTypeIcon({ type, className = "" }: CardTypeIconProps) {
  const getCardColor = () => {
    const cardType = type.toLowerCase();
    
    if (cardType.includes('visa')) return 'text-blue-500';
    if (cardType.includes('mastercard')) return 'text-orange-500';
    if (cardType.includes('amex') || cardType.includes('american express')) return 'text-purple-500';
    if (cardType.includes('discover')) return 'text-amber-500';
    return 'text-slate-600';
  };

  return (
    <CreditCard className={`h-5 w-5 ${getCardColor()} ${className}`} />
  );
} 