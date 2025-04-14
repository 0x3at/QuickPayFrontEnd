import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface IntegrationActionButtonProps {
  onClick: () => void;
  variant?: 'default' | 'error' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xs' | 'icon';
  className?: string;
}

export function IntegrationActionButton({
  onClick,
  variant = 'error',
  size = 'xs',
  className = 'text-center'
}: IntegrationActionButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={onClick}
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
} 