"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { useInvoicesV2 } from "@/hooks/apiv2-hooks"
import { InvoiceV2 } from "@/lib/typesV2"
import { 
    Select,
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"

export const columns: ColumnDef<InvoiceV2>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: any) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: true,
        enableHiding: false,
    },
    {
        accessorKey: "invoiceID",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Invoice ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Badge variant="default" className="bg-success text-accent-foreground text-center">{row.getValue("invoiceID")}</Badge>
            </div>
        )
    },
    {
        accessorKey: "clientID",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Client ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Badge variant="default" className="bg-completed text-accent-foreground text-center">{row.getValue("clientID")}</Badge>
            </div>
        )
    },
    {
        accessorKey: "entityCode",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Entity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => <div className="text-center">
            {row.getValue("entityCode") === "wc" ? "WholeSale Communications" : 
            row.getValue("entityCode") === "vbc" ? "Voice Broadcasting" : 
            row.getValue("entityCode") === "cg" ? "Contract Genie" : 
            row.getValue("entityCode")}
        </div>,
    },
    {
        accessorKey: "invoiceStatus",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("invoiceStatus")

            if (status === "Pending") {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default" className="bg-warning text-accent-foreground">Pending</Badge>
                    </div>
                )
            } else if (status === "Approved") {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default" className="bg-success text-accent-foreground">Approved</Badge>
                    </div>
                )
            } else if (status === "Rejected") {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default" className="bg-error text-accent-foreground">Rejected</Badge>
                    </div>
                )
            } else if (status === "Collected") {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default" className="bg-completed text-accent-foreground">Collected</Badge>
                    </div>
                )
            } else {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default">{String(status)}</Badge>
                    </div>
                )
            }
        },
    },
    {
        accessorKey: "invoiceTotal",
        header: () => <div className="text-center">Total</div>,
        cell: ({ row }) => {
            return <div className="text-center">${row.getValue("invoiceTotal")}</div>
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div className="text-center">{date.toLocaleDateString()}</div>
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const invoice = row.original

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(invoice.invoiceID.toString())}
                            >
                                Copy Invoice ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link href={`/invoice/${invoice.invoiceID}`}>View Invoice Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href={`/client/${invoice.clientID}`}>View Client Details</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        },
    },
]

export function InvoiceTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    
    // Pagination state
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 25,
    })
    
    // Filter states
    const [entityCode, setEntityCode] = React.useState<string | undefined>(undefined)
    const [statusFilter, setStatusFilter] = React.useState<string | undefined>(undefined)
    
    // Use the V2 invoices hook with pagination and filters
    const { data, isLoading, error, refetch } = useInvoicesV2({
        entityCode,
        status: statusFilter,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
    });
    
    // Extract invoices and total count from the data
    const invoices = data?.invoices || [];
    const totalCount = data?.metadata?.total || 0;
    
    // Calculate page count based on total items
    const pageCount = Math.ceil(totalCount / pagination.pageSize);
    
    const table = useReactTable({
        data: invoices,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    // Handle entity filter change
    const handleEntityChange = (value: string) => {
        setEntityCode(value === "all" ? undefined : value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    // Handle status filter change
    const handleStatusChange = (value: string) => {
        setStatusFilter(value === "all" ? undefined : value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-12 py-4">
                {/* Entity Filter */}

                {/* Status Filter */}
                <div className="w-[200px]">
                    <Select onValueChange={handleStatusChange} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Collected">Collected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[200px]">
                    <Select onValueChange={handleEntityChange} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Entities</SelectItem>
                            <SelectItem value="wc">Wholesale Communications</SelectItem>
                            <SelectItem value="cg">Contract Genie</SelectItem>
                            <SelectItem value="vbc">Voice Broadcasting</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value: any) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
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
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-error"
                                >
                                    Error loading data
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Force table re-render with key when data changes
                            <React.Fragment key={invoices.map(i => i.invoiceID).join(',')}>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {totalCount} invoice(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {pageCount || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
