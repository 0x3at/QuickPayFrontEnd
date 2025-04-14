'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { errorToast, formatDigits, successToast } from '@/lib/utils';
import { CreatePaymentProfilePayloadV2 } from '@/lib/typesV2';
import { createPaymentProfileV2 } from '@/hooks/apiv2-hooks';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Toaster } from 'sonner';

// Payment method schema
const paymentMethodSchema = z.object({
	billingDetails: z.object({
		firstName: z.string().min(1, 'First name is required').max(128, 'First name must be at most 128 characters'),
		lastName: z.string().min(1, 'Last name is required').max(128, 'Last name must be at most 128 characters'),
		streetAddress: z.string().min(1, 'Street address is required').max(128, 'Street address must be at most 128 characters'),
		zipCode: z.string().min(1, 'Zip code is required').max(128, 'Zip code must be at most 128 characters'),
	}),
	cardDetails: z.object({
		cardNumber: z
			.string()
			.min(13, 'Card number must be at least 13 digits')
			.max(16, 'Card number must be at most 16 digits')
			.regex(/^\d+$/, 'Card number must contain only digits'),
		cardCode: z
			.string()
			.min(3, 'Card code must be at least 3 digits')
			.max(4, 'Card code must be at most 4 digits')
			.regex(/^\d+$/, 'Card code must contain only digits'),
		expirationDate: z
			.string()
			.regex(
				/^\d{4}-\d{2}$/,
				'Expiration date must be in YYYY-MM format'
			),
	}),
	note: z.string().max(256, 'Note must be at most 256 characters').optional(),
	entity: z.string().max(6, 'Entity code must be at most 6 characters').optional(),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface AddPaymentMethodDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	clientID: number;
	onSubmitSuccess?: () => void;
}

// Add a helper function above the component to get available years and months
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear + i);
const MONTHS = [
	{ value: '01', label: 'January (01)' },
	{ value: '02', label: 'February (02)' },
	{ value: '03', label: 'March (03)' },
	{ value: '04', label: 'April (04)' },
	{ value: '05', label: 'May (05)' },
	{ value: '06', label: 'June (06)' },
	{ value: '07', label: 'July (07)' },
	{ value: '08', label: 'August (08)' },
	{ value: '09', label: 'September (09)' },
	{ value: '10', label: 'October (10)' },
	{ value: '11', label: 'November (11)' },
	{ value: '12', label: 'December (12)' },
];

// After the imports section, add this utility function
const formatCardNumber = (value: string): string => {
	// Remove non-digit characters
	const digitsOnly = value.replace(/\D/g, '');

	// Add spaces for visual formatting (doesn't affect actual value)
	const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');

	return formatted;
};

