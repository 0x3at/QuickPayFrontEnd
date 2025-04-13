'use client'
import { Client, editClient } from "@/hooks/api-hooks"
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
import { useSalesReps } from "@/hooks/api-hooks"

// Simplified props without the callback
export function EditClientDialog({ 
  open, 
  onOpenChange, 
  client
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  client: Client
}) {
  // Use the sales reps hook
  const { data, isLoading: isLoadingSalesReps, error } = useSalesReps();
  const salesReps = data?.salespeople || [];
  
  // Define form schema with validation
  const formSchema = z.object({
    clientID: z.coerce.number({
      required_error: "Client ID is required",
      invalid_type_error: "Client ID must be a number",
    }).min(1, "Client ID must be at least 1"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    primaryContact: z.string().min(2, "Primary contact name is required"),
    email: z.string().email("Please enter a valid email address"),
    clientStatus: z.string().min(1, "Status is required"),
    salesperson: z.string().min(2, "Sales representative is required"),
  });

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      clientID: parseInt(client.clientID.toString()),
      companyName: client.companyName,
      primaryContact: client.primaryContact,
      email: client.email,
      clientStatus: client.clientStatus,
      // If client.salesperson doesn't exist, default to empty or first rep
      salesperson: (client as any).salesPerson || salesReps[0] || "",
    }
  });

  // Reset form values when client data changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        clientID: parseInt(client.clientID.toString()),
        companyName: client.companyName,
        primaryContact: client.primaryContact,
        email: client.email,
        clientStatus: client.clientStatus,
        salesperson: (client as any).salesPerson || salesReps[0] || "",
      });
    }
  }, [open, client, form, salesReps]);

  const { formState } = form;
  const { isValid, isDirty, isSubmitting } = formState;

  async function onSubmit(data: FormValues) {
    try {
      const clientDetails = await editClient(data);
      console.log(clientDetails);
      
      if (clientDetails.client.clientID) {
        successToast(`Client ${data.clientID} updated successfully`);
        
        // Close the dialog before refreshing
        onOpenChange(false);
        
        // Force a complete page refresh to reload all data
        window.location.reload();
      } else {
        errorToast("Failed to update client");
      }
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
                name="salesperson"
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
