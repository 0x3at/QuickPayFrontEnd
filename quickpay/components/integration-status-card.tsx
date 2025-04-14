import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientDetailResponseV2, EntityDetailV2 } from '@/lib/typesV2';
import { 
  Building, 
  CheckCircle2, 
  PhoneIcon, 
  ScrollTextIcon, 
  MegaphoneIcon,
  Plus,
  XCircle
} from 'lucide-react';
import { IntegrationActionButton } from './integration-action-button';

interface IntegrationStatusCardProps {
  clientDetails: ClientDetailResponseV2;
  entities: EntityDetailV2[];
  onManageIntegration: (entityKey: string) => void;
  className?: string;
}

export function IntegrationStatusCard({
  clientDetails,
  entities,
  onManageIntegration,
  className = ''
}: IntegrationStatusCardProps) {
  // Create a map for easier lookup of entity details
  const entityIconMap: Record<string, React.ReactNode> = {
    "wc": <PhoneIcon className="h-4 w-4 text-muted-foreground" />,
    "cg": <ScrollTextIcon className="h-4 w-4 text-muted-foreground" />,
    "vbc": <MegaphoneIcon className="h-4 w-4 text-muted-foreground" />,
  };
  
  // Create a map of entity codes to their full names for display
  const entityNameMap: Record<string, string> = {};
  entities.forEach(entity => {
    entityNameMap[entity.entityCode] = entity.entityName;
  });
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Quickbooks</TableHead>
              <TableHead>Auth.net</TableHead>
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientDetails.entityMappings.map((mapping) => {
              const entityCode = mapping.entityCode;
              const isQuickbooksConnected = mapping.quickbooksConnected;
              const hasAuthNetProfile = mapping.customerProfileID !== "";
              
              return (
                <TableRow key={entityCode}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {entityIconMap[entityCode] || <Building className="h-4 w-4 text-muted-foreground" />}
                      {mapping.entityName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isQuickbooksConnected ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Connected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {hasAuthNetProfile ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Connected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <IntegrationActionButton 
                      onClick={() => onManageIntegration(entityCode)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Show placeholder row if no entity mappings */}
            {clientDetails.entityMappings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No entity mappings available
                </TableCell>
              </TableRow>  
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 