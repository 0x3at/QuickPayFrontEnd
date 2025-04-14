'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	StickyNote,
	Clock,
	CheckCircle2,
	XCircle,
	FileText,
	ArrowUpDown,
	MoreHorizontal,
} from 'lucide-react';
import { ClientDetailResponseV2, TransactionV2 } from '@/lib/typesV2';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientTransactionsPanelProps {
	clientID: number;
	clientDetails: ClientDetailResponseV2;
}

// Helper function to format currency
const formatCurrency = (amount: string): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(parseFloat(amount));
};

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

export function ClientTransactionsPanel({ clientID, clientDetails }: ClientTransactionsPanelProps) {
	const transactions = clientDetails.transactions || [];

	// Loading state
	if (!clientDetails) {
		return (
			<div className="flex items-center justify-center h-64">
				<Clock className="h-10 w-10 animate-spin text-primary" />
				<div className="ml-4">Loading transaction data...</div>
			</div>
		);
	}

	// Empty state
	if (transactions.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Transactions</CardTitle>
					<CardDescription>
						Payment transaction history for this client
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">
							No Transactions Found
						</h3>
						<p className="text-muted-foreground max-w-md">
							This client doesn't have any payment transactions yet.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Data loaded successfully
	return (
		<Card>
			<CardHeader>
				<CardTitle>Transaction History</CardTitle>
				<CardDescription>
					Payment transaction history for this client
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Entity</TableHead>
								<TableHead>Invoice</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{transactions.map((transaction, index) => (
								<TableRow key={index}>
									<TableCell>{formatDate(transaction.createdAt)}</TableCell>
									<TableCell>{formatCurrency(transaction.amount)}</TableCell>
									<TableCell>
										{transaction.result === 'Success' ? (
											<Badge variant='success' className='bg-success text-success-foreground'>
												Success
											</Badge>
										) : (
											<Badge variant='destructive' className='bg-destructive text-destructive-foreground'>
												Failed
											</Badge>
										)}
									</TableCell>
									<TableCell>
										{transaction.entity === 'wc'
											? 'WholeSale Communications'
											: transaction.entity === 'vbc'
											? 'Voice Broadcasting'
											: transaction.entity === 'cg'
											? 'Contract Genie'
											: transaction.entity}
									</TableCell>
									<TableCell>
										{transaction.invoiceID ? (
											<Badge variant='outline'>{transaction.invoiceID}</Badge>
										) : (
											<span className="text-muted-foreground text-xs">N/A</span>
										)}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' className='h-8 w-8 p-0'>
													<span className='sr-only'>Open menu</span>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.invoiceID?.toString() || '')}>
													Copy Invoice ID
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>View Transaction Details</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
