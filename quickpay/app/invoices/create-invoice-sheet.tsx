'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import {
    Check,
    ChevronsUpDown,
    CircleCheck,
    CircleX,
    Plus,
    Unplug,
    Trash2,
    FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    getEntities,
    getClientIDs,
    getClient,
    Entity,
} from '@/hooks/api-hooks';
import { PaymentProfile, Quickbooks } from '@/lib/types';
import { errorToast, successToast } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

// Mocked service items data
const mockServiceItems = [
    {
        "Name": "Website Development Services",
        "UnitPrice": 150,
        "sparse": true,
        "Id": "web-dev-1"
    },
    {
        "Name": "Digital Marketing",
        "UnitPrice": 125,
        "sparse": true,
        "Id": "digital-marketing-1"
    },
    {
        "Name": "Server Maintenance",
        "UnitPrice": 200,
        "sparse": true,
        "Id": "server-maint-1"
    },
    {
        "Name": "mmm towards punctuation blah lost curly key across snuggle sometimes which incidentally sushi provided jungle blah outside warm",
        "UnitPrice": 3994796287515539,
        "sparse": true,
        "Id": "to though pfft in towards collaborate quirkily that developmental circumnavigate tough trek even pish overcooked exotic belabor oddly hidden sushi whoever clearly drum minty after intend matter absent whose syringe metal amount indeed straight drain black-and-white"
    }
];

