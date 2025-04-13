"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
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
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { createClient, getClientIDs, useSalesReps } from "@/hooks/api-hooks"
import { errorToast, successToast } from "@/lib/utils"

export function CreateClientSheet() {
    // Load all client IDs at component mount
    const [existingClientIDs, setExistingClientIDs] = useState<number[]>([]);
    const [isLoadingIDs, setIsLoadingIDs] = useState(true);

    // Fetch the client IDs once at component load
    useEffect(() => {
        async function loadClientIDs() {
            try {
                setIsLoadingIDs(true);
                const ids = await getClientIDs();
                setExistingClientIDs(ids);
            } catch (error) {
                console.error("Failed to load client IDs:", error);
            } finally {
                setIsLoadingIDs(false);
            }
        }

        loadClientIDs();
    }, []);

    // Use our sales reps hook
    const { data, isLoading: isLoadingSalesReps, error } = useSalesReps();
    const salesReps = data?.salespeople || [];

    // Define the schema with local ID validation
    const formSchema = z.object({
        clientID: z.coerce
            .number({
                required_error: "Client ID is required",
                invalid_type_error: "Client ID must be a number",
            })
            .min(1, "Client ID must be at least 1")
            .refine(
                (id) => !existingClientIDs.includes(id),
                "This Client ID already exists"
            ),
        companyName: z.string().min(2, "Company name must be at least 2 characters"),
        primaryContact: z.string().min(2, "Primary contact name is required"),
        email: z.string().email("Please enter a valid email address"),
        salesperson: z.string().min(2, "Sales representative is required"),
    });

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });

    const { formState } = form;
    const { isValid, isDirty, isSubmitting } = formState;

    async function onSubmit(data: FormValues) {
        console.log(data);
        const response: any = await createClient(data)
        console.log(response);
        if (response.client.clientStatus === "Active") {
            successToast(`Client ${data.clientID} created`);
            // Update the local list of IDs to include the new one
            setExistingClientIDs([...existingClientIDs, data.clientID]);
        } else {
            errorToast(`Client ${data.clientID} creation failed`);
        }

        // Reset the form
        form.reset();
    }

    // Loading state for the entire form
    const isLoading = isLoadingIDs || isLoadingSalesReps;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Create Client</Button>
            </SheetTrigger>
            <SheetContent className="w-full px-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p>Loading form data...</p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <SheetHeader>
                                <SheetTitle>Create Client</SheetTitle>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="clientID"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="5000"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="WholeSale Communications" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="primaryContact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Contact</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Amber Valdez" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="amber@wholesalec.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="salesperson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sales Representative</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a sales representative" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {salesReps.map((rep) => (
                                                            <SelectItem key={rep} value={rep}>
                                                                {rep}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <SheetFooter>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid || !isDirty}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    )
}
