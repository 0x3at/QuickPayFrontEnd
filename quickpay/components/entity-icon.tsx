import React from 'react';
import { 
  PhoneIcon, 
  ScrollTextIcon, 
  MegaphoneIcon, 
  Building 
} from 'lucide-react';

interface EntityIconProps {
  entity: string;
  className?: string;
}

export function EntityIcon({ entity, className = "" }: EntityIconProps) {
  const entityKey = entity.toLowerCase();
  
  if (entityKey === 'wc') {
    return <PhoneIcon className={`h-4 w-4 text-primary ${className}`} />;
  }
  
  if (entityKey === 'cg') {
    return <ScrollTextIcon className={`h-4 w-4 text-primary ${className}`} />;
  }
  
  if (entityKey === 'vbc') {
    return <MegaphoneIcon className={`h-4 w-4 text-primary ${className}`} />;
  }
  
  return <Building className={`h-4 w-4 text-primary ${className}`} />;
} 