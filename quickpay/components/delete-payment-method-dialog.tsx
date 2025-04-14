'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Trash2 } from 'lucide-react';
import { errorToast, successToast } from '@/lib/utils';
import { entityNames } from '@/lib/types';
import { PaymentProfileV2 } from '@/lib/typesV2';
import { deletePaymentMethodV2 } from '@/hooks/apiv2-hooks';
import { CardTypeIcon } from '@/components/card-type-icon';

// Validation schema for the form
const deletePaymentMethodSchema = z.object({
  entityCode: z.string(),
});

type DeletePaymentMethodFormValues = z.infer<typeof deletePaymentMethodSchema>;

interface DeletePaymentMethodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientID: number;
  paymentProfile: PaymentProfileV2;
  onDeleteSuccess?: () => void;
}

export function DeletePaymentMethodDialog({
  isOpen,
  onOpenChange,
  clientID,
  paymentProfile,
  onDeleteSuccess,
}: DeletePaymentMethodDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<DeletePaymentMethodFormValues>({
    resolver: zodResolver(deletePaymentMethodSchema),
    defaultValues: {
      entityCode: 'all',
    },
  });

  // Handler for form submission
  const onSubmitDeletePaymentMethod = async (data: DeletePaymentMethodFormValues) => {
    try {
      setIsSubmitting(true);

      // Create the payload matching the V2 API expectations
      const payload = {
        clientID: clientID,
        paymentProfileID: paymentProfile.paymentProfileID,
        entityCode: data.entityCode === 'all' ? undefined : data.entityCode,
      };

      // Call the API
      await deletePaymentMethodV2(payload);
      
      const entityText = data.entityCode === 'all' 
        ? 'all entities' 
        : `${entityNames[data.entityCode as keyof typeof entityNames]}`;
      
      successToast(`Payment method successfully deleted from ${entityText}`);
      onOpenChange(false);
      form.reset(); // Clear the form
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      errorToast('An error occurred while deleting the payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md p-0 overflow-hidden'>
        <div className="bg-destructive/10 p-6 border-b border-destructive/20">
          <DialogHeader className="p-0">
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              Delete Payment Method
            </DialogTitle>
            <DialogDescription className='text-xs text-destructive/80 mt-1'>
              This action will remove the payment method and cannot be undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4">
          {/* Payment Method Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Payment Method Details</h3>
            <div className="p-4 border rounded-md bg-muted/20 space-y-3">
              <div className="flex items-center gap-2">
                <CardTypeIcon type={paymentProfile?.cardType || 'Unknown'} className="h-7 w-7" />
                <div>
                  <span className="font-medium text-base">•••• {paymentProfile?.lastFour}</span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {paymentProfile?.billingDetails.firstName} {paymentProfile?.billingDetails.lastName}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div>Expires: {paymentProfile?.expirationDate}</div>
                <div className="text-right">ID: {paymentProfile?.paymentProfileID.substring(0, 8)}...</div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitDeletePaymentMethod)} className="space-y-5">
              <FormField
                control={form.control}
                name="entityCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Delete From</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select an entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all" className="font-medium">All Entities</SelectItem>
                        <Separator className="my-1" />
                        {Object.entries(entityNames).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="bg-destructive/5 p-3 rounded-md border border-destructive/20 text-xs text-destructive flex items-start gap-2 mt-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Warning:</span> Deleting from all entities will remove this payment method completely.
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  type="button"
                  className="w-1/2 mr-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 w-1/2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse mr-1">•••</span>
                      Deleting
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
