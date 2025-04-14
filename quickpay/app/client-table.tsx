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
import { EditClientDialog } from "@/components/edit-client-popup"
import Link from "next/link"
import { useClientsV2 } from "@/hooks/apiv2-hooks"
import { ClientListItemV2 } from "@/lib/typesV2"


export const columns: ColumnDef<ClientListItemV2>[] = [
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
                <Badge variant="default" className="bg-completed text-foreground text-center">{row.getValue("clientID")}</Badge>
            </div>
        ),
    },
    {
        accessorKey: "companyName",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                    Company Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => <div className="text-center">{row.getValue("companyName")}</div>,
    },
    {
        accessorKey: "primaryContact",
        header: () => <div className="text-center">Primary Contact</div>,
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue("primaryContact")}</div>,
    },
    {
        accessorKey: "email",
        header: () => <div className="text-center">Email</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "clientStatus",
        header: ({ column }) => {
            return (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const status:string = row.getValue("clientStatus")

            if (status.toLowerCase() === "active") {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default" className="bg-success text-accent-foreground">Active</Badge>
                    </div>
                )
            } else {
                return (
                    <div className="flex justify-center w-full">
                        <Badge variant="default" className="bg-error text-accent-foreground">Inactive</Badge>
                    </div>
                )
            }
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const client = row.original
            const [open, setOpen] = React.useState(false)

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
                                onClick={() => navigator.clipboard.writeText(client.clientID.toString())}
                            >
                                Copy Client ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link href={`/client/${client.clientID}`}>View Client Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setOpen(true)}>Edit client</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <EditClientDialog open={open} onOpenChange={setOpen} client={client} />
                </>
            )
        },
    },
]

export function ClientTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    
    // Pagination state
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 25,
    })
    
    // Search state - only used for the input field
    const [searchInput, setSearchInput] = React.useState("")
    // Actual search term passed to the API after debounce
    const [searchTerm, setSearchTerm] = React.useState("")
    
    // Use the V2 clients hook with pagination and search
    const { data, isLoading, error, refetch } = useClientsV2({
        active: true,
        search: searchTerm,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
    });
    
    // Extract clients and total count from the data
    const clients = data?.clients || [];
    const totalCount = data?.metadata?.total || 0;
    
    // Calculate page count based on total items
    const pageCount = Math.ceil(totalCount / pagination.pageSize);
    
    const table = useReactTable({
        data: clients,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        // Remove client-side filtering as we're using server-side search
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

    // Handle search with debounce
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(searchInput);
            // Reset to first page when search changes
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    // Function to handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <div className="relative max-w-md sm:min-w-92">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="company name, contact, or email..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="pl-8 pr-4 w-full"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
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
                        ) : clients.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Force table re-render with key when data changes
                            <React.Fragment key={clients.map(c => c.clientID).join(',')}>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
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
                    {totalCount} client(s) selected.
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
