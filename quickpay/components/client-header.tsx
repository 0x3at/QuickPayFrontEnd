// components/client/client-header.tsx
import React from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EntityBadge } from "./entity-badge"
import { ClientDetailResponseV2 } from '@/lib/typesV2'
import { StatusBadge } from './status-badge'

interface ClientHeaderProps {
  clientDetails: ClientDetailResponseV2
  onEdit: () => void
}

export function ClientHeader({ clientDetails, onEdit }: ClientHeaderProps) {
  // Get unique entity codes from entity mappings
  const entityCodes = clientDetails.entityMappings.map(mapping => mapping.entityCode);
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {clientDetails.client.companyName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{clientDetails.client.companyName}</h1>
            <Badge variant={clientDetails.client.clientStatus.toLowerCase() === "active" ? "success" : "error"}>
              {clientDetails.client.clientStatus}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit client</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <StatusBadge status="Completed" showIcon={true} >{clientDetails.client.clientID}</StatusBadge>
            <span className="text-xs">•</span>
            <span className="text-sm">{clientDetails.client.primaryContact}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {entityCodes.map((entityCode) => (
            <EntityBadge 
              key={entityCode}
              entity={entityCode}
            />
          ))}
        </div>
      </div>
    </div>
  )
}