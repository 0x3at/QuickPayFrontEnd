import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, RefreshCw } from 'lucide-react';
import { entityNames } from '@/lib/types';
import { getClient } from '@/hooks/api-hooks';

// Form schema for integration actions
const formSchema = z.object({
  entity: z.string({
    required_error: "Please select an entity",
  }),
  action: z.enum(['connect', 'reset'], {
    required_error: "Please select an action",
  }),
});

interface IntegrationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntity: string | null;
  clientID: number;
  onSuccess?: () => void;
}

export function IntegrationSettingsDialog({
  open,
  onOpenChange,
  selectedEntity,
  clientID,
  onSuccess
}: IntegrationSettingsDialogProps) {
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: 'connect',
      entity: selectedEntity || '',
    }
  });

  // Update form when selectedEntity changes
  React.useEffect(() => {
    if (selectedEntity) {
      form.setValue('entity', selectedEntity);
    }
  }, [selectedEntity, form]);

  const onSubmitAction = async (values: z.infer<typeof formSchema>) => {
    try {
      const entityName = entityNames[values.entity as keyof typeof entityNames] || values.entity;
      
      if (values.action === 'connect') {
        // Here you would call your API to connect the integration
        console.log(`Connecting ${entityName} integration`);
        toast.success(`Successfully initiated connection for ${entityName}`);
      } else {
        // Here you would call your API to reset the integration
        console.log(`Resetting ${entityName} integration`);
        toast.success(`Successfully reset integration for ${entityName}`);
      }
      
      // Refresh client data (or use the callback)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Action failed:', err);
      toast.error(`Failed to ${values.action} integration`);
    } finally {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Integration Settings</DialogTitle>
          <DialogDescription>
            Connect or reset integration services for this entity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-4">
            <FormField
              control={form.control}
              name="entity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={true}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(entityNames).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="connect">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-primary" />
                          Connect Integration
                        </div>
                      </SelectItem>
                      <SelectItem value="reset">
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 text-destructive" />
                          Reset Integration
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={form.watch("action") === "reset" ? "destructive" : "default"}
              >
                {form.watch("action") === "connect" ? (
                  <Plus className="h-4 w-4 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {form.watch("action") === "connect" ? "Connect" : "Reset"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 