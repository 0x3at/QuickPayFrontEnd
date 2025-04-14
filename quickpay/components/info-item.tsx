// components/client/info-item.tsx
import React from 'react'
import { Label } from "@/components/ui/label"

interface InfoItemProps {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function InfoItem({ label, value, icon, className = "" }: InfoItemProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="text-muted-foreground text-sm">
        {label}
      </Label>
      <div id={label.toLowerCase().replace(/\s+/g, '-')} className="font-medium flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {value}
      </div>
    </div>
  )
}