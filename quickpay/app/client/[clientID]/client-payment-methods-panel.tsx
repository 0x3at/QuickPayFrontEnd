'use client';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Star,
	MailIcon,
	UserIcon,
	CircleUserRoundIcon,
	Building,
	CreditCard,
	AlertCircle,
} from 'lucide-react';
import { getClient, setDefaultPaymentMethod } from '@/hooks/api-hooks';
import { ClientDetails, PaymentProfile, entityNames } from '@/lib/types';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { errorToast, successToast } from '@/lib/utils';

export function ClientPaymentMethodsPanel({ clientID }: { clientID: number }) {
	const [clientDetails, setClientDetails] = useState<ClientDetails | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [uniqueCards, setUniqueCards] = useState<{
		[key: string]: {
			card: PaymentProfile;
			entities: string[];
			isDefault: boolean;
		};
	}>({});

	// Default payment confirmation dialog state
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
		card: PaymentProfile;
		entities: string[];
	} | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchClientData();
	}, [clientID]);

	async function fetchClientData() {
		try {
			setIsLoading(true);
			setError(null);
			const data: ClientDetails = await getClient(clientID);
			setClientDetails(data);

			// Group cards by their unique fingerprint
			const cardGroups: {
				[key: string]: {
					card: PaymentProfile;
					entities: string[];
					isDefault: boolean;
				};
			} = {};

			data.paymentProfiles.forEach((profile) => {
				// Create a unique key using last four digits and billing details
				const cardKey = `${profile.lastFour}-${profile.billingDetails.firstName}-${profile.billingDetails.lastName}`;

				if (!cardGroups[cardKey]) {
					cardGroups[cardKey] = {
						card: profile,
						entities: [profile.entity],
						isDefault: profile.isDefault === 'True',
					};
				} else {
					// Add entity to existing card if not already included
					if (
						!cardGroups[cardKey].entities.includes(profile.entity)
					) {
						cardGroups[cardKey].entities.push(profile.entity);
					}
					// Update default status if any profile is default
					if (profile.isDefault === 'True') {
						cardGroups[cardKey].isDefault = true;
					}
				}
			});

			setUniqueCards(cardGroups);
		} catch (err) {
			console.error('Failed to fetch client:', err);
			setError('Could not load Payment Methods');
		} finally {
			setIsLoading(false);
		}
	}

	const handleSetDefaultClick = (cardGroup: {
		card: PaymentProfile;
		entities: string[];
		isDefault: boolean;
	}) => {
		setSelectedPaymentMethod({
			card: cardGroup.card,
			entities: cardGroup.entities,
		});
		setIsConfirmDialogOpen(true);
	};

	const handleConfirmSetDefault = async () => {
		if (!selectedPaymentMethod) return;

		try {
			setIsSubmitting(true);
			const response = await setDefaultPaymentMethod(
				clientID,
				selectedPaymentMethod.card.paymentProfileID
			);

			if (response) {
				successToast('Default payment method updated successfully');

				// Update local state to reflect changes
				// This updates the UI without needing a full refresh
				setUniqueCards((prevCards) => {
					const newCards = { ...prevCards };
					// Set all cards to non-default
					Object.keys(newCards).forEach((key) => {
						newCards[key].isDefault = false;
					});

					// Find the card we just set as default and update it
					const selectedCardKey = Object.keys(newCards).find(
						(key) =>
							newCards[key].card.paymentProfileID ===
							selectedPaymentMethod.card.paymentProfileID
					);

					if (selectedCardKey) {
						newCards[selectedCardKey].isDefault = true;
					}

					return newCards;
				});

				// Close the dialog
				setIsConfirmDialogOpen(false);
			} else {
				errorToast('Failed to update default payment method');
			}
		} catch (error) {
			console.error('Error setting default payment method:', error);
			errorToast(
				'An error occurred while updating default payment method'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='flex flex-row gap-4'>
				<Card className='w-1/2 my-6 mx-auto'>
					<CardHeader>
						<CardTitle>Loading client information...</CardTitle>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className='flex flex-row gap-4'>
				<Card className='w-1/2 my-6 mx-auto'>
					<CardHeader>
						<CardTitle>Error</CardTitle>
						<CardDescription>
							{error || 'Failed to load client data'}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	console.log(clientDetails);
	// Data loaded successfully
	return (
		<>
			<div className='flex flex-row gap-4 w-full'>
				<Card className='w-full'>
					<CardHeader>
						<div className='flex flex-row justify-between items-center'>
							<CardTitle>Payment Profiles</CardTitle>
							<Button variant='action' size='sm'>
								Add Payment Profile
							</Button>
						</div>
						<CardDescription>
							Manage client payment methods
						</CardDescription>
						<Separator className='my-4' />
					</CardHeader>
					<CardContent className='w-full'>
						{Object.keys(uniqueCards).length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{Object.values(uniqueCards).map(
									(cardGroup, index) => {
										const profile = cardGroup.card;
										return (
											<Card
												key={index}
												className='border'
											>
												<CardHeader className='pb-2'>
													<div className='flex justify-between items-center'>
														<div className='flex flex-col'>
															<div className='flex items-center gap-2 mb-1'>
																<CreditCard className='w-5 h-5 text-primary' />
																<CardTitle className='text-lg'>
																	{profile.cardType ||
																		'Card'}{' '}
																	••••{' '}
																	{
																		profile.lastFour
																	}
																</CardTitle>
															</div>
															<span className='text-xs text-muted-foreground'>
																Expires:{' '}
																{
																	profile.expirationDate
																}
															</span>
														</div>
														<div className='flex flex-col items-end gap-1'>
															<div className='flex-row gap-2 grid grid-cols-2 justify-end'>
																<div className='flex flex-row gap-2 justify-end'>
																{cardGroup.isDefault && (
																	<Badge variant='default' className='bg-amber-400 text-secondary-foreground'>
																		Default
																	</Badge>
																)}
																</div>
																<div className='flex flex-row gap-2'>
																	<Badge
																		variant='default'
																		className={`${
																			profile.status ===
																			'Active'
																				? 'bg-success'
																				: 'bg-destructive'
																		} text-secondary-foreground`}
																	>
																		{profile.gateway ===
																		'authnet'
																			? 'Authorize.net'
																			: profile.gateway}
																	</Badge>
																</div>
															</div>
														</div>
													</div>
													<Separator className='my-1' />
												</CardHeader>

												<CardContent className='py-0 space-y-4'>
													{/* Billing Information */}
													<div>
														<Label className='text-sm font-medium text-muted-foreground block mb-2'>
															BILLING DETAILS
														</Label>
														<div className='pl-2 text-sm'>
															<div className='font-medium'>
																{
																	profile
																		.billingDetails
																		.firstName
																}{' '}
																{
																	profile
																		.billingDetails
																		.lastName
																}
															</div>
															<div className='flex flex-row gap-2'>
																<div className='text-muted-foreground'>
																	{
																		profile
																			.billingDetails
																			.streetAddress
																	}
																	{','}
																	{
																		profile
																			.billingDetails
																			.zipCode
																	}
																</div>
															</div>
															{profile.note && (
																<div className='text-muted-foreground mt-1'>
																	{
																		profile.note
																	}
																</div>
															)}
														</div>
													</div>

													{/* Entities */}
													<div>
														<Label className='text-sm font-medium text-muted-foreground block mb-2'>
															CONNECTED ENTITIES
														</Label>
														<div className='flex flex-wrap gap-1 pl-2'>
															{Object.keys(
																entityNames
															).map((entity) => (
																<Badge
																	key={entity}
																	className={`${
																		cardGroup.entities.includes(
																			entity
																		)
																			? 'bg-completed'
																			: 'bg-destructive opacity-50'
																	}`}
																>
																	{
																		entityNames[
																			entity as keyof typeof entityNames
																		]
																	}
																</Badge>
															))}
														</div>
													</div>

													{/* Creation Info */}
												</CardContent>

												<CardFooter className='flex justify-between space-x-2 pt-4 border-t grid-cols-2 gap-2'>
													<div className='justify-start col-span-1'>
														<Label className='text-sm font-medium text-muted-foreground block mb-2'>
															Metadata
														</Label>
														<div className='pl-2 text-xs text-muted-foreground'>
															Created on{' '}
															{new Date(
																profile.createdAt
															).toLocaleDateString()}{' '}
															by{' '}
															{profile.createdBy ||
																'System'}
														</div>
													</div>
													<div className='justify-end col-span-1'>
														{!cardGroup.isDefault && (
															<Button
																variant='action'
																size='sm'
																onClick={() =>
																	handleSetDefaultClick(
																		cardGroup
																	)
																}
															>
																Set Default
															</Button>
														)}
														<Button
															size='sm'
															variant='destructive'
															className='ml-2'
														>
															Delete
														</Button>
													</div>
												</CardFooter>
											</Card>
										);
									}
								)}
							</div>
						) : (
							<div className='w-fulltext-center py-6 text-muted-foreground'>
								No payment profiles found
							</div>
						)}
					</CardContent>
					<CardFooter></CardFooter>
				</Card>
			</div>

			{/* Confirmation Dialog */}
			<Dialog
				open={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
			>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<AlertCircle className='h-5 w-5 text-warning' />
							Confirm Default Payment Method
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to set this payment method as
							the default? This will replace any prior default
							payment method.
						</DialogDescription>
					</DialogHeader>

					{selectedPaymentMethod && (
						<div className='py-4'>
							<div className='grid grid-cols-3 items-center gap-2 mb-4'>
								<div className='col-span-2 flex items-center gap-2'>
									<CreditCard className='h-5 w-5' />
									<span className='font-semibold'>
										{selectedPaymentMethod.card.cardType ||
											'Card'}{' '}
										••••{' '}
										{selectedPaymentMethod.card.lastFour}
									</span>
								</div>
								<div className='col-span-1 flex justify-end'>
									<Badge
										variant='default'
										className={`${
											selectedPaymentMethod.card
												.status === 'Active'
												? 'bg-success'
												: 'bg-destructive'
										} text-secondary-foreground`}
									>
										{selectedPaymentMethod.card.gateway ===
										'authnet'
											? 'Authorize.net'
											: selectedPaymentMethod.card
													.gateway}
									</Badge>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-2 text-sm mb-3'>
								<div>
									<Label className='text-md font-medium'>
										Name
									</Label>{' '}
									<Separator className='my-1' />
									{
										selectedPaymentMethod.card
											.billingDetails.firstName
									}{' '}
									{
										selectedPaymentMethod.card
											.billingDetails.lastName
									}
								</div>
								<div>
									<Label className='text-md font-medium'>
										Expires
									</Label>{' '}
									<Separator className='my-1' />
									{selectedPaymentMethod.card.expirationDate}
								</div>
							</div>

							<div className='mt-4'>
								<Label className='text-md font-medium'>
									Entities
								</Label>
								<Separator className='my-1' />
								<div className='flex flex-wrap gap-1 mt-2'>
									{selectedPaymentMethod.entities.map(
										(entity) => (
											<Badge
												key={entity}
												className='bg-completed'
											>
												{entityNames[
													entity as keyof typeof entityNames
												] || entity}
											</Badge>
										)
									)}
								</div>
							</div>
						</div>
					)}

					<DialogFooter className='sm:justify-between'>
						<Button
							variant='outline'
							onClick={() => setIsConfirmDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant='action'
							onClick={handleConfirmSetDefault}
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Processing...' : 'Confirm'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
