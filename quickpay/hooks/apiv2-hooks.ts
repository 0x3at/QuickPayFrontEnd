import { useState, useEffect, useCallback } from 'react';
import { apiV2Request } from '@/lib/apiv2-client';
import { errorToast } from '@/lib/utils';
import {
  // Response types
  ClientListResponseV2,
  ClientIDsResponseV2,
  ClientExistsResponseV2,
  SalespeopleResponseV2,
  ClientDetailResponseV2,
  EntityListResponseV2,
  PaymentProfilesResponseV2,
  InvoicesResponseV2,

  // Payload types
  CreateClientPayloadV2,
  EditClientPayloadV2,
  AddNotePayloadV2,
  CreatePaymentProfilePayloadV2,
  SetDefaultPaymentMethodPayloadV2,
  DeletePaymentMethodPayloadV2
} from '@/lib/typesV2';

// Generic hook for fetching any V2 API resource
export function useApiV2Resource<T>(
  endpoint: string,
  options: {
    skip?: boolean;
    dependencies?: any[];
    initialData?: T;
  } = {}
) {
  const { skip = false, dependencies = [], initialData = null } = options;

  // State
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  // Fetch function that can be called manually
  const fetchData = useCallback(async () => {
    if (skip) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await apiV2Request<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Keep the previous data if there's an error
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, skip]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

// CLIENT ENDPOINTS

// Get list of clients with pagination and filtering
export function useClientsV2(options: {
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  skip?: boolean;
} = {}) {
  const { active = true, search = '', limit = 100, offset = 0, skip = false } = options;

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('active', active.toString());
  if (search) queryParams.append('search', search);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());

  return useApiV2Resource<ClientListResponseV2>(
    `/clients/?${queryParams.toString()}`,
    {
      skip,
      dependencies: [active, search, limit, offset]
    }
  );
}

// Get client IDs
export function useClientIDsV2(skip = false) {
  return useApiV2Resource<ClientIDsResponseV2>(
    '/clients/ids/',
    { skip }
  );
}

// Check if client exists
export function useClientExistsV2(clientID?: number, email?: string) {
  const queryParams = new URLSearchParams();
  if (clientID) queryParams.append('clientID', clientID.toString());
  if (email) queryParams.append('email', email);

  const shouldSkip = !clientID && !email;

  return useApiV2Resource<ClientExistsResponseV2>(
    `/clients/exists/?${queryParams.toString()}`,
    {
      skip: shouldSkip,
      dependencies: [clientID, email]
    }
  );
}

// Get salespeople list
export function useSalespeopleV2(skip = false) {
  return useApiV2Resource<SalespeopleResponseV2>(
    '/clients/salespeople/',
    { skip }
  );
}

// Get client details
export function useClientDetailsV2(clientID: number, skip = false) {
  return useApiV2Resource<ClientDetailResponseV2>(
    `/clients/${clientID}/`,
    {
      skip: skip || !clientID,
      dependencies: [clientID]
    }
  );
}

// Get client payment methods
export function useClientPaymentMethodsV2(
  clientID: number,
  entityCode?: string,
  skip = false
) {
  const queryParams = new URLSearchParams();
  if (entityCode) queryParams.append('entityCode', entityCode);

  return useApiV2Resource<PaymentProfilesResponseV2>(
    `/clients/${clientID}/payment-1methods/?${queryParams.toString()}`,
    {
      skip: skip || !clientID,
      dependencies: [clientID, entityCode]
    }
  );
}

// Get client invoices
export function useClientInvoicesV2(
  clientID: number,
  options: {
    entityCode?: string;
    status?: string;
    skip?: boolean;
  } = {}
) {
  const { entityCode, status, skip = false } = options;

  const queryParams = new URLSearchParams();
  if (entityCode) queryParams.append('entityCode', entityCode);
  if (status) queryParams.append('status', status);

  return useApiV2Resource<InvoicesResponseV2>(
    `/clients/${clientID}/invoices/?${queryParams.toString()}`,
    {
      skip: skip || !clientID,
      dependencies: [clientID, entityCode, status]
    }
  );
}

// ENTITY ENDPOINTS

// Get all entities
export function useEntitiesV2(skip = false) {
  return useApiV2Resource<EntityListResponseV2>(
    '/entities/',
    { skip }
  );
}

// Get entity details
export function useEntityDetailsV2(entityCode: string, skip = false) {
  return useApiV2Resource<EntityListResponseV2>(
    `/entities/detail/?entityCode=${entityCode}`,
    {
      skip: skip || !entityCode,
      dependencies: [entityCode]
    }
  );
}

// INVOICE ENDPOINTS

// Get all invoices with filtering
export function useInvoicesV2(options: {
  entityCode?: string;
  status?: string;
  limit?: number;
  offset?: number;
  skip?: boolean;
} = {}) {
  const { entityCode, status, limit = 100, offset = 0, skip = false } = options;

  const queryParams = new URLSearchParams();
  if (entityCode) queryParams.append('entityCode', entityCode);
  if (status) queryParams.append('status', status);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());

  return useApiV2Resource<InvoicesResponseV2>(
    `/invoices/?${queryParams.toString()}`,
    {
      skip,
      dependencies: [entityCode, status, limit, offset]
    }
  );
}