export function CreateInvoiceDialog() {
    // State for dialog visibility
    const [isOpen, setIsOpen] = useState(false);
    
    // State for loaded data
    const [entities, setEntities] = useState<Entity[]>([]);
    const [existingClientIDs, setExistingClientIDs] = useState<number[]>([]);
    const [paymentProfiles, setPaymentProfiles] = useState<PaymentProfile[]>(
        []
    );
    const [filteredPaymentProfiles, setFilteredPaymentProfiles] = useState<
        PaymentProfile[]
    >([]);
    const [clientInfo, setClientInfo] = useState<{
        primaryContact: string;
        companyName: string;
        quickbooks: Quickbooks;
    } | null>(null);
    const [open, setOpen] = useState(false);

    // Loading states
    const [isLoadingEntities, setIsLoadingEntities] = useState(true);
    const [isLoadingClientIDs, setIsLoadingClientIDs] = useState(true);
    const [isLoadingClient, setIsLoadingClient] = useState(false);

    // New state for line items
    const [lineItems, setLineItems] = useState([{ id: Date.now() }]);

    // Define form schema
    const formSchema = z.object({
        entityCode: z.string({
            required_error: 'Entity is required',
        }),
        clientID: z.coerce
            .number({
                required_error: 'Client ID is required',
                invalid_type_error: 'Client ID must be a number',
            })
            .min(1, 'Client ID must be at least 1')
            .refine(
                (id) => existingClientIDs.includes(id),
                "This Client ID doesn't exist"
            ),
        paymentProfileID: z.string({
            required_error: 'Payment profile is required',
        }),
        lineItems: z.array(
            z.object({
                serviceId: z.string().optional(),
                unitPrice: z.number().optional(),
                quantity: z.number().min(1).optional(),
            })
        ),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    });

    const { formState, watch, setValue } = form;
    const { isValid, isDirty, isSubmitting } = formState;

    // Watch for form value changes to trigger API calls
    const watchedClientID = watch('clientID');
    const watchedEntityCode = watch('entityCode');
    
    // Load initial data when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    // Fetch entities and client IDs on component mount
    async function loadInitialData() {
        try {
            // Load entities for dropdown
            setIsLoadingEntities(true);
            const entitiesData = await getEntities();
            setEntities(entitiesData.entities);
            setIsLoadingEntities(false);

            // Load client IDs for validation
            setIsLoadingClientIDs(true);
            const ids = await getClientIDs();
            setExistingClientIDs(ids);
            setIsLoadingClientIDs(false);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            errorToast('Failed to load form data');
        }
    }

    // Fetch client data when client ID and entity are selected
    useEffect(() => {
        async function loadClientData() {
            if (!watchedClientID) {
                setClientInfo(null);
                setPaymentProfiles([]);
                setFilteredPaymentProfiles([]);
                return;
            }

            try {
                setIsLoadingClient(true);
                const clientData = await getClient(watchedClientID);

                if (clientData) {
                    // Set client info
                    setClientInfo({
                        primaryContact: clientData.client.primaryContact,
                        companyName: clientData.client.companyName,
                        quickbooks: clientData.quickbooks,
                    });

                    // Set payment profiles
                    if (clientData.paymentProfiles) {
                        setPaymentProfiles(clientData.paymentProfiles);

                        if (watchedEntityCode) {
                            // Filter payment profiles by selected entity
                            const filtered = clientData.paymentProfiles.filter(
                                (profile: PaymentProfile) =>
                                    profile.entity === watchedEntityCode
                            );
                            setFilteredPaymentProfiles(filtered);
                        } else {
                            setFilteredPaymentProfiles([]);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load client data:', error);
                errorToast('Failed to load client information');
                setClientInfo(null);
            } finally {
                setIsLoadingClient(false);
            }
        }

        if (existingClientIDs.includes(watchedClientID)) {
            loadClientData();
        } else {
            setClientInfo(null);
            setPaymentProfiles([]);
            setFilteredPaymentProfiles([]);
        }
    }, [watchedClientID, watchedEntityCode, existingClientIDs]);

    // Function to add a new line item
    const handleAddLineItem = () => {
        setLineItems([...lineItems, { id: Date.now() }]);
    };

    // Function to remove a line item
    const handleRemoveLineItem = (index: number) => {
        if (lineItems.length > 1) {
            const updatedItems = [...lineItems];
            updatedItems.splice(index, 1);
            setLineItems(updatedItems);
            
            // Update form data
            const currentLineItems = form.getValues('lineItems') || [];
            const updatedFormItems = [...currentLineItems];
            updatedFormItems.splice(index, 1);
            form.setValue('lineItems', updatedFormItems, { shouldValidate: true });
        }
    };

    // Handle dialog close
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset form when closing
            form.reset();
            setFilteredPaymentProfiles([]);
            setClientInfo(null);
            setLineItems([{ id: Date.now() }]);
        }
    };

    // Updated submit function to include line items
    async function onSubmit(data: FormValues) {
        console.log(data);
        try {
            // TODO: Implement createInvoice API call
            successToast(`Invoice created for client ${data.clientID}`);
            handleOpenChange(false);
        } catch (error) {
            console.error('Error creating invoice:', error);
            errorToast('An error occurred while creating the invoice');
        }
    }

    // Overall loading state
    const isLoading = isLoadingEntities || isLoadingClientIDs;

    // Calculate total amount
    const calculateTotal = () => {
        return (form.getValues('lineItems') || [])
            .reduce((total, item) => {
                const unitPrice = item?.unitPrice || 0;
                const quantity = item?.quantity || 0;
                return total + (unitPrice * quantity);
            }, 0)
            .toFixed(2);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant='outline'>Create Invoice</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-7xl max-h-[80vh] overflow-y-auto bg-card'>
                {isLoading ? (
                    <div className='flex flex-col items-center justify-center h-full p-12 space-y-4'>
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        <p className="text-muted-foreground">Loading form data...</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className='pb-4'>
                            <DialogTitle className='text-xl flex items-center gap-2'>
                                <FileText className='h-6 w-6 text-primary' />
                                Create New Invoice
                            </DialogTitle>
                            <DialogDescription className='text-muted-foreground text-sm'>
                                Complete all required fields to create a new invoice for your client
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className='grid grid-cols-5 gap-6'
                            >
                                {/* Left Column - Client and Line Items */}
                                <div className='col-span-3 grid grid-cols-1 gap-6'>
                                    {/* Client Details Section */}
                                    <div className='bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm'>
                                        <h3 className='text-md font-semibold flex items-center border-b pb-2'>
                                            <span className='inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center'>
                                                <div className='mt-0.5'>1</div>
                                            </span>
                                            Client Information
                                        </h3>
                                        
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12 md:col-span-6">
                                                <FormField
                                                    control={form.control}
                                                    name='entityCode'
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-muted-foreground'>
                                                                Entity
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <SelectTrigger className='w-full bg-background'>
                                                                        <SelectValue placeholder='Select an entity' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {entities.map((entity) => (
                                                                            <SelectItem
                                                                                key={entity.entityCode}
                                                                                value={entity.entityCode}
                                                                            >
                                                                                {entity.entityName}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className='col-span-9 md:col-span-5'>
                                                <FormField
                                                    control={form.control}
                                                    name='clientID'
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-muted-foreground'>
                                                                Client ID
                                                            </FormLabel>
                                                            <Popover
                                                                open={open}
                                                                onOpenChange={setOpen}
                                                            >
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant='outline'
                                                                            role='combobox'
                                                                            aria-expanded={open}
                                                                            className={cn(
                                                                                'w-full justify-between bg-background',
                                                                                !field.value && 'text-muted-foreground'
                                                                            )}
                                                                        >
                                                                            {field.value
                                                                                ? `Client ${field.value}`
                                                                                : 'Search client ID...'}
                                                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className='w-full p-0'>
                                                                    <Command>
                                                                        <CommandInput
                                                                            placeholder='Search client ID...'
                                                                            className='h-9'
                                                                        />
                                                                        <CommandEmpty>
                                                                            No client ID found.
                                                                        </CommandEmpty>
                                                                        <CommandGroup className='max-h-60 overflow-auto'>
                                                                            {existingClientIDs.map((id) => (
                                                                                <CommandItem
                                                                                    key={id}
                                                                                    value={id.toString()}
                                                                                    onSelect={() => {
                                                                                        setValue('clientID', id);
                                                                                        setOpen(false);
                                                                                    }}
                                                                                >
                                                                                    <Check
                                                                                        className={cn(
                                                                                            'mr-2 h-4 w-4',
                                                                                            field.value === id
                                                                                                ? 'opacity-100'
                                                                                                : 'opacity-0'
                                                                                        )}
                                                                                    />
                                                                                    Client {id}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className='col-span-3 md:col-span-1'>
                                                <FormLabel className='text-muted-foreground'>
                                                    QB
                                                </FormLabel>
                                                <div className='flex items-center justify-center h-10'>
                                                    {clientInfo?.quickbooks === undefined && (
                                                        <Button
                                                            disabled
                                                            className='h-8 w-8 rounded-full p-0 bg-muted'
                                                        >
                                                            <Unplug className='w-4 h-4' />
                                                        </Button>
                                                    )}
                                                    {clientInfo?.quickbooks[
                                                        watchedEntityCode as keyof Quickbooks
                                                    ] && (
                                                        <Button
                                                            disabled
                                                            className='h-8 w-8 rounded-full p-0 bg-success'
                                                        >
                                                            <CircleCheck className='w-4 h-4' />
                                                        </Button>
                                                    )}
                                                    {clientInfo?.quickbooks[
                                                        watchedEntityCode as keyof Quickbooks
                                                    ] === false && (
                                                        <Button 
                                                            className='h-8 w-8 rounded-full p-0 bg-destructive'
                                                        >
                                                            <CircleX className='w-4 h-4' />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <FormLabel className='text-muted-foreground'>
                                                    Company Name
                                                </FormLabel>
                                                {isLoadingClient ? (
                                                    <Skeleton className='h-10 w-full mt-2 rounded-md' />
                                                ) : (
                                                    <Input
                                                        value={clientInfo?.companyName || ''}
                                                        disabled
                                                        placeholder='Select a client'
                                                        className='mt-2 bg-background/50'
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <FormLabel className='text-muted-foreground'>
                                                    Primary Contact
                                                </FormLabel>
                                                {isLoadingClient ? (
                                                    <Skeleton className='h-10 w-full mt-2 rounded-md' />
                                                ) : (
                                                    <Input
                                                        value={clientInfo?.primaryContact || ''}
                                                        disabled
                                                        placeholder='Select a client'
                                                        className='mt-2 bg-background/50'
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name='paymentProfileID'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-muted-foreground'>
                                                        Payment Profile
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            disabled={
                                                                isLoadingClient ||
                                                                filteredPaymentProfiles.length === 0
                                                            }
                                                        >
                                                            <SelectTrigger className='w-full bg-background'>
                                                                <SelectValue
                                                                    placeholder={
                                                                        isLoadingClient
                                                                            ? 'Loading profiles...'
                                                                            : filteredPaymentProfiles.length === 0
                                                                                ? 'No profiles available'
                                                                                : 'Select a payment profile'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredPaymentProfiles.map((profile) => (
                                                                    <SelectItem
                                                                        key={profile.paymentProfileID}
                                                                        value={profile.paymentProfileID}
                                                                    >
                                                                        {profile.cardType || 'Card'}{' '}
                                                                        ••••{' '}
                                                                        {profile.lastFour}{' '}
                                                                        -{' '}
                                                                        {profile.billingDetails.firstName}{' '}
                                                                        {profile.billingDetails.lastName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Invoice Line Items Section */}
                                    <div className='bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm'>
                                        <h3 className='text-md font-semibold flex items-center border-b pb-2'>
                                            <span className='inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center'>
                                                <div className='mt-0.5'>2</div>
                                            </span>
                                            Invoice Line Items
                                        </h3>
                                        
                                        <div className='grid grid-cols-12 gap-2 font-medium text-xs mb-2 text-muted-foreground px-2'>
                                            <div className='col-span-6'>SERVICE ITEM</div>
                                            <div className='col-span-3'>UNIT PRICE</div>
                                            <div className='col-span-2'>QUANTITY</div>
                                            <div className='col-span-1'></div>
                                        </div>
                                        
                                        <div className='max-h-[22vh] overflow-y-auto space-y-3 pr-1'>
                                            {lineItems.map((item, index) => (
                                                <div key={item.id} className='grid grid-cols-12 gap-3 items-center bg-background/60 p-3 rounded-md border border-border/30'>
                                                    <div className='col-span-6'>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                // Find the selected service
                                                                const service = mockServiceItems.find(s => s.Id === value);
                                                                
                                                                // Get current line items
                                                                const currentLineItems = form.getValues('lineItems') || Array(lineItems.length).fill({});
                                                                
                                                                // Create updated item with service details
                                                                const updatedItem = {
                                                                    ...currentLineItems[index],
                                                                    serviceId: value,
                                                                    unitPrice: service ? service.UnitPrice : 0,
                                                                    quantity: currentLineItems[index]?.quantity || 1
                                                                };
                                                                
                                                                // Update the form value
                                                                const updatedItems = [...currentLineItems];
                                                                updatedItems[index] = updatedItem;
                                                                form.setValue('lineItems', updatedItems, { shouldValidate: true });
                                                            }}
                                                        >
                                                            <SelectTrigger className="bg-background">
                                                                <SelectValue placeholder="Select a service" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mockServiceItems.map((service) => (
                                                                    <SelectItem key={service.Id} value={service.Id}>
                                                                        {service.Name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className='col-span-3'>
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                                            <Input
                                                                type="number"
                                                                placeholder="0.00"
                                                                className="pl-7 bg-background text-right"
                                                                value={form.getValues(`lineItems.${index}.unitPrice`) || ''}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value) || 0;
                                                                    const currentLineItems = form.getValues('lineItems') || Array(lineItems.length).fill({});
                                                                    const updatedItems = [...currentLineItems];
                                                                    updatedItems[index] = {
                                                                        ...updatedItems[index],
                                                                        unitPrice: value
                                                                    };
                                                                    form.setValue('lineItems', updatedItems, { shouldValidate: true });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='col-span-2'>
                                                        <Input
                                                            type="number"
                                                            placeholder="1"
                                                            min="1"
                                                            className="bg-background text-center"
                                                            value={form.getValues(`lineItems.${index}.quantity`) || ''}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 1;
                                                                const currentLineItems = form.getValues('lineItems') || Array(lineItems.length).fill({});
                                                                const updatedItems = [...currentLineItems];
                                                                updatedItems[index] = {
                                                                    ...updatedItems[index],
                                                                    quantity: value
                                                                };
                                                                form.setValue('lineItems', updatedItems, { shouldValidate: true });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='col-span-1 flex items-center justify-center'>
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleRemoveLineItem(index)}
                                                            disabled={lineItems.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="border-dashed flex items-center w-full"
                                            onClick={handleAddLineItem}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Service Item
                                        </Button>
                                    </div>
                                </div>

                                {/* Right Column - Invoice Preview */}
                                <div className='col-span-2 grid grid-cols-1 gap-6'>
                                    <div className='bg-background/40 p-6 rounded-lg border border-border/50 space-y-4 shadow-sm sticky top-0'>
                                        <h3 className='text-md font-semibold flex items-center border-b pb-2'>
                                            <span className='inline-block w-5 h-5 bg-primary/10 text-primary rounded-full mr-2 flex items-center justify-center text-xs text-center'>
                                                <div className='mt-0.5'>3</div>
                                            </span>
                                            Invoice Summary
                                        </h3>
                                        
                                        {/* Entity Info */}
                                        <div className='space-y-1 mb-4'>
                                            <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-medium'>Entity</h3>
                                            <div className='bg-background p-2 rounded-md text-sm'>
                                                {watchedEntityCode ? 
                                                    entities.find(e => e.entityCode === watchedEntityCode)?.entityName || watchedEntityCode
                                                    : 
                                                    <span className='text-muted-foreground italic'>Not selected</span>
                                                }
                                            </div>
                                        </div>
                                        
                                        {/* Client Info */}
                                        <div className='space-y-1 mb-4'>
                                            <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-medium'>Client</h3>
                                            <div className='bg-background p-2 rounded-md'>
                                                {watchedClientID ? (
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">ID:</span>
                                                            <span className="font-medium">{watchedClientID}</span>
                                                        </div>
                                                        {clientInfo?.companyName && (
                                                            <div className="font-medium truncate" title={clientInfo?.companyName}>
                                                                {clientInfo?.companyName}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className='italic text-muted-foreground text-sm'>Not selected</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Payment Profile */}
                                        <div className='space-y-1'>
                                            <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-medium'>Payment Method</h3>
                                            <div className='bg-background p-2 rounded-md text-sm'>
                                                {form.watch('paymentProfileID') ? 
                                                    (() => {
                                                        const profile = filteredPaymentProfiles.find(
                                                            p => p.paymentProfileID === form.watch('paymentProfileID')
                                                        );
                                                        return profile ? 
                                                            <div className="font-medium">
                                                                {profile.cardType || 'Card'} •••• {profile.lastFour}
                                                            </div>
                                                            : 
                                                            <span className='italic text-muted-foreground'>Invalid profile</span>;
                                                    })()
                                                    : 
                                                    <span className='italic text-muted-foreground'>Not selected</span>
                                                }
                                            </div>
                                        </div>
                                        
                                        {/* Services List */}
                                        <div className='space-y-1'>
                                            <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-medium'>Services</h3>
                                            <div className='bg-background rounded-md overflow-hidden'>
                                                <div className="max-h-[20vh] overflow-y-auto">
                                                    {(form.getValues('lineItems') || []).map((item, index) => {
                                                        if (!item?.serviceId) return null;
                                                        
                                                        const service = mockServiceItems.find(s => s.Id === item.serviceId);
                                                        const unitPrice = item.unitPrice || 0;
                                                        const quantity = item.quantity || 0;
                                                        const itemTotal = unitPrice * quantity;
                                                        
                                                        if (!service) return null;
                                                        
                                                        return (
                                                            <div key={index} className='p-3 border-b border-border/30 last:border-b-0'>
                                                                <div className='font-medium truncate text-sm' title={service.Name}>
                                                                    {service.Name.length > 20 ? 
                                                                        service.Name.substring(0, 20) + '...' 
                                                                        : 
                                                                        service.Name
                                                                    }
                                                                </div>
                                                                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                                                                    <span>${unitPrice.toFixed(2)} × {quantity}</span>
                                                                    <span className='font-medium'>${itemTotal.toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    
                                                    {!(form.getValues('lineItems') || []).some(item => item?.serviceId) && (
                                                        <div className='p-3 italic text-muted-foreground text-sm'>
                                                            No services selected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Total Section */}
                                        <div className="mt-4">
                                            <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">TOTAL DUE</span>
                                                    <span className="font-bold text-xl text-primary">
                                                        ${calculateTotal()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer - Full Width */}
                                <div className='col-span-5 flex justify-end gap-2 pt-4 border-t mt-2'>
                                    <Button
                                        variant='outline'
                                        type='button'
                                        onClick={() => handleOpenChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant='default'
                                        type='submit'
                                        disabled={isSubmitting || !isValid || !isDirty}
                                        className="min-w-32"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-pulse mr-2">•••</span>
                                                Processing
                                            </>
                                        ) : 'Create Invoice'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