export function AddPaymentMethodDialog({
	isOpen,
	onOpenChange,
	clientID,
	onSubmitSuccess,
}: AddPaymentMethodDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState<string>('');
	const [selectedYear, setSelectedYear] = useState<string>('');

	// Initialize the form
	const form = useForm<PaymentMethodFormValues>({
		resolver: zodResolver(paymentMethodSchema),
		mode: 'onChange', // Enable live validation as user types
		defaultValues: {
			billingDetails: {
				firstName: '',
				lastName: '',
				streetAddress: '',
				zipCode: '',
			},
			cardDetails: {
				cardNumber: '',
				cardCode: '',
				expirationDate: '',
			},
			note: '',
		},
	});

	// In the component, add function for card input formatting
	const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formatted = formatCardNumber(value);
		
		// Update the field with digits only (for validation)
		const digitsOnly = formatted.replace(/\s/g, '');
		form.setValue('cardDetails.cardNumber', digitsOnly, { 
			shouldValidate: true,  // Trigger validation immediately
			shouldDirty: true,     // Mark field as dirty
			shouldTouch: true      // Mark field as touched for validation styling
		});
	};

	// Handle zip code input with validation
	const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formatted = formatDigits(value);
		
		form.setValue('billingDetails.zipCode', formatted, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true
		});
	};

	// Update month selection with validation
	const handleMonthChange = (value: string) => {
		setSelectedMonth(value);
		
		if (selectedYear) {
			const formattedDate = `${selectedYear}-${value}`;
			form.setValue('cardDetails.expirationDate', formattedDate, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true
			});
		}
	};

	const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formatted = formatDigits(value);
		form.setValue('cardDetails.cardCode', formatted, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true
		});
	};
	// Update year selection with validation
	const handleYearChange = (value: string) => {
		setSelectedYear(value);
		
		if (selectedMonth) {
			const formattedDate = `${value}-${selectedMonth}`;
			form.setValue('cardDetails.expirationDate', formattedDate, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true
			});
		}
	};

	// In the component, add function to check if expiration date is valid
	const isExpirationDateValid = (): boolean => {
		if (!selectedMonth || !selectedYear) return false;

		const formattedDate = `${selectedYear}-${selectedMonth}`;
		const result = /^\d{4}-\d{2}$/.test(formattedDate);

		// Also check if date is in the future
		const now = new Date();
		const expiryDate = new Date(
			parseInt(selectedYear),
			parseInt(selectedMonth) - 1
		);

		return result && expiryDate > now;
	};

	// Handler for form submission
	const onSubmitPaymentMethod = async (data: PaymentMethodFormValues) => {
		try {
			// Additional validation check before submission
			const isValid = await form.trigger();
			if (!isValid) {
				errorToast(
					'Please fix the validation errors before submitting'
				);
				return;
			}

			setIsSubmitting(true);
			console.log("Add Payment Method Payload", data);

			// Prepare the payload for the API
			const payload: CreatePaymentProfilePayloadV2 = {
				billingDetails: data.billingDetails,
				cardDetails: {
					cardCode: data.cardDetails.cardCode,
					cardNumber: data.cardDetails.cardNumber,
					expirationDate: data.cardDetails.expirationDate,
				},
				clientID: clientID,
				note: data.note || "",
				entity: data.entity
			};

			// Call the API
			await createPaymentProfileV2(payload);

			// Standard success handling
			successToast('Payment method added successfully');
			onOpenChange(false);
			form.reset(); // Clear the form
			if (onSubmitSuccess) {
				onSubmitSuccess();
			}
		} catch (error) {
			console.error('Error adding payment method:', error);
			errorToast('An error occurred while adding the payment method');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-4xl bg-card'>
				<DialogHeader className='pb-2'>
					<DialogTitle className='text-xl flex items-center gap-2'>
						<CreditCard className='h-6 w-6 text-primary' />
						Add Payment Method
					</DialogTitle>
					<p className='text-muted-foreground text-sm'>
						Enter card information below to add a new payment method
						for this client
					</p>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmitPaymentMethod)}
						className='grid grid-cols-1 md:grid-cols-2 gap-6'
					>
						{/* Billing Details Column */}
						<div className='bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-lg'>
							<h3 className='text-md font-semibold flex items-center border-b pb-2'>
								<span className='inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center'>
									<div className='mt-0.5'>1</div>
								</span>
								Billing Information
							</h3>
							<div className='grid grid-cols-2 gap-3'>
								<FormField
									control={form.control}
									name='billingDetails.firstName'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-muted-foreground'>
												First Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder='John'
													{...field}
													className='bg-background'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='billingDetails.lastName'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-muted-foreground'>
												Last Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder='Doe'
													{...field}
													className='bg-background'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name='billingDetails.streetAddress'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-muted-foreground'>
											Street Address
										</FormLabel>
										<FormControl>
											<Input
												placeholder='123 Main St'
												{...field}
												className='bg-background'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='billingDetails.zipCode'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-muted-foreground'>
											Zip Code
										</FormLabel>
										<FormControl>
											<Input
												placeholder='12345'
												value={field.value}
												onChange={handleZipCodeChange}
												onBlur={() => form.trigger('billingDetails.zipCode')}
												maxLength={10}
												className={`bg-background ${
													form.formState.errors.billingDetails?.zipCode ? 'border-destructive' : ''
												}`}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Card Details Column */}
						<div className='bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-lg'>
							<h3 className='text-md font-semibold flex items-center border-b pb-2'>
								<span className='inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center'>
									<div className='mt-0.5'>2</div>
								</span>
								Card Details
							</h3>
							<FormField
								control={form.control}
								name='cardDetails.cardNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-muted-foreground'>
											Card Number
										</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													placeholder='4111 1111 1111 1111'
													value={formatCardNumber(field.value)}
													onChange={handleCardNumberChange}
													onBlur={() => form.trigger('cardDetails.cardNumber')}
													maxLength={19} // 16 digits + 3 spaces
													className={`bg-background pl-10 ${
														form.formState.errors.cardDetails?.cardNumber || 
														(form.formState.touchedFields.cardDetails?.cardNumber && !field.value)
															? 'border-destructive'
															: ''
													}`}
												/>
												<CreditCard className='h-4 w-4 absolute left-3 top-2.5 text-muted-foreground' />
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className='grid grid-cols-2 gap-3 mt-8'>
								<FormItem>
									<FormLabel className='text-muted-foreground'>
										Expiration Date
									</FormLabel>
									<div className='grid grid-cols-2'>
										<div className='mr-2'>
											<Select
												onValueChange={handleYearChange}
												value={selectedYear}
												onOpenChange={() => {
													if (!selectedYear) form.trigger('cardDetails.expirationDate');
												}}
											>
												<SelectTrigger
													className={`bg-background ${
														(form.formState.errors.cardDetails?.expirationDate ||
															(form.formState.isSubmitted && !selectedYear))
															? 'border-destructive'
															: ''
													}`}
												>
													<SelectValue placeholder='Year' />
												</SelectTrigger>
												<SelectContent>
													{YEARS.map((year) => (
														<SelectItem
															key={year}
															value={year.toString()}
														>
															{year}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className=''>
											<Select
												onValueChange={handleMonthChange}
												value={selectedMonth}
												onOpenChange={() => {
													if (!selectedMonth) form.trigger('cardDetails.expirationDate');
												}}
											>
												<SelectTrigger
													className={`bg-background ${
														(form.formState.errors.cardDetails?.expirationDate ||
															(form.formState.isSubmitted && !selectedMonth))
															? 'border-destructive'
															: ''
													}`}
												>
													<SelectValue placeholder='Month' />
												</SelectTrigger>
												<SelectContent>
													{MONTHS.map((month) => (
														<SelectItem
															key={month.value}
															value={month.value}
														>
															{month.value}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
									{!isExpirationDateValid() && 
										(form.formState.isSubmitted || 
											form.getFieldState('cardDetails.expirationDate').isTouched) && (
										<p className='text-sm font-medium text-destructive mt-2'>
											Please select a valid expiration date
										</p>
									)}
									<FormMessage />
								</FormItem>
								<FormField
									control={form.control}
									name='cardDetails.cardCode'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-muted-foreground'>
												Security Code (CVV)
											</FormLabel>
											<FormControl>
												<Input
													placeholder='123'
													{...field}
													value={field.value}
													onChange={handleCVVChange}
													onBlur={() => form.trigger('cardDetails.cardCode')}
													maxLength={4}
													className={`bg-background ${
														form.formState.errors.cardDetails?.cardCode ? 'border-destructive' : ''
													}`}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Note Field - Full Width */}
						<div className='col-span-1 md:col-span-2 bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-lg'>
							<h3 className='text-md font-semibold flex items-center border-b pb-2'>
								<span className='inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center '>
									<div className='mt-0.5'>3</div>
								</span>
								Additional Information
							</h3>
							<FormField
								control={form.control}
								name='note'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-muted-foreground'>
											Payment Method Note (Optional)
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Add any additional information about this payment method'
												className='resize-none bg-background'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Footer - Full Width */}
						<div className='col-span-1 md:col-span-2 flex justify-end gap-2 '>
							<Button
								variant='error'
								type='button'
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								variant='action'
								type='submit'
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<span className='animate-pulse mr-2'>
											•••
										</span>
										Processing
									</>
								) : (
									<>Submit Profile</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
