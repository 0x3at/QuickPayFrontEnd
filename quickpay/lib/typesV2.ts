// Types for the V2 API responses

// Common types
export interface EntityBase {
  entityCode: string;
  entityName: string;
}

export interface ClientBase {
  clientID: number;
  primaryContact: string;
  companyName: string;
  salesPerson: string;
  email: string;
  clientStatus: string;
}

export interface BillingDetailsV2 {
  firstName: string;
  lastName: string;
  streetAddress: string;
  zipCode: string;
}

export interface CardDetailsV2 {
  cardNumber: string;
  expirationDate: string;
  cardCode: string;
}

// Entity related types
export interface EntityDetailV2 extends EntityBase {
  keyStatus: string;
  createdAt: string;
  updatedAt: string;
  renewsAt: string;
  gatewayID: string;
  publicClientKey: string;
  contactEmail: string;
  contactFirstName: string;
  contactLastName: string;
  realmID: string;
  quickbooksID: string;
  quickbooksName: string;
  isActive: boolean;
  quickbooksConnected: boolean;
}

export interface EntityListResponseV2 {
  entities: EntityDetailV2[];
}

// Client related types
export interface ClientDetailV2 extends ClientBase {
  wcCustomerProfileID: string;
  cgCustomerProfileID: string;
  vbcCustomerProfileID: string;
}

export interface ClientListItemV2 extends ClientBase {
  // Any additional fields specific to the list view
}

export interface ClientListResponseV2 {
  clients: ClientListItemV2[];
  metadata: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ClientExistsResponseV2 {
  exists: boolean;
}

export interface ClientIDsResponseV2 {
  clientIDs: number[];
}

export interface SalespeopleResponseV2 {
  salespeople: string[];
}

// Payment profile related types
export interface PaymentProfileV2 {
  isDefault: boolean;
  gateway: string;
  entity: string;
  status: string;
  note: string;
  createdAt: string;
  expirationDate: string;
  customerProfileID: string;
  paymentProfileID: string;
  cardType: string;
  lastFour: string;
  billingDetails: BillingDetailsV2;
}

export interface PaymentProfilesResponseV2 {
  clientID: number;
  entityCode: string | null;
  paymentProfiles: PaymentProfileV2[];
}

// Client mapping related types
export interface ClientMappingV2 {
  entityCode: string;
  entityName: string;
  customerProfileID: string;
  quickBooksID: string;
  status: string;
  quickbooksConnected: boolean;
}

// Transaction related types
export interface TransactionV2 {
  createdAt: string;
  clientID: number;
  amount: string;
  result: string;
  resultText: string;
  gateway: string;
  entity: string;
  invoiceID: number;
  authCode: string;
  networkTransID: string;
  accountNumber: string;
  accountType: string;
  error: string;
}

// Invoice related types
export interface InvoiceV2 {
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
  syncToken: string;
}

export interface InvoicesResponseV2 {
  clientID?: number;
  entityCode?: string;
  status?: string;
  invoices: InvoiceV2[];
  metadata?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Note related types
export interface NoteV2 {
  clientID: number;
  note: string;
  author: string;
  important: boolean | string;
  createdAt: string;
  noteID: number | string;
  archived: boolean | string;
}

// Client detail response (full client view)
export interface ClientDetailResponseV2 {
  client: ClientDetailV2;
  paymentProfiles: PaymentProfileV2[];
  transactions: TransactionV2[];
  invoices: InvoiceV2[];
  notes: NoteV2[];
  entities: string[];  // For backward compatibility
  entityMappings: ClientMappingV2[];
  quickbooks: {
    wc: boolean;
    cg: boolean;
    vbc: boolean;
  };
}

// Request payload types for POST requests
export interface CreateClientPayloadV2 {
  client: {
    clientID?: number;
    primaryContact: string;
    companyName: string;
    salesPerson: string;
    email: string;
  };
}

export interface EditClientPayloadV2 {
  clientID: number;
  primaryContact?: string;
  companyName?: string;
  salesPerson?: string;
  email?: string;
  clientStatus?: string;
}

export interface AddNotePayloadV2 {
  clientID: number;
  note: string;
  author: string;
  important: boolean;
}

export interface CreatePaymentProfilePayloadV2 {
  clientID: number;
  cardDetails: CardDetailsV2;
  billingDetails: BillingDetailsV2;
  note?: string;
  entity?: string;
}

export interface SetDefaultPaymentMethodPayloadV2 {
  clientID: number;
  paymentProfileID: string;
}

export interface DeletePaymentMethodPayloadV2 {
  clientID: number;
  paymentProfileID: string;
  entityCode?: string;
}
