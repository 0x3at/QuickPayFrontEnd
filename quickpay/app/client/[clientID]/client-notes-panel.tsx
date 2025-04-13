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
	StickyNote,
} from 'lucide-react';
import { getClient } from '@/hooks/api-hooks';
import { ClientDetails } from '@/lib/types';

export function ClientNotesPanel({ clientID }: { clientID: number }) {
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
		<div className='flex flex-row gap-4'>
			<Card className='w-full'>
				<CardHeader>
					<div className='flex flex-row justify-between items-center'>
						<CardTitle className='text-2xl font-bold'>Notes</CardTitle>
						<Button variant='default' size='sm'>
							Add Note
						</Button>
					</div>
					<CardDescription>
						Client notes and important information
					</CardDescription>
					<Separator className='my-4' />
				</CardHeader>
				<CardContent>
					{clientDetails?.notes && clientDetails.notes.length > 0 ? (
						<div className='space-y-4'>
							{clientDetails.notes
								.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
								.filter((note) => note.archived !== '1')
								.map((note, index) => (
									<Card
										key={note.noteID || index}
										className={`border ${
											note.important.toLowerCase() === 'true'
												? 'border-amber-400'
												: ''
										}`}
									>
										<CardHeader className=''>
											<div className='flex justify-between items-center'>
												<div className='flex items-center gap-2'>
													<StickyNote className='w-4 h-4' />
													<CardTitle className='text-base'>
														Note by {note.author}
													</CardTitle>
												</div>
												{note.important.toLowerCase() ===
													'true' && (
													<Badge className='bg-amber-400 text-white'>
														Important
													</Badge>
												)}
											</div>
											<CardDescription>
												{new Date(note.createdAt).toLocaleDateString()}
											</CardDescription>
										</CardHeader>
										<Separator className='w-2/3' />
										<CardContent className='a'>
											<p className='whitespace-pre-wrap'>
												{note.note}
											</p>
										</CardContent>
									</Card>
								))}
						</div>
					) : (
						<div className='text-center py-6 text-muted-foreground'>
							No notes found
						</div>
					)}
				</CardContent>
				<CardFooter className='flex justify-between'>
				</CardFooter>
			</Card>
		</div>
	);
}
