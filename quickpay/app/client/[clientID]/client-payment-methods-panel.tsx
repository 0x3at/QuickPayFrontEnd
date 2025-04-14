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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, AlertCircle, Plus, Trash2, Edit, Star } from 'lucide-react';
import { setDefaultPaymentMethodV2, deletePaymentMethodV2 } from '@/hooks/apiv2-hooks';
import { ClientDetailResponseV2, PaymentProfileV2 } from '@/lib/typesV2';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { errorToast, successToast } from '@/lib/utils';
import { CardTypeIcon } from '@/components/card-type-icon';
import { EntityIcon } from '@/components/entity-icon';
import { EntityBadge } from '@/components/entity-badge';
import { StatusBadge } from '@/components/status-badge';
import { AddPaymentMethodDialog } from '@/components/add-payment-method-dialog';
import { DeletePaymentMethodDialog } from '@/components/delete-payment-method-dialog';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface ClientPaymentMethodsPanelProps {
	clientID: number;
	clientDetails: ClientDetailResponseV2;
	onRefresh: () => void;
}

export function ClientPaymentMethodsPanel({ clientID, clientDetails, onRefresh }: ClientPaymentMethodsPanelProps) {
	const [uniqueCards, setUniqueCards] = useState<{
		[key: string]: {
			card: PaymentProfileV2;
			entities: string[];
			isDefault: boolean;
		};
	}>({});

	// Default payment confirmation dialog state
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
		card: PaymentProfileV2;
		entities: string[];
	} | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Add state for note dialog
	const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);

	// Add state for add payment method dialog
	const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

	// Add state for delete payment method dialog
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedPaymentMethodForDelete, setSelectedPaymentMethodForDelete] = useState<PaymentProfileV2 | null>(null);

	// Format date helper function
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Process payment profiles whenever client details change
	useEffect(() => {
		processPaymentProfiles();
	}, [clientDetails]);

	function processPaymentProfiles() {
		// Group cards by their unique fingerprint
		const cardGroups: {
			[key: string]: {
				card: PaymentProfileV2;
				entities: string[];
				isDefault: boolean;
			};
		} = {};

		clientDetails.paymentProfiles.forEach((profile) => {
			// Create a unique key using last four digits and billing details
			const cardKey = `${profile.lastFour}-${profile.billingDetails.firstName}-${profile.billingDetails.lastName}`;

			if (!cardGroups[cardKey]) {
				cardGroups[cardKey] = {
					card: profile,
					entities: [profile.entity],
					isDefault: String(profile.isDefault) === "true" || profile.isDefault === true,
				};
			} else {
				// Add entity to existing card if not already included
				if (!cardGroups[cardKey].entities.includes(profile.entity)) {
					cardGroups[cardKey].entities.push(profile.entity);
				}
				// Update default status if any profile is default
				if (String(profile.isDefault) === "true" || profile.isDefault === true) {
					cardGroups[cardKey].isDefault = true;
				}
			}
		});

		setUniqueCards(cardGroups);
	}

	const handleSetDefaultClick = (cardGroup: {
		card: PaymentProfileV2;
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
			await setDefaultPaymentMethodV2({
				clientID,
				paymentProfileID: selectedPaymentMethod.card.paymentProfileID
			});

			// Close the dialog
			setIsConfirmDialogOpen(false);
			
			// Refresh the client data after updating
			onRefresh();
			
		} catch (error) {
			console.error('Error setting default payment method:', error);
			errorToast('An error occurred while updating default payment method');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Add handler for note click
	const handleNoteClick = (note: string) => {
		setSelectedNote(note);
		setIsNoteDialogOpen(true);
	};

	// Add handler for delete button click
	const handleDeleteClick = (profile: PaymentProfileV2) => {
		setSelectedPaymentMethodForDelete(profile);
		setIsDeleteDialogOpen(true);
	};

	// Handle successful deletion
	const handleDeleteSuccess = () => {
		onRefresh();
	};

	// Get unique entity codes from entity mappings
	const entityCodes = clientDetails.entityMappings.map(mapping => mapping.entityCode);
	
	// Data loaded successfully
	return (
		<>
			<TooltipProvider>
				<Card>
					<CardHeader className='pb-3'>
						<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
							<CardTitle className='text-lg flex items-center'>
								<CreditCard className='w-5 h-5 mr-2 text-primary' />
								Payment Profiles
							</CardTitle>

							<Button 
								variant='action'
								onClick={() => setIsAddPaymentDialogOpen(true)}
							>
								<Plus className='h-4 w-4 mr-2' />
								Add Payment Method
							</Button>
						</div>
					</CardHeader>
					
					<CardContent>
						{Object.keys(uniqueCards).length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{Object.values(uniqueCards).map(
									(cardGroup, index) => {
										const profile = cardGroup.card;
										return (
											<Card
												key={index}
												className='overflow-hidden'
											>
											
												<CardHeader>
												
													<div className='flex justify-between items-center w-full'>
														<div className='flex items-center gap-2'>
															<CardTypeIcon
																type={
																	profile.cardType ||
																	'Unknown'
																}
															/>
																	<span className='font-medium cursor-help'>
																		••••{' '}
																		{profile.lastFour}
																	</span>
	
														</div>
														<div className='flex justify-between items-center w-2/3'>
															{/* Default indicator/button - LEFT */}
															<div>
																{cardGroup.isDefault && (
																	<span className="text-xs font-medium text-primary flex items-center">
																		<Star className='h-3.5 w-3.5 mr-1 fill-primary' />
																		Default
																	</span>
																)}
															</div>
															{/* Status badge - RIGHT */}
															<div>
																<StatusBadge
																	status={
																		profile.status === 'Active'
																			? 'success'
																			: 'error'
																	}
																>
																	{profile.status}
																</StatusBadge>
															</div>
														</div>
													</div>
												</CardHeader>
													
												<CardContent className='pt-3'>
													<div className='space-y-3 text-sm'>
														<div className='flex justify-between'>
															<span className='text-muted-foreground'>
																Entities:
															</span>
															<div className='flex flex-wrap justify-end gap-1 max-w-[70%]'>
																{entityCodes.map((entity) => {
																	// Find the specific payment profile for this entity if it exists
																	const entityProfile = clientDetails.paymentProfiles.find(p => 
																		p.entity === entity && 
																		p.lastFour === profile.lastFour && 
																		p.billingDetails.firstName === profile.billingDetails.firstName &&
																		p.billingDetails.lastName === profile.billingDetails.lastName
																	);
																	
																	return (
																		<Tooltip key={`tooltip-${entity}`}>
																			<TooltipTrigger asChild>
																				<div>
																					<EntityBadge
																						key={`badge-${entity}`}
																						entity={entity}
																						active={cardGroup.entities.includes(entity)}
																						className='text-xs'
																					/>
																				</div>
																			</TooltipTrigger>
																			<TooltipContent 
																				className={`text-xs ${
																					cardGroup.entities.includes(entity)
																						? 'bg-success text-foreground-secondary'
																						: 'bg-destructive/90 text-destructive-foreground'
																				}`}
																			>
																				{cardGroup.entities.includes(entity) 
																					? `ID: ${entityProfile?.paymentProfileID || 'Unknown'}`
																					: `Not connected to ${entity}`}
																			</TooltipContent>
																		</Tooltip>
																	);
																})}
															</div>
														</div>

														<div className='flex justify-between'>
															<span className='text-muted-foreground'>
																Name:
															</span>
															<span className='font-medium'>
																{profile.billingDetails.firstName}{' '}
																{profile.billingDetails.lastName}
															</span>
														</div>

														<div className='flex justify-between'>
															<span className='text-muted-foreground'>
																Address:
															</span>
															<span className='font-medium text-right'>
																{profile.billingDetails.streetAddress},
																{' '}{profile.billingDetails.zipCode}
															</span>
														</div>

														<div className='flex justify-between'>
															<span className='text-muted-foreground'>
																Expires:
															</span>
															<span className='font-medium'>
																{profile.expirationDate}
															</span>
														</div>

														<div className='flex justify-between'>
															<span className='text-muted-foreground'>
																Created:
															</span>
															<span>
																{formatDate(profile.createdAt)}
															</span>
														</div>

														{profile.note && (
															<div className='pt-2 border-t'>
																<p 
																	className='text-xs text-muted-foreground italic truncate cursor-pointer hover:text-primary transition-colors'
																	onClick={() => handleNoteClick(profile.note)}
																	title="Click to view full note"
																>
																	{profile.note}
																</p>
															</div>
														)}
													</div>
												</CardContent>
												<CardFooter className='flex justify-between items-center px-4 py-2'>
													{/* Set Default button - LEFT */}
													<div>
														{!cardGroup.isDefault && (
															<Button
																variant='ghost'
																size='icon'
																onClick={() => handleSetDefaultClick(cardGroup)}
																title="Set as Default Payment Method"
																className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7"
															>
																<Star className='h-3.5 w-3.5' />
															</Button>
														)}
													</div>
													
													{/* Delete button - RIGHT */}
													<div>
														<Button
															variant='ghost'
															size='icon'
															className='text-destructive hover:text-destructive hover:bg-destructive/10'
															title="Delete Payment Method"
															onClick={() => handleDeleteClick(profile)}
														>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</CardFooter>
											</Card>
										);
									}
								)}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-12 text-center'>
								<CreditCard className='h-12 w-12 text-muted-foreground mb-4' />
								<h3 className='text-lg font-medium mb-2'>
									No Payment Profiles Found
								</h3>
								<p className='text-muted-foreground mb-6 max-w-md'>
									This client doesn't have any payment profiles
									yet. Add one to get started.
								</p>
								<Button onClick={() => setIsAddPaymentDialogOpen(true)}>
									<Plus className='h-4 w-4 mr-2' />
									Add Payment Profile
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

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
										<CardTypeIcon
											type={
												selectedPaymentMethod.card
													.cardType || 'Unknown'
											}
										/>
										<span className='font-semibold'>
											{selectedPaymentMethod.card.cardType ||
												'Card'}{' '}
											••••{' '}
											{selectedPaymentMethod.card.lastFour}
										</span>
									</div>
									<div className='col-span-1 flex justify-end'>
										<Badge
											variant={
												selectedPaymentMethod.card
													.status === 'Active'
													? 'success'
													: 'error'
											}
										>
											{selectedPaymentMethod.card.status}
										</Badge>
									</div>
								</div>
								<div className='grid grid-cols-2 gap-2 text-sm mb-3'>
									<div>
										<Label className='text-md font-medium'>
											Name
										</Label>{' '}
										<Separator className='my-1' />
										{selectedPaymentMethod.card.billingDetails.firstName}{' '}
										{selectedPaymentMethod.card.billingDetails.lastName}
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
										{entityCodes.map((entity) => (
											<EntityBadge
												key={entity}
												entity={entity}
												active={selectedPaymentMethod.entities.includes(entity)}
											/>
										))}
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
								variant='default'
								onClick={handleConfirmSetDefault}
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Processing...' : 'Confirm'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Note Dialog */}
				<Dialog
					open={isNoteDialogOpen}
					onOpenChange={setIsNoteDialogOpen}
				>
					<DialogContent className='sm:max-w-md'>
						<DialogHeader>
							<DialogTitle>Payment Method Note</DialogTitle>
						</DialogHeader>
						<div className='py-4'>
							<p className='text-sm whitespace-pre-wrap'>{selectedNote}</p>
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setIsNoteDialogOpen(false)}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Add Payment Method Dialog */}
				<AddPaymentMethodDialog
					isOpen={isAddPaymentDialogOpen}
					onOpenChange={setIsAddPaymentDialogOpen}
					clientID={clientID}
					onSubmitSuccess={onRefresh}
				/>

				{/* Delete Payment Method Dialog */}
				{selectedPaymentMethodForDelete && (
					<DeletePaymentMethodDialog
						isOpen={isDeleteDialogOpen}
						onOpenChange={setIsDeleteDialogOpen}
						clientID={clientID}
						paymentProfile={selectedPaymentMethodForDelete as any}
						onDeleteSuccess={handleDeleteSuccess}
					/>
				)}
			</TooltipProvider>
		</>
	);
}
