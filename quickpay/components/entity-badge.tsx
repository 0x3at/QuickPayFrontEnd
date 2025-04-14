// components/ui/entity-badge.tsx
import React from 'react'
import { Badge } from "@/components/ui/badge"
import { EntityIcon } from "./entity-icon"
import { entityNames } from '@/lib/types'

interface EntityBadgeProps {
  entity: string
  active?: boolean
  className?: string
}

export function EntityBadge({ entity, active = true, className = "" }: EntityBadgeProps) {
  const entityKey = entity.toLowerCase()
  const entityName = entityNames[entityKey as keyof typeof entityNames] || entity
  
  return (
    <Badge 
      variant={active ? "success" : "error"}
      className={`flex items-center gap-1 ${className}`}
    >
      <EntityIcon entity={entityKey} className="h-3 w-3" />
      <span>{entityName}</span>
    </Badge>
  )
}