'use client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	MailIcon,
	UserIcon,
	CircleUserRoundIcon,
	ClipboardIcon,
	CreditCardIcon,
	ShoppingBagIcon,
	MegaphoneIcon,
	ScrollTextIcon,
	RefreshCw,
	LinkIcon,
	PhoneIcon,
} from 'lucide-react';
import { Client, getClient } from '@/hooks/api-hooks';
import { EditClientDialog } from '@/components/edit-client-popup';
import { ClientDetails, entityNames } from '@/lib/types';
import { toast } from "sonner";
import { successToast } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema for connecting Quickbooks account
const connectFormSchema = z.object({
	entity: z.string({
		required_error: "Please select an entity",
	}),
	quickbooksAccount: z.string({
		required_error: "Please select a Quickbooks account",
	}),
});

export function ClientDetailsPanel({ clientID }: { clientID: number }) {
	const [clientDetails, setClientDetails] = useState<ClientDetails | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	
	// Reset confirmation dialog states
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const [resetEntityType, setResetEntityType] = useState<string | null>(null);
	const [resetProfileId, setResetProfileId] = useState<string | null>(null);
	
	// Quickbooks connect dialog states
	const [connectDialogOpen, setConnectDialogOpen] = useState(false);
	
	// Mock Quickbooks accounts (to be replaced with real data later)
	const mockQuickbooksAccounts = [
		{ id: "qb1", name: "Main Accounting" },
		{ id: "qb2", name: "Business Account" },
	];
	
	// Setup form for connecting Quickbooks
	const connectForm = useForm<z.infer<typeof connectFormSchema>>({
		resolver: zodResolver(connectFormSchema),
	});

	useEffect(() => {
		async function fetchClientData() {
			try {
				setIsLoading(true);
				setError(null);
				const data: ClientDetails = await getClient(clientID);
				setClientDetails(data);
			} catch (err) {
				console.error('Failed to fetch client:', err);
				setError('Could not load client details');
			} finally {
				setIsLoading(false);
			}
		}

		fetchClientData();
	}, [clientID]);
	
	const handleResetProfile = (entityType: string, profileId: string) => {
		setResetEntityType(entityType);
		setResetProfileId(profileId);
		setResetDialogOpen(true);
	};
	
	const confirmResetProfile = async () => {
		try {
			// Here you would call your API to reset the profile
			// await resetCustomerProfile(clientID, resetEntityType, resetProfileId);
			
			// For now, just mock the API call with a toast
			console.log(`Resetting ${resetEntityType} profile ${resetProfileId}`);
			successToast(`Successfully reset ${resetEntityType} customer profile`);
			
			// Refresh client data
			const data: ClientDetails = await getClient(clientID);
			setClientDetails(data);
		} catch (err) {
			console.error('Failed to reset:', err);
			toast.error(`Failed to reset ${resetEntityType} customer profile`);
		} finally {
			// Close dialog and reset state
			setResetDialogOpen(false);
			setResetEntityType(null);
			setResetProfileId(null);
		}
	};
	
	const onConnectQuickbooks = async (values: z.infer<typeof connectFormSchema>) => {
		try {
			// Here you would call your API to connect the Quickbooks account
			// await connectQuickbooksAccount(clientID, values.entity, values.quickbooksAccount);
			
			// For now, just mock the API call with a toast
			console.log(`Connecting ${values.entity} to Quickbooks account ${values.quickbooksAccount}`);
			successToast(`Successfully connected ${entityNames[values.entity as keyof typeof entityNames]} to Quickbooks`);
			
			// Refresh client data
			const data: ClientDetails = await getClient(clientID);
			setClientDetails(data);
		} catch (err) {
			console.error('Failed to connect to Quickbooks:', err);
			toast.error(`Failed to connect to Quickbooks`);
		} finally {
			// Close dialog and reset form
			setConnectDialogOpen(false);
			connectForm.reset();
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

	// Data loaded successfully
	return (
		<div className='w-full'>
			<Card className='w-full mb-4 border-accent bg-card'>
				<CardHeader className="pb-3">
					<div className='flex flex-row justify-between items-center'>
						<CardTitle>
							<h1 className='text-2xl font-bold'>
								{clientDetails?.client.companyName || 'Client'} Details
							</h1>
						</CardTitle>
						<Button variant='default' size='default' onClick={() => setOpen(true)}>
							Edit Client
						</Button>
					</div>
				</CardHeader>
				
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Contact Information Card */}
						<Card className="shadow-2xl">
							<CardHeader className="">
								<CardTitle className="flex items-center text-lg">
									<CircleUserRoundIcon className="mr-2 h-5 w-5" />
									Contact Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="primary-contact" className="text-muted-foreground text-sm">Primary Contact</Label>
									<div id="primary-contact" className="font-medium">{clientDetails?.client.primaryContact}</div>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="email" className="text-muted-foreground text-sm">Email Address</Label>
									<div id="email" className="font-medium flex items-center">
										<MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
										{clientDetails?.client.email}
									</div>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="sales-person" className="text-muted-foreground text-sm">Sales Representative</Label>
									<div id="sales-person" className="font-medium flex items-center">
										<UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
										{clientDetails?.client.salesPerson}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Payment Gateway Card */}
						<Card className="shadow-2xl overflow-hidden">
							<CardHeader className="">
								<CardTitle className="flex items-center text-lg">
									<CreditCardIcon className="mr-2 h-5 w-5" />
									Payment Gateway IDs
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{clientDetails?.client.wcCustomerProfileID ? (
									<div className="space-y-2">
										<Label htmlFor="wc-id" className="text-muted-foreground text-sm">Wholesale Communications</Label>
										<div id="wc-id" className="flex items-center justify-between">
											<div className="font-medium flex items-center">
												<PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
												<Badge variant="outline" className="px-2 py-1">
													{clientDetails.client.wcCustomerProfileID}
												</Badge>
											</div>
											<Button 
												variant="destructive" 
												size="sm" 
												className="ml-auto"
												onClick={() => handleResetProfile('Wholesale Communications', clientDetails.client.wcCustomerProfileID)}
											>
												<RefreshCw className="h-3.5 w-3.5 mr-1" />
												Reset
											</Button>
										</div>
									</div>
								) : null}
								
								{clientDetails?.client.cgCustomerProfileID ? (
									<div className="space-y-2">
										<Label htmlFor="cg-id" className="text-muted-foreground text-sm">Contract Genie</Label>
										<div id="cg-id" className="flex items-center justify-between">
											<div className="font-medium flex items-center">
												<ScrollTextIcon className="h-4 w-4 mr-2 text-muted-foreground" />
												<Badge variant="outline" className="px-2 py-1">
													{clientDetails.client.cgCustomerProfileID}
												</Badge>
											</div>
											<Button 
												variant="destructive" 
												size="sm"
												className="ml-auto"
												onClick={() => handleResetProfile('Contract Genie', clientDetails.client.cgCustomerProfileID)}
											>
												<RefreshCw className="h-3.5 w-3.5 mr-1" />
												Reset
											</Button>
										</div>
									</div>
								) : null}
								
								{clientDetails?.client.vbcCustomerProfileID ? (
									<div className="space-y-2">
										<Label htmlFor="vbc-id" className="text-muted-foreground text-sm">Voice Broadcasting</Label>
										<div id="vbc-id" className="flex items-center justify-between">
											<div className="font-medium flex items-center">
												<MegaphoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
												<Badge variant="outline" className="px-2 py-1">
													{clientDetails.client.vbcCustomerProfileID}
												</Badge>
											</div>
											<Button 
												variant="destructive" 
												size="sm"
												className="ml-auto"
												onClick={() => handleResetProfile('Voice Broadcasting', clientDetails.client.vbcCustomerProfileID)}
											>
												<RefreshCw className="h-3.5 w-3.5 mr-1" />
												Reset
											</Button>
										</div>
									</div>
								) : null}
								
								{!clientDetails?.client.wcCustomerProfileID && 
								 !clientDetails?.client.cgCustomerProfileID && 
								 !clientDetails?.client.vbcCustomerProfileID && (
									<div className="text-center py-4 text-muted-foreground">
										No payment gateway profiles found
									</div>
								)}
							</CardContent>
						</Card>

						{/* Quickbooks Card */}
						<Card className="shadow-2xl overflow-hidden">
							<CardHeader className="">
								<CardTitle className="flex items-center text-lg">
									<ClipboardIcon className="mr-2 h-5 w-5" />
									Quickbooks Status
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{clientDetails?.quickbooks && Object.keys(clientDetails.quickbooks).length > 0 ? (
									Object.entries(clientDetails.quickbooks).map(([entity, connected]) => {
										const entityName = entityNames[entity as keyof typeof entityNames] || entity;
										return (
											<div key={entity} className="space-y-2">
												<Label htmlFor={`qb-${entity}`} className="text-muted-foreground text-sm">{entityName}</Label>
												<div id={`qb-${entity}`} className="flex items-center justify-between">
													<div className="font-medium flex items-center">
														{entity === 'wc' ? (
															<PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
														) : entity === 'cg' ? (
															<ScrollTextIcon className="h-4 w-4 mr-2 text-muted-foreground" />
														) : entity === 'vbc' ? (
															<MegaphoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
														) : (
															<ClipboardIcon className="h-4 w-4 mr-2 text-muted-foreground" />
														)}
														{connected ? (
															<Badge variant="outline" className="bg-success/10 text-success border-success px-2 py-1">Connected</Badge>
														) : (
															<Badge variant="outline" className="bg-error/10 text-error border-error px-2 py-1">Not Connected</Badge>
														)}
													</div>
													{connected ? null : (
														<Button
															variant="action"
															size="sm"
															className="ml-auto"
															onClick={() => {
																connectForm.setValue('entity', entity);
																setConnectDialogOpen(true);
															}}
														>
															<LinkIcon className="h-3.5 w-3.5 mr-1" />
															Connect
														</Button>
													)}
												</div>
											</div>
										);
									})
								) : (
									<div className="text-center py-4 text-muted-foreground">
										No Quickbooks integration set up
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>
			<EditClientDialog open={open} onOpenChange={setOpen} client={clientDetails?.client as Client} />
			
			{/* Reset Confirmation Dialog */}
			<AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reset Customer Profile</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to reset the {resetEntityType} customer profile?
							This will remove the profile ID ({resetProfileId}) from the gateway and may affect payment processing.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmResetProfile} className="bg-error text-error-foreground hover:bg-error/90">
							Reset
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			
			{/* Quickbooks Connect Dialog */}
			<Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Connect to Quickbooks</DialogTitle>
						<DialogDescription>
							Link a Quickbooks account to this client for automated accounting.
						</DialogDescription>
					</DialogHeader>
					
					<Form {...connectForm}>
						<form onSubmit={connectForm.handleSubmit(onConnectQuickbooks)} className="space-y-4">
							<FormField
								control={connectForm.control}
								name="entity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Entity</FormLabel>
										<Select 
											onValueChange={field.onChange} 
											defaultValue={field.value}
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
								control={connectForm.control}
								name="quickbooksAccount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quickbooks Account</FormLabel>
										<Select 
											onValueChange={field.onChange} 
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select Quickbooks account" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{mockQuickbooksAccounts.map((account) => (
													<SelectItem key={account.id} value={account.id}>
														{account.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							
							<DialogFooter>
								<Button variant="outline" onClick={() => setConnectDialogOpen(false)}>Cancel</Button>
								<Button type="submit" variant="action">Connect</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
