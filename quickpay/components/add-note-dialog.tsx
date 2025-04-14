import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Resolver } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { successToast } from '@/lib/utils';
import { addClientNoteV2 } from '@/hooks/apiv2-hooks';
import { AddNotePayloadV2 } from '@/lib/typesV2';

// Define Zod schema for form validation
const noteFormSchema = z.object({
	author: z.string().min(2, 'Author name must be at least 2 characters').max(128, 'Author name must be at most 128 characters'),
	note: z.string().min(3, 'Note must be at least 3 characters').max(256, 'Note must be at most 256 characters'),
	important: z.boolean().default(false),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface AddNoteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clientID: number;
	onSuccess?: () => void;
	defaultAuthor?: string;
}

export function AddNoteDialog({
	open,
	onOpenChange,
	clientID,
	onSuccess,
	defaultAuthor = 'System'
}: AddNoteDialogProps) {
	// Initialize form
	const form = useForm<NoteFormValues>({
		resolver: zodResolver(noteFormSchema) as Resolver<NoteFormValues>,
		defaultValues: {
			author: defaultAuthor,
			note: '',
			important: false,
		},
	});

	// Form submission handler
	const onSubmit = async (values: NoteFormValues) => {
		try {
			// Convert clientID to number (if not already)
			const clientIDNumber = Number(clientID);
			console.log({
				clientIDNumber,
				...values
			})
			
			// Ensure clientID is valid
			if (isNaN(clientIDNumber)) {
				throw new Error("Invalid client ID");
			}
			
			// Create payload for V2 API
			const payload: AddNotePayloadV2 = {
				clientID: clientIDNumber,
				note: values.note,
				important: values.important,
				author: values.author
			};
			
			// Call the V2 API
			await addClientNoteV2(clientIDNumber, payload);
			
			// Reset form
			form.reset({
				author: defaultAuthor,
				note: '',
				important: false,
			});
			
			// Close dialog
			onOpenChange(false);
			
			// Call onSuccess callback to refresh data
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error("Failed to add note:", error);
			toast.error("Failed to add note. Please try again.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => {
			if (!isOpen) form.reset();
			onOpenChange(isOpen);
		}}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Note</DialogTitle>
					<DialogDescription>
						Add a new note to the client record.
					</DialogDescription>
				</DialogHeader>
				
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="author"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Author</FormLabel>
									<FormControl>
										<Input placeholder="Your name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Note</FormLabel>
									<FormControl>
										<Textarea 
											placeholder="Enter note text here..." 
											className="min-h-[120px]" 
											{...field} 
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="important"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
                                            className="my-auto border-black"
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Mark as important</FormLabel>
										<FormDescription>
											Important notes are highlighted and displayed at the top.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
						
						<DialogFooter className="gap-2 pt-2">
							<Button 
								variant="outline" 
								type="button"
								onClick={() => {
									form.reset();
									onOpenChange(false);
								}}
								disabled={form.formState.isSubmitting}
							>
								Cancel
							</Button>
							<Button 
								type="submit"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? 'Adding...' : 'Add Note'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
