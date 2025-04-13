'use client';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Star,
	MailIcon,
	UserIcon,
	CircleUserRoundIcon,
	Building,
	Calendar,
	CheckCircle2,
	XCircle,
	Clock,
	PhoneIcon,
	ScrollTextIcon,
	MegaphoneIcon,
	Plus,
	FileText,
	CreditCard,
} from 'lucide-react';
import { getClient } from '@/hooks/api-hooks';
import { ClientDetails, entityNames } from '@/lib/types';

export function ClientInfoCard({ clientID }: { clientID: number }) {
	const [clientDetails, setClientDetails] = useState<ClientDetails | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	// Loading state
	if (isLoading) {
		return (
			<Card className="shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 animate-spin text-muted-foreground" />
						Loading Client Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-48 w-full animate-pulse bg-muted rounded-md"></div>
				</CardContent>
			</Card>
		);
	}

	// Error state
	if (error) {
		return (
			<Card className="border-error">
				<CardHeader className="pb-2">
					<CardTitle className="text-error flex items-center gap-2">
						<XCircle className="h-5 w-5" />
						Error Loading Client
					</CardTitle>
					<CardDescription>
						{error || 'Failed to load client data'}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	// Sort notes by importance and then by date
	const sortedNotes = [...(clientDetails?.notes || [])].sort((a, b) => {
		// First sort by importance
		if (a.important === '1' && b.important !== '1') return -1;
		if (a.important !== '1' && b.important === '1') return 1;
		
		// Then by date (newest first)
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	// Data loaded successfully
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
			{/* Primary Info Card */}
			<Card className="shadow-sm">
				<CardHeader className="pb-2 border-b">
					<div className="flex items-center grid-cols-2 gap-2">
						<div className="flex items-center gap-2 col-start-1 col-span-1 w-full">
							<CardTitle className="text-xl font-bold">
								{clientDetails?.client.companyName}
							</CardTitle>
						</div>
						<div className="flex items-center gap-2 flex-wrap justify-end col-start-2 col-span-1">
						{clientDetails?.client.clientStatus === 'Active' ? (
							<Badge variant="success">
								Active
							</Badge>
						) : (
							<Badge variant="error">
								{clientDetails?.client.clientStatus}
							</Badge>
						)}
						</div>
					</div>
						
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="completed">
								{clientDetails?.client.clientID}
							</Badge>
						</div>
				</CardHeader>
				
				<CardContent className="pt-4 pb-3">
					<div className="space-y-4">
						<div>
							<div className="flex items-center">
								<CircleUserRoundIcon className="h-4 w-4 mr-2 text-primary" />
								<div>
									<Label htmlFor="primary-contact" className="text-xs text-muted-foreground">
										Primary Contact
									</Label>
									<p id="primary-contact" className="font-medium text-sm">
										{clientDetails?.client.primaryContact}
									</p>
								</div>
							</div>
						</div>
						
						<div>
							<div className="flex items-center">
								<MailIcon className="h-4 w-4 mr-2 text-primary" />
								<div>
									<Label htmlFor="email" className="text-xs text-muted-foreground">
										Email
									</Label>
									<p id="email" className="font-medium text-sm">
										{clientDetails?.client.email}
									</p>
								</div>
							</div>
						</div>
						
						<div>
							<div className="flex items-center">
								<UserIcon className="h-4 w-4 mr-2 text-primary" />
								<div>
									<Label htmlFor="sales-rep" className="text-xs text-muted-foreground">
										Sales Rep
									</Label>
									<p id="sales-rep" className="font-medium text-sm">
										{clientDetails?.client.salesPerson}
									</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
			
			{/* Integration Status Card - Simplified and compact */}
			<Card className="shadow-sm h-full flex flex-col">
				<CardHeader className="pb-1 pt-3">
					<CardTitle className="text-base">Integration Status</CardTitle>
				</CardHeader>
				<CardContent className="flex-grow p-3">
					<div className="grid grid-cols-5 gap-x-2 text-xs font-medium border-b pb-1 mb-1">
						<div className="col-span-2">Entity</div>
						<div className="col-span-3 grid grid-cols-2 gap-1">
							<div>Quickbooks</div>
							<div>Auth.net</div>
						</div>
					</div>
					
					<div className="h-full overflow-y-auto">
						{Object.entries(clientDetails?.quickbooks || {}).map(([key, value]) => {
							const entityName = entityNames[key as keyof typeof entityNames] || key;
							const isConnectedToAuthNet = clientDetails?.entities.includes(
								key === 'wc' ? 'WholeSale Communications' : 
								key === 'cg' ? 'Contract Genie' : 
								key === 'vbc' ? 'Voice Broadcasting' : key
							);
							
							const authNetProfileId = key === 'wc' ? clientDetails?.client.wcCustomerProfileID : 
													key === 'cg' ? clientDetails?.client.cgCustomerProfileID : 
													key === 'vbc' ? clientDetails?.client.vbcCustomerProfileID : null;
							
							return (
								<div key={key} className=" space-y-2 grid grid-cols-5 gap-x-2 py-1 border-b last:border-0">
									<div className="flex items-center col-span-2">
										{key === 'wc' ? (
											<PhoneIcon className="h-3 w-3 mr-1 text-muted-foreground" />
										) : key === 'cg' ? (
											<ScrollTextIcon className="h-3 w-3 mr-1 text-muted-foreground" />
										) : key === 'vbc' ? (
											<MegaphoneIcon className="h-3 w-3 mr-1 text-muted-foreground" />
										) : (
											<Building className="h-3 w-3 mr-1 text-muted-foreground" />
										)}
										<span className="text-xs font-medium truncate text-wrap">{entityName}</span>
									</div>
									
									<div className="col-span-3 grid grid-cols-2 gap-1">
										<div className="flex items-center">
											{value ? (
												<div className="flex items-center">
													<CheckCircle2 className="h-3 w-3 mr-1 text-success" />
													<span className="text-xs text-success">Connected</span>
												</div>
											) : (
												<Button variant="ghost" size="sm" className="h-5 text-xs p-0.5 px-1 text-muted-foreground hover:text-primary">
													<Plus className="h-3 w-3 mr-0.5" />
													Connect
												</Button>
											)}
										</div>
										
										<div className="flex items-center">
											{isConnectedToAuthNet ? (
												<Badge variant="success" className="flex items-center">
													<CheckCircle2 className="h-3 w-3 mr-1 text-secondary" />
													<span className="text-xs text-secondary-foreground">{authNetProfileId}</span>
												</Badge>
											) : (
												<Button variant="ghost" size="sm" className="h-5 text-xs p-0.5 px-1 text-muted-foreground hover:text-primary">
													<Plus className="h-3 w-3 mr-0.5" />
													Connect
												</Button>
											)}
										</div>
									</div>
									
			
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
			
			{/* Notes Card */}
			<Card className="shadow-sm h-full flex flex-col">
				<CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
					<CardTitle className="text-base flex items-center gap-1.5">
						<Star className="h-4 w-4 text-yellow-400" />
						Notes
					</CardTitle>
					<Button variant="outline" size="sm" className="h-7 text-xs">
						<Plus className="h-3 w-3 mr-1" />
						Add Note
					</Button>
				</CardHeader>
				
				<CardContent className="p-0 flex-grow">
					<div className="h-full px-4 overflow-y-auto">
						<div className="space-y-2 pt-2 pb-4">
							{sortedNotes.length > 0 ? (
								sortedNotes.map((note) => (
									<Card 
										key={note.noteID} 
										className={`p-2 ${
											note.important === '1' 
												? 'border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10' 
												: 'border-gray-200'
										}`}
									>
										<div className="flex justify-between items-start mb-1">
											<div className="font-medium text-sm">{note.author}</div>
											{note.important === '1' && (
												<Star className="h-3 w-3 text-yellow-400" />
											)}
										</div>
										
										<div className="text-xs text-muted-foreground mb-1">
											{new Date(note.createdAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</div>
										
										<Separator className="my-1.5" />
										
										<div className="text-xs mt-1.5 whitespace-pre-wrap">
											{note.note}
										</div>
									</Card>
								))
							) : (
								<div className="text-center py-8 text-muted-foreground text-sm">
									No notes available for this client
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
