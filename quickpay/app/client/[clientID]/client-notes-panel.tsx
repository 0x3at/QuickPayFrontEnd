'use client';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClientDetailResponseV2, NoteV2 } from '@/lib/typesV2';
import {
	StickyNote, Bug, X
} from 'lucide-react';
import { AddNoteDialog } from '@/components/add-note-dialog';

interface ClientNotesPanelProps {
	clientID: number;
	clientDetails: ClientDetailResponseV2;
	onRefresh: () => void;
}

// Helper function to handle boolean values that might be strings
const isTrueValue = (value: any): boolean => {
	return value === true || value === "True" || value === "true";
};

const isFalseValue = (value: any): boolean => {
	return value === false || value === "False" || value === "false";
};

export function ClientNotesPanel({ clientID, clientDetails, onRefresh }: ClientNotesPanelProps) {
	const [open, setOpen] = useState(false);
	
	// Helper function for handling add note success
	const handleAddNoteSuccess = () => {
		// Call the parent refresh function to get updated client data
		onRefresh();
	};

	return (
		<div className='flex flex-col gap-4'>
			<Card className='w-full'>
				<CardHeader>
					<div className='flex flex-row justify-between items-center'>
						<CardTitle className='text-2xl font-bold'>Notes</CardTitle>
						<Button variant='action' size='sm' className='text-secondary' onClick={() => setOpen(true)}>Add Note</Button>
					</div>
					<CardDescription>
						Client notes and important information
					</CardDescription>
					<Separator className='my-4' />
				</CardHeader>
				<CardContent>
					{Array.isArray(clientDetails.notes) && clientDetails.notes.length > 0 ? (
						<div className='space-y-4'>
							{clientDetails.notes
								.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
								.filter((note) => !isTrueValue(note.archived))
								.map((note, index) => (
									<Card
										key={note.noteID || index}
										className={`border ${
											isTrueValue(note.important)
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
												{isTrueValue(note.important) && (
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
										<CardContent className='pt-4'>
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
			<AddNoteDialog
				open={open}
				onOpenChange={setOpen}
				clientID={clientID}
				onSuccess={handleAddNoteSuccess}
				defaultAuthor="User"
			/>
		</div>
	);
}
