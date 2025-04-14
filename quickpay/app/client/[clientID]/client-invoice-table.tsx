'use client';

import * as React from 'react';
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useClientInvoicesV2 } from '@/hooks/apiv2-hooks';
import { ClientDetailResponseV2, InvoiceV2 } from '@/lib/typesV2';
import { InvoiceDetailsDialog } from './invoice-details-dialog';

export const columns: ColumnDef<InvoiceV2>[] = [
	{
		accessorKey: 'invoiceID',
		header: ({ column }) => {
			return (
				<div className='flex justify-center'>
					<Button
						variant='ghost'
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Invoice ID
						<ArrowUpDown />
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<Badge
					variant='default'
					className='bg-success text-accent-foreground text-center'
				>
					{row.getValue('invoiceID')}
				</Badge>
			</div>
		),
		filterFn: (row, id, filterValue) => {
			const invoiceId = row.getValue(id) as string;
			const searchValue = String(filterValue).toLowerCase();
			return String(invoiceId).toLowerCase().includes(searchValue);
		},
	},
	{
		accessorKey: 'invoiceStatus',
		header: ({ column }) => {
			return (
				<div className='flex justify-center'>
					<Button
						variant='ghost'
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Status
						<ArrowUpDown />
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const status = row.getValue('invoiceStatus');

			if (status === 'Pending') {
				return (
					<div className='flex justify-center w-full'>
						<Badge
							variant='default'
							className='bg-warning text-accent-foreground'
						>
							{row.getValue('invoiceStatus')}
						</Badge>
					</div>
				);
			} else if (status === 'Approved') {
				return (
					<div className='flex justify-center w-full'>
						<Badge
							variant='default'
							className='bg-success text-accent-foreground'
						>
							{row.getValue('invoiceStatus')}
						</Badge>
					</div>
				);
			} else if (status === 'Rejected') {
				return (
					<div className='flex justify-center w-full'>
						<Badge
							variant='default'
							className='bg-error text-accent-foreground'
						>
							{row.getValue('invoiceStatus')}
						</Badge>
					</div>
				);
			} else if (status === 'Collected') {
				return (
					<div className='flex justify-center w-full'>
						<Badge
							variant='default'
							className='bg-completed text-accent-foreground'
						>
							{row.getValue('invoiceStatus')}
						</Badge>
					</div>
				);
			}
		},
	},
	{
		accessorKey: 'entityCode',
		header: () => <div className='text-center'>Entity</div>,
		cell: ({ row }) => (
			<div className='text-center'>
				{row.getValue('entityCode') === 'wc'
					? 'WholeSale Communications'
					: row.getValue('entityCode') === 'vbc'
					? 'Voice Broadcasting'
					: row.getValue('entityCode') === 'cg'
					? 'Contract Genie'
					: row.getValue('entityCode')}
			</div>
		),
	},
	{
		accessorKey: 'invoiceTotal',
        header: ({ column }) => {
			return (
				<div className='flex justify-center'>
					<Button
						variant='ghost'
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Total
						<ArrowUpDown />
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('invoiceTotal'));

			return (
				<div className='text-center'>
					${amount.toFixed(2)}
				</div>
			);
		},
	},
	{
		accessorKey: 'collected',
		header: () => <div className='text-center'>Collected</div>,
		cell: ({ row }) => {
			const collected = row.getValue('collected');

			if (collected === true) {
				return (
					<Badge
						variant='default'
						className='bg-success text-secondary-foreground'
					>
						Yes
					</Badge>
				);
			} else {
				const status = row.getValue('invoiceStatus');
				if (status === 'Approved') {
					return (
						<Badge
							variant='default'
							className='bg-completed text-secondary-foreground'
						>
							Ready
						</Badge>
					);
				} else if (status === 'Rejected') {
					return (
						<Badge
							variant='default'
							className='bg-error text-secondary-foreground'
						>
							Rejected
						</Badge>
					);
				} else {
					return (
						<Badge
							variant='default'
							className='bg-warning text-secondary-foreground'
						>
							Not Ready
						</Badge>
					);
				}
			}
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const invoice = row.original;

			return (
				<>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' className='h-8 w-8 p-0'>
								<span className='sr-only'>Open menu</span>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() =>
									navigator.clipboard.writeText(
										invoice.invoiceID.toString()
									)
								}
							>
								Copy Invoice ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Edit Invoice</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href={`/invoice/${invoice.invoiceID}`}>View Invoice Details</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			);
		},
	},
];

interface InvoiceTableProps {
    clientID: number;
    clientDetails: ClientDetailResponseV2;
}

export function InvoiceTable({ clientID, clientDetails }: InvoiceTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	
	// Use the V2 client invoices hook
	const { 
        data, 
        isLoading, 
        error,
        refetch: refreshInvoices
    } = useClientInvoicesV2(clientID);
	
	const invoices = data?.invoices || [];

	// Always call useReactTable, even if data isn't loaded yet
	const table = useReactTable({
		data: invoices,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	// Handle loading/empty states in the return statement AFTER all hooks are called
	return (
		<div className='w-full'>
			{isLoading ? (
				<div className='w-full p-4 text-center'>
					Loading invoice data...
				</div>
			) : error ? (
				<div className='w-full p-4 text-center text-error'>
					Error loading invoice data
				</div>
			) : invoices.length === 0 ? (
				<div className='w-full p-4 text-center'>
					No invoice data available
				</div>
			) : (
				/* Rest of your component with table UI */
				<>
					<div className='flex items-center py-4'>
						<Input
							placeholder='Search by Invoice ID'
							value={
								(table
									.getColumn('invoiceID')
									?.getFilterValue() as string) ?? ''
							}
							onChange={(event) =>
								table
									.getColumn('invoiceID')
									?.setFilterValue(event.target.value)
							}
							className='max-w-sm'
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='outline' className='ml-auto'>
									Columns <ChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								{table
									.getAllColumns()
									.filter((column) => column.getCanHide())
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className='capitalize'
												checked={column.getIsVisible()}
												onCheckedChange={(value: any) =>
													column.toggleVisibility(
														!!value
													)
												}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<div className='rounded-md border'>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column
																	.columnDef
																	.header,
																header.getContext()
														  )}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={
												row.getIsSelected() &&
												'selected'
											}
										>
											{row
												.getVisibleCells()
												.map((cell) => (
													<TableCell
														key={cell.id}
														className='text-center'
													>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className='h-24 text-center'
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					<div className='flex items-center justify-end space-x-2 py-4'>
						<div className='flex-1 text-sm text-muted-foreground'>
							{table.getFilteredSelectedRowModel().rows.length} of{' '}
							{table.getFilteredRowModel().rows.length} row(s)
							selected.
						</div>
						<div className='space-x-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								Previous
							</Button>
							<Button
								variant='outline'
								size='sm'
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								Next
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
