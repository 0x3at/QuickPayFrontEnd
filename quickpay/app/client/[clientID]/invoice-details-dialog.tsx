'use client';

import { useState } from 'react';
import {
    FileText,
    CreditCard,
    Building,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    Tag,
    Clock,
    Banknote,
    ClipboardList,
    Star,
    Receipt,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

// Define the types for our invoice data
interface InvoiceDetails {
    invoice: {
        invoiceID: string;
        entityCode: string;
        clientID: number;
        paymentProfileID: string;
        invoiceStatus: string;
        invoiceTotal: string;
        createdAt: string;
        createdBy: string;
        approvedBy: string;
        approvedAt: string | null;
        collected: boolean;
        transactionID: string;
        quickbooks: boolean;
    };
    client: {
        clientID: string;
        primaryContact: string;
        companyName: string;
        salesPerson: string;
        email: string;
        clientStatus: string;
    };
    paymentProfile: {
        cardType: string;
        lastFour: string;
        billingDetails: {
            firstName: string;
            lastName: string;
            streetAddress: string;
            zipCode: string;
        };
        expirationDate: string;
    };
    lineItems?: Array<{
        serviceId: string;
        serviceName: string;
        unitPrice: number;
        quantity: number;
    }>;
    notes: Array<{
        noteID: string;
        note: string;
        author: string;
        important: string;
        createdAt: string;
    }>;
    entities: string[];
}

interface InvoiceDetailsDialogProps {
    invoice: InvoiceDetails;
    trigger?: React.ReactNode;
}

function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-success text-success-foreground hover:bg-success/80';
        case 'pending':
            return 'bg-warning text-warning-foreground hover:bg-warning/80';
        case 'overdue':
            return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
        case 'draft':
            return 'bg-muted text-muted-foreground hover:bg-muted/80';
        default:
            return 'bg-primary text-primary-foreground hover:bg-primary/80';
    }
}

function formatCurrency(amount: string | number): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(numericAmount);
}

function getEntityName(code: string, entities: string[]): string {
    const entityMap: Record<string, string> = {
        'wc': 'WholeSale Communications',
        'cg': 'Contract Genie',
        'vbc': 'Voice Broadcasting'
    };
    
    return entityMap[code] || entities.find(e => e.toLowerCase().includes(code)) || code;
}

export function InvoiceDetailsDialog({ invoice, trigger }: InvoiceDetailsDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Mock line items for display purposes
    const mockLineItems = [
        {
            serviceId: 'service-1',
            serviceName: 'Website Development',
            unitPrice: 1500,
            quantity: 1
        },
        {
            serviceId: 'service-2',
            serviceName: 'Technical Support',
            unitPrice: 395,
            quantity: 2
        }
    ];

    const lineItems = invoice.lineItems || mockLineItems;
    const statusColorClass = getStatusColor(invoice.invoice.invoiceStatus);
    const entityName = getEntityName(invoice.invoice.entityCode, invoice.entities);
    
    // Format dates
    const createdAtDate = invoice.invoice.createdAt ? 
        format(parseISO(invoice.invoice.createdAt), 'MMM d, yyyy h:mm a') : 'N/A';
    
    const approvedAtDate = invoice.invoice.approvedAt ? 
        format(parseISO(invoice.invoice.approvedAt), 'MMM d, yyyy h:mm a') : 'N/A';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">View Invoice</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto bg-card">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Receipt className="h-6 w-6 text-primary" />
                            Invoice #{invoice.invoice.invoiceID}
                        </DialogTitle>
                        <Badge className={statusColorClass}>
                            {invoice.invoice.invoiceStatus.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {createdAtDate}
                        {invoice.invoice.collected && (
                            <Badge variant="outline" className="ml-2 bg-success/10 text-success border-success/20">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Collected
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Section - Client & Invoice Info */}
                    <div className="col-span-2 space-y-6">
                        {/* Amount Summary Card */}
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex justify-between items-center">
                            <div>
                                <div className="text-sm text-muted-foreground">Total Amount</div>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(invoice.invoice.invoiceTotal)}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-sm text-muted-foreground">Payment Status</div>
                                <div className="flex items-center gap-2">
                                    {invoice.invoice.collected ? (
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-warning" />
                                    )}
                                    <span className="font-medium">
                                        {invoice.invoice.collected ? 'Paid' : 'Awaiting Payment'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Client Info Card */}
                        <div className="bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm">
                            <h3 className="text-md font-semibold flex items-center border-b pb-2">
                                <span className="inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center">
                                    <div className="mt-0.5">1</div>
                                </span>
                                Client Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Company</div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{invoice.client.companyName}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Client ID</div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{invoice.client.clientID}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Contact Person</div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{invoice.client.primaryContact}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Email</div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{invoice.client.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Line Items Table */}
                        <div className="bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm">
                            <h3 className="text-md font-semibold flex items-center border-b pb-2">
                                <span className="inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center">
                                    <div className="mt-0.5">2</div>
                                </span>
                                Line Items
                            </h3>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                                            <th className="py-2 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-background/30 divide-y divide-border/30">
                                        {lineItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-muted/30">
                                                <td className="py-3 px-3 text-sm">{item.serviceName}</td>
                                                <td className="py-3 px-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                                                <td className="py-3 px-3 text-sm text-right">{item.quantity}</td>
                                                <td className="py-3 px-3 text-sm text-right font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/10">
                                            <td colSpan={3} className="py-3 px-3 text-sm font-medium text-right">Total</td>
                                            <td className="py-3 px-3 text-sm font-bold text-right">{formatCurrency(invoice.invoice.invoiceTotal)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Section - Payment Info & Status */}
                    <div className="col-span-1 space-y-6">
                        {/* Payment Method Card */}
                        <div className="bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm sticky top-6">
                            <h3 className="text-md font-semibold flex items-center border-b pb-2">
                                <span className="inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center">
                                    <div className="mt-0.5">3</div>
                                </span>
                                Payment Details
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Entity</div>
                                    <div className="bg-background p-2 rounded-md flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{entityName}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Payment Method</div>
                                    <div className="bg-background p-3 rounded-md border border-border/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium flex items-center gap-1">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                {invoice.paymentProfile.cardType || 'Card'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                Expires: {invoice.paymentProfile.expirationDate}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            •••• •••• •••• {invoice.paymentProfile.lastFour}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {invoice.paymentProfile.billingDetails.firstName} {invoice.paymentProfile.billingDetails.lastName}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Status</div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-background p-2 rounded-md">
                                            <span className="text-sm flex items-center gap-1">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                Created
                                            </span>
                                            <span className="text-xs text-muted-foreground">{createdAtDate}</span>
                                        </div>
                                        
                                        {invoice.invoice.approvedAt && (
                                            <div className="flex justify-between items-center bg-background p-2 rounded-md">
                                                <span className="text-sm flex items-center gap-1">
                                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                                    Approved
                                                </span>
                                                <span className="text-xs text-muted-foreground">{approvedAtDate}</span>
                                            </div>
                                        )}
                                        
                                        {invoice.invoice.collected && (
                                            <div className="flex justify-between items-center bg-background p-2 rounded-md">
                                                <span className="text-sm flex items-center gap-1">
                                                    <Banknote className="h-4 w-4 text-success" />
                                                    Collected
                                                </span>
                                                <span className="text-xs">{formatCurrency(invoice.invoice.invoiceTotal)}</span>
                                            </div>
                                        )}
                                        
                                        {invoice.invoice.quickbooks ? (
                                            <div className="flex justify-between items-center bg-background p-2 rounded-md">
                                                <span className="text-sm flex items-center gap-1">
                                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                                    QuickBooks Synced
                                                </span>
                                                <span className="text-xs text-success">✓</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center bg-background p-2 rounded-md">
                                                <span className="text-sm flex items-center gap-1">
                                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                                    QuickBooks Sync
                                                </span>
                                                <span className="text-xs text-muted-foreground">Pending</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-border/30 space-y-2">
                                {!invoice.invoice.collected && (
                                    <Button className="w-full" variant="default">
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Process Payment
                                    </Button>
                                )}
                                <Button className="w-full" variant="outline">
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    Download Invoice
                                </Button>
                            </div>
                        </div>
                        
                        {/* Notes Section */}
                        {invoice.notes && invoice.notes.length > 0 && (
                            <div className="bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm">
                                <h3 className="text-md font-semibold flex items-center border-b pb-2">
                                    <span className="inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center">
                                        <div className="mt-0.5">4</div>
                                    </span>
                                    Client Notes
                                </h3>
                                
                                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                                    {invoice.notes.slice(0, 3).map((note) => (
                                        <div key={note.noteID} className="bg-background p-3 rounded-md border border-border/30">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs">
                                                            {note.author ? note.author.charAt(0).toUpperCase() : 'S'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{note.author || 'System'}</span>
                                                </div>
                                                {note.important === "True" && (
                                                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 flex items-center">
                                                        <Star className="h-3 w-3 mr-1" fill="currentColor" /> Important
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm whitespace-pre-line">{note.note}</p>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {note.createdAt ? format(parseISO(note.createdAt), 'MMM d, yyyy') : 'N/A'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {invoice.notes.length > 3 && (
                                    <Button variant="ghost" className="w-full text-xs" size="sm">
                                        View All Notes ({invoice.notes.length})
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 