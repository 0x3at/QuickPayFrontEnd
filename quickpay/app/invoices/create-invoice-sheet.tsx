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
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    getEntities,
    getClientIDs,
    getClient,
    Entity,
} from '@/hooks/api-hooks';
import { PaymentProfile, Quickbooks } from '@/lib/types';
import { errorToast, successToast } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export function CreateInvoiceSheet() {
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

    // Fetch entities and client IDs on component mount
    useEffect(() => {
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

        loadInitialData();
    }, []);

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

    // Updated submit function to include line items
    async function onSubmit(data: FormValues) {
        console.log(data);
        // TODO: Implement createInvoice API call
        successToast(`Invoice created for client ${data.clientID}`);
        form.reset();
        setFilteredPaymentProfiles([]);
        setClientInfo(null);
        setLineItems([{ id: Date.now() }]);
    }

    // Overall loading state
    const isLoading = isLoadingEntities || isLoadingClientIDs;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant='outline'>Create Invoice</Button>
            </SheetTrigger>
            <SheetContent className='w-full px-4' side='bottom'>
                {isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                        <p>Loading form data...</p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-4'
                        >
                            <SheetHeader>
                                <SheetTitle>Create Invoice</SheetTitle>
                            </SheetHeader>
                            <div className='grid grid-cols-4 gap-4'>
                                <div className='col-span-1 grid gap-4 py-4'>
                                    <Card className='p-4 border-completed'>
                                        <CardTitle className='text-lg font-bold text-center'>
                                            Client Information
                                        </CardTitle>
                                        <FormField
                                            control={form.control}
                                            name='entityCode'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Entity
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select an entity' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {entities.map(
                                                                    (
                                                                        entity
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                entity.entityCode
                                                                            }
                                                                            value={
                                                                                entity.entityCode
                                                                            }
                                                                        >
                                                                            {
                                                                                entity.entityName
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className='grid grid-cols-3 gap-4'>
                                            <FormField
                                                control={form.control}
                                                name='clientID'
                                                render={({ field }) => (
                                                    <FormItem className='col-span-2 flex flex-col'>
                                                        <FormLabel>
                                                            Client ID
                                                        </FormLabel>
                                                        <Popover
                                                            open={open}
                                                            onOpenChange={
                                                                setOpen
                                                            }
                                                        >
                                                            <PopoverTrigger
                                                                asChild
                                                            >
                                                                <FormControl>
                                                                    <Button
                                                                        variant='outline'
                                                                        role='combobox'
                                                                        aria-expanded={
                                                                            open
                                                                        }
                                                                        className={cn(
                                                                            'w-full justify-between',
                                                                            !field.value &&
                                                                            'text-muted-foreground'
                                                                        )}
                                                                    >
                                                                        {field.value
                                                                            ? `Client ${field.value}`
                                                                            : 'Search by client ID...'}
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
                                                                        No
                                                                        client
                                                                        ID
                                                                        found.
                                                                    </CommandEmpty>
                                                                    <CommandGroup className='max-h-60 overflow-auto'>
                                                                        {existingClientIDs.map(
                                                                            (
                                                                                id
                                                                            ) => (
                                                                                <CommandItem
                                                                                    key={
                                                                                        id
                                                                                    }
                                                                                    value={id.toString()}
                                                                                    onSelect={() => {
                                                                                        setValue(
                                                                                            'clientID',
                                                                                            id
                                                                                        );
                                                                                        setOpen(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <Check
                                                                                        className={cn(
                                                                                            'mr-2 h-4 w-4',
                                                                                            field.value ===
                                                                                                id
                                                                                                ? 'opacity-100'
                                                                                                : 'opacity-0'
                                                                                        )}
                                                                                    />
                                                                                    Client{' '}
                                                                                    {
                                                                                        id
                                                                                    }
                                                                                </CommandItem>
                                                                            )
                                                                        )}
                                                                    </CommandGroup>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className='col-span-1 flex items-center justify-center'>
                                                <div className='flex flex-col items-center justify-center'>
                                                    <p className='text-xs mb-1'>
                                                        Quickbooks Status
                                                    </p>
                                                    {clientInfo?.quickbooks ===
                                                        undefined && (
                                                            <Button
                                                                disabled
                                                                className='h-full w-full bg-muted'
                                                            >
                                                                <Unplug className='w-4 h-4' />
                                                            </Button>
                                                        )}
                                                    {clientInfo?.quickbooks[
                                                        watchedEntityCode as keyof Quickbooks
                                                    ] && (
                                                            <Button
                                                                disabled
                                                                className='h-full w-full bg-success'
                                                            >
                                                                <CircleCheck className='w-4 h-4' />
                                                            </Button>
                                                        )}
                                                    {clientInfo?.quickbooks[
                                                        watchedEntityCode as keyof Quickbooks
                                                    ] === false && (
                                                            <Button className='h-full w-full bg-error'>
                                                                <CircleX className='w-4 h-4' />
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='space-y-4'>
                                            <div>
                                                <FormLabel>
                                                    Company Name
                                                </FormLabel>
                                                {isLoadingClient ? (
                                                    <Skeleton className='h-10 w-full mt-2' />
                                                ) : (
                                                    <Input
                                                        value={
                                                            clientInfo?.companyName ||
                                                            ''
                                                        }
                                                        disabled
                                                        placeholder='Select a client'
                                                        className={
                                                            'mt-2 bg-muted'
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <FormLabel>
                                                    Primary Contact
                                                </FormLabel>
                                                {isLoadingClient ? (
                                                    <Skeleton className='h-10 w-full mt-2' />
                                                ) : (
                                                    <Input
                                                        value={
                                                            clientInfo?.primaryContact ||
                                                            ''
                                                        }
                                                        disabled
                                                        placeholder='Select a client'
                                                        className={
                                                            'mt-2 bg-muted'
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name='paymentProfileID'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Payment Profile
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                            disabled={
                                                                isLoadingClient ||
                                                                filteredPaymentProfiles.length ===
                                                                0
                                                            }
                                                        >
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue
                                                                    placeholder={
                                                                        isLoadingClient
                                                                            ? 'Loading profiles...'
                                                                            : filteredPaymentProfiles.length ===
                                                                                0
                                                                                ? 'No profiles available'
                                                                                : 'Select a payment profile'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredPaymentProfiles.map(
                                                                    (
                                                                        profile
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                profile.paymentProfileID
                                                                            }
                                                                            value={
                                                                                profile.paymentProfileID
                                                                            }
                                                                        >
                                                                            {profile.cardType ||
                                                                                'Card'}{' '}
                                                                            ••••{' '}
                                                                            {
                                                                                profile.lastFour
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                profile
                                                                                    .billingDetails
                                                                                    .firstName
                                                                            }{' '}
                                                                            {
                                                                                profile
                                                                                    .billingDetails
                                                                                    .lastName
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </Card>
                                </div>
                                <div className='col-span-2 grid gap-4 py-4'>
                                    <Card className='p-4 border-completed'>
                                        <CardTitle className='text-lg font-bold text-center'>
                                            Invoice Information
                                        </CardTitle>
                                        <div className='mt-4'>
                                            <div className='grid grid-cols-12 gap-2 font-medium text-sm mb-2'>
                                                <div className='col-span-6'>Service Name</div>
                                                <div className='col-span-3'>Unit Price($)</div>
                                                <div className='col-span-2'>Quantity</div>
                                                <div className='col-span-1'></div>
                                            </div>
                                            
                                            <div className='max-h-60 overflow-y-auto pr-2'>
                                                {lineItems.map((item, index) => (
                                                    <div key={item.id} className='grid grid-cols-12 gap-2 mb-3'>
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
                                                                <SelectTrigger>
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
                                                            <Input
                                                                type="number"
                                                                placeholder="0.00"
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
                                                        <div className='col-span-2'>
                                                            <Input
                                                                type="number"
                                                                placeholder="1"
                                                                min="1"
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
                                                                onClick={() => handleRemoveLineItem(index)}
                                                                disabled={lineItems.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className='flex justify-end mb-2 mt-3 mr-6'>
                                                <div className='flex items-center gap-2 bg-muted p-2 rounded-md border-success border-1'>
                                                    <span className='font-bold text-lg text-success'>
                                                        Total: ${
                                                            (form.getValues('lineItems') || [])
                                                                .reduce((total, item) => {
                                                                    const unitPrice = item?.unitPrice || 0;
                                                                    const quantity = item?.quantity || 0;
                                                                    return total + (unitPrice * quantity);
                                                                }, 0)
                                                                .toFixed(2)
                                                        }
                                                    </span>
                                                </div>
                                             </div>
                                            
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2"
                                                onClick={handleAddLineItem}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Service
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                                <div className='col-span-1 grid gap-4 py-4'>
                                    <Card className='p-4 border-completed'>
                                        <CardTitle className='text-lg font-bold text-center'>
                                            Invoice Preview
                                        </CardTitle>
                                        <div className='mt-4 space-y-4 text-sm'>
                                            {/* Entity Info */}
                                            <div className='space-y-1'>
                                                <h3 className='font-semibold text-muted-foreground'>Entity</h3>
                                                <div className='bg-muted p-2 rounded-md'>
                                                    {watchedEntityCode ? 
                                                        entities.find(e => e.entityCode === watchedEntityCode)?.entityName || watchedEntityCode
                                                        : 
                                                        <span className='text-muted-foreground italic'>Not selected</span>
                                                    }
                                                </div>
                                            </div>
                                            
                                            {/* Client Info */}
                                            <div className='space-y-1'>
                                                <h3 className='font-semibold text-muted-foreground'>Client</h3>
                                                <div className='bg-muted p-2 rounded-md space-y-1'>
                                                    <div>ID: {watchedClientID || <span className='italic text-muted-foreground'>Not selected</span>}</div>
                                                    <div>
                                                        {clientInfo?.companyName || <span className='italic text-muted-foreground'>Not selected</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Payment Profile */}
                                            <div className='space-y-1'>
                                                <h3 className='font-semibold text-muted-foreground'>Payment Method</h3>
                                                <div className='bg-muted p-2 rounded-md'>
                                                    {form.watch('paymentProfileID') ? 
                                                        (() => {
                                                            const profile = filteredPaymentProfiles.find(
                                                                p => p.paymentProfileID === form.watch('paymentProfileID')
                                                            );
                                                            return profile ? 
                                                                `${profile.cardType || 'Card'} •••• ${profile.lastFour}`
                                                                : 
                                                                <span className='italic text-muted-foreground'>Invalid profile</span>;
                                                        })()
                                                        : 
                                                        <span className='italic text-muted-foreground'>Not selected</span>
                                                    }
                                                </div>
                                            </div>
                                            
                                            {/* Services Summary */}
                                            <div className='space-y-1'>
                                                <h3 className='font-semibold text-muted-foreground'>Services</h3>
                                                <div className='max-h-40 overflow-y-auto bg-muted rounded-md'>
                                                    {(form.getValues('lineItems') || []).map((item, index) => {
                                                        if (!item?.serviceId) return null;
                                                        
                                                        const service = mockServiceItems.find(s => s.Id === item.serviceId);
                                                        const unitPrice = item.unitPrice || 0;
                                                        const quantity = item.quantity || 0;
                                                        const itemTotal = unitPrice * quantity;
                                                        
                                                        if (!service) return null;
                                                        
                                                        return (
                                                            <div key={index} className='p-2 border-b last:border-b-0 border-border'>
                                                                <div className='font-medium truncate' title={service.Name}>
                                                                    {service.Name.length > 25 ? 
                                                                        service.Name.substring(0, 25) + '...' 
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
                                                        <div className='p-2 italic text-muted-foreground'>
                                                            No services selected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Total */}
                                            <div className='bg-primary-foreground p-3 rounded-md'>
                                                <div className='flex justify-between items-center'>
                                                    <span className='font-bold'>TOTAL</span>
                                                    <span className='font-bold text-xl'>
                                                        ${
                                                            (form.getValues('lineItems') || [])
                                                                .reduce((total, item) => {
                                                                    const unitPrice = item?.unitPrice || 0;
                                                                    const quantity = item?.quantity || 0;
                                                                    return total + (unitPrice * quantity);
                                                                }, 0)
                                                                .toFixed(2)
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                            <SheetFooter>
                                <Button
                                    type='submit'
                                    disabled={
                                        isSubmitting || !isValid || !isDirty
                                    }
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    );
}
