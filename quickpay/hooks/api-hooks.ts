// hooks/api-hooks.ts
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-client';
import { errorToast, successToast } from '@/lib/utils';
import { useForm, FormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ClientDetails, Invoice, Note, PaymentMethodPayload, PaymentProfileResponse } from '@/lib/types';

export type Client = {
    clientID: number
    companyName: string
    primaryContact: string
    email: string
    clientStatus: string
}

export type Entity = {
    entityCode: string
    entityName: string
}

// Generic hook for fetching any API resource
export function useApiResource<T>(
    endpoint: string,  // API endpoint to fetch from
    fallbackData?: T,  // Optional fallback data
    deps: any[] = []   // Dependencies array (like in useEffect)
) {
    // State for the data
    const [data, setData] = useState<T | null>(null);
    // Loading state for showing spinners etc.
    const [isLoading, setIsLoading] = useState(true);
    // Error state for handling errors
    const [error, setError] = useState<Error | null>(null);

    // Run effect when dependencies change
    useEffect(() => {
        let isMounted = true;  // Track component mounted state

        async function fetchData() {
            try {
                setIsLoading(true);
                // Use our API client to fetch data
                const result = await apiRequest<T>(endpoint, { fallbackData });

                // Only update state if component is still mounted
                if (isMounted) {
                    setData(result);
                    setError(null);
                }
            } catch (err) {
                console.error('API error:', err);
                // Handle errorss
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    // Use fallback data if provided
                    if (fallbackData !== undefined) {
                        setData(fallbackData);
                    }
                }
            } finally {
                // Always mark loading as complete
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchData();

        // Cleanup function
        return () => {
            isMounted = false;  // Prevent state updates if component unmounts
        };
    }, deps);  // Re-run when dependencies change

    // Return everything needed by components
    return {
        data,
        isLoading,
        error,
        // You could add a refetch function here to manually trigger a refresh
        refetch: () => { }
    };
}

// Specific hook for fetching sales reps
export function useSalesReps() {
    return useApiResource<{ salespeople: string[] }>(
        '/client/salespeople'
    );
}

// Specific hook for checking if a client ID exists
export async function checkClientIdExists(clientID: number): Promise<boolean> {
    try {
        const data = await apiRequest<{ exists: boolean }>(
            `/client/exists`, {
            method: 'POST',
            body: { clientID: clientID }
        }
        );
        return data.exists;
    } catch (error) {
        errorToast(`Error checking if client ID exists: ${error}`);
        return false;
    }
}


// Specific hook for checking if a client ID exists
export async function getClientIDs(): Promise<number[]> {
    try {
        const data = await apiRequest<{ clientIDs: number[] }>(
            `/client/ids`, {
            method: 'GET',
        }
        );
        return data.clientIDs;
    } catch (error) {
        return [];
    }
}

// Specific hook for checking if a client ID exists
export async function getClientList(): Promise<Client[]> {
    try {
        const data = await apiRequest<{ clients: Client[] }>(
            `/clients`, {
            method: 'GET',
        }
        );
        return data.clients;
    } catch (error) {
        return [];
    }
}

// Function for creating a client
export async function getClient(clientID: number): Promise<ClientDetails> {
    return apiRequest('/client', {
        method: 'POST',
        body: { clientID: clientID }
    });
}

// Function for creating a client
export async function getEntities(): Promise<{ entities: Entity[] }> {
    return apiRequest('/entities', {
        method: 'POST',
    });
}

// Function for creating a client
export async function getClientInvoiceList(clientID: number): Promise<InvoiceList> {
    return apiRequest('/client/invoices', {
        method: 'POST',
        body: { clientID: clientID }
    });
}

export type InvoiceList = {
    invoices: Invoice[]
}

export async function getInvoiceList(): Promise<InvoiceList> {
    return apiRequest('/invoices', {
        method: 'GET',
    });
}
// Function for creating a client
export async function createClient(clientData: any) {
    return apiRequest('/client/create', {
        method: 'POST',
        body: {
            client:
            {
                clientID: clientData.clientID,
                companyName: clientData.companyName,
                primaryContact: clientData.primaryContact,
                email: clientData.email,
                salesPerson: clientData.salesperson
            }
        }
    });
}

export async function editClient(clientData: any): Promise<ClientDetails> {
    return apiRequest('/client/edit', {
        method: 'POST',
        body: {
            clientID: clientData.clientID,
            companyName: clientData.companyName,
            primaryContact: clientData.primaryContact,
            email: clientData.email,
            salesPerson: clientData.salesperson,
            clientStatus: clientData.clientStatus
        }
    });
}

export async function addClientNote(clientID: number, note: string, important: boolean, createdBy: string): Promise<{ note: Note }> {
    return apiRequest('/client/note/add', {
        method: 'POST',
        body: { clientID: clientID, note: note, important: important, createdBy: createdBy }
    });
}



export async function setDefaultPaymentMethod(clientID: number, paymentProfileID: string) {
    return apiRequest('/client/paymentmethod/setdefault', {
        method: 'POST',
        body: { clientID: clientID, paymentProfileID: paymentProfileID }
    });
}


// New implementation of addPaymentMethod that accepts the complete payload
export async function addPaymentMethod(payload: PaymentMethodPayload): Promise<PaymentProfileResponse> {
    return apiRequest<PaymentProfileResponse>('/client/paymentmethod/create', {
        method: 'POST',
        body: payload
    });
}

export async function deletePaymentMethod(payload: any) {
    return apiRequest('/client/paymentmethod/delete', {
        method: 'POST',
        body:
            payload.entityCode ? {
                clientID: payload.clientID,
                paymentProfileID: payload.paymentProfileID,
                entityCode: payload.entityCode
            } : {
                clientID: payload.clientID,
                paymentProfileID: payload.paymentProfileID
            }
    });
}