// MUTATION FUNCTIONS (for POST, PUT, DELETE operations)

// Create a client
export async function createClientV2(payload: CreateClientPayloadV2) {
  return apiV2Request<ClientDetailResponseV2>('/clients/', {
    method: 'POST',
    body: payload,
    showSuccessToast: true,
    successMessage: 'Client created successfully'
  });
}

// Edit a client
export async function editClientV2(clientID: number, payload: EditClientPayloadV2) {
  return apiV2Request<ClientDetailResponseV2>(`/clients/update/${clientID}/`, {
    method: 'PUT',
    body: payload,
    showSuccessToast: true,
    successMessage: 'Client updated successfully'
  });
}

// Add a note to a client
export async function addClientNoteV2(clientID: number, payload: AddNotePayloadV2) {
  return apiV2Request<{ note: AddNotePayloadV2 & { noteID: number, createdAt: string, archived: boolean } }>(
    `/clients/${clientID}/notes/create/`,
    {
      method: 'POST',
      body: payload,
      showSuccessToast: true,
      successMessage: 'Note added successfully'
    }
  );
}

// Create a payment profile
export async function createPaymentProfileV2(payload: CreatePaymentProfilePayloadV2) {
  return apiV2Request<PaymentProfilesResponseV2>('/payment-profiles/create/', {
    method: 'POST',
    body: payload,
    showSuccessToast: true,
    successMessage: 'Payment method added successfully'
  });
}

// Set default payment method
export async function setDefaultPaymentMethodV2(payload: SetDefaultPaymentMethodPayloadV2) {
  const { clientID, customerProfileID, paymentProfileID } = payload;
  return apiV2Request<PaymentProfilesResponseV2>(
    `/clients/${clientID}/payment-methods/set-default`,
    {
      method: "PUT",
      body: {
        customerProfileID: customerProfileID,
        paymentProfileID: paymentProfileID,
      },
      showSuccessToast: true,
      successMessage: "Default payment method updated",
    });
}

// Delete a payment method
export async function deletePaymentMethodV2(payload: DeletePaymentMethodPayloadV2) {
  const { clientID, paymentProfileID, entityCode } = payload;
  const endpoint = entityCode
    ? `/clients/${clientID}/payment-methods/${paymentProfileID}?entityCode=${entityCode}`
    : `/clients/${clientID}/payment-methods/${paymentProfileID}`;

  return apiV2Request<{ success: boolean }>(endpoint, {
    method: 'POST',
    showSuccessToast: true,
    successMessage: 'Payment method deleted successfully'
  });
}
