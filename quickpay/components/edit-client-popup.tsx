'use client'
import { Client } from "@/hooks/api-hooks"
import { editClientV2 } from "@/hooks/apiv2-hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { errorToast, successToast } from "@/lib/utils"
import { useSalespeopleV2 } from "@/hooks/apiv2-hooks"
import { EditClientPayloadV2 } from "@/lib/typesV2"

// Simplified props without the callback
export function EditClientDialog({ 
  open, 
  onOpenChange, 
  client
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  client: any
}) {
  // Use the sales reps hook with V2 API
  const { data, isLoading: isLoadingSalesReps, error } = useSalespeopleV2();
  const salesReps = data?.salespeople || [];
  
  // Define form schema with validation matching backend serializer
  const formSchema = z.object({
    clientID: z.number({
      required_error: "Client ID is required",
      invalid_type_error: "Client ID must be a number",
    }).min(1, "Client ID must be at least 1"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    primaryContact: z.string().min(2, "Primary contact name is required"),
    email: z.string().email("Please enter a valid email address"),
    clientStatus: z.string().min(1, "Status is required"),
    salesPerson: z.string().min(2, "Sales representative is required"),
  });

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      clientID: client.clientID,
      companyName: client.companyName,
      primaryContact: client.primaryContact,
      email: client.email,
      clientStatus: client.clientStatus,
      salesPerson: client.salesPerson || "",
    }
  });

  // Reset form values when client data changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        clientID: client.clientID,
        companyName: client.companyName,
        primaryContact: client.primaryContact,
        email: client.email,
        clientStatus: client.clientStatus,
        salesPerson: client.salesPerson || "",
      });
    }
  }, [open, client, form]);

  const { formState } = form;
  const { isValid, isDirty, isSubmitting } = formState;

  async function onSubmit(data: FormValues) {
    try {
      // Create the payload matching the V2 API expectations
      const payload: EditClientPayloadV2 = {
        clientID: data.clientID,
        primaryContact: data.primaryContact,
        companyName: data.companyName,
        salesPerson: data.salesPerson,
        email: data.email,
        clientStatus: data.clientStatus
      };
      
      // Call the V2 API edit function
      await editClientV2(data.clientID, payload);
      
      successToast(`Client ${data.clientID} updated successfully`);
      
      // Close the dialog
      onOpenChange(false);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update client:", error);
      errorToast("Failed to update client");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Make changes to the client information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="clientID"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Client ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="col-span-3"
                        disabled // Usually client ID should not be editable
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Company Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="col-span-3"
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryContact"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Primary Contact</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="col-span-3"
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="col-span-3"
                      />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="salesPerson"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Sales Representative</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingSalesReps}
                    >
                      <FormControl>
                        <SelectTrigger className="col-span-3 w-2/4">
                          <SelectValue placeholder={isLoadingSalesReps ? "Loading..." : "Select a sales rep"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salesReps.map((rep) => (
                          <SelectItem key={rep} value={rep}>
                            {rep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientStatus"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Client Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="col-span-3 w-[200px]">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isValid || !isDirty || isLoadingSalesReps}
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
