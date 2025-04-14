import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ClientDetailResponseV2 } from '@/lib/typesV2';
import {
  CircleUserRoundIcon,
  MailIcon,
  UserIcon,
  Pencil
} from 'lucide-react';

interface ClientInfoCardProps {
  clientDetails: ClientDetailResponseV2;
  onEdit: () => void;
  className?: string;
}

export function ClientInfoCard({
  clientDetails,
  onEdit,
  className = ''
}: ClientInfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="">
        <CardTitle className="text-lg flex items-center gap-2">
          <CircleUserRoundIcon className="h-5 w-5 text-primary-background" />
          Client Information
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit client</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-contact" className="text-muted-foreground text-sm">Primary Contact</Label>
            <div id="primary-contact" className="font-medium flex items-center">
              <CircleUserRoundIcon className="h-4 w-4 mr-2 text-primary" />
              {clientDetails.client.primaryContact}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-sm">Email Address</Label>
            <div id="email" className="font-medium flex items-center">
              <MailIcon className="h-4 w-4 mr-2 text-primary" />
              {clientDetails.client.email}
            </div>	
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-person" className="text-muted-foreground text-sm">Sales Representative</Label>
            <div id="sales-person" className="font-medium flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-primary" />
              {clientDetails.client.salesPerson}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 