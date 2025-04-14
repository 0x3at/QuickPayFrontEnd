export type ClientDetails = {
	entities: string[];
	client: {
		clientID: number;
		primaryContact: string;
		companyName: string;
		salesPerson: string;
		email: string;
		wcCustomerProfileID: string;
		cgCustomerProfileID: string;
		vbcCustomerProfileID: string;
		clientStatus: string;
	};
	paymentProfiles: PaymentProfile[];
	transactions: Transaction[];
	invoices: Invoice[];
	notes: Note[];
    quickbooks: Quickbooks;
};

export type Quickbooks = {
    wc:Boolean;
    cg:Boolean;
    vbc:Boolean;
};

export type PaymentProfile = {
	isDefault: string;
	gateway: string;
	entity: string;
	status: string;
	note: string;
	createdAt: string;
	createdBy: string;
	customerProfileID: string;
	paymentProfileID: string;
	cardType: string;
	lastFour: string;
	expirationDate?: string;
	billingDetails: BillingDetails;
};

export type BillingDetails = {
	firstName: string;
	lastName: string;
	streetAddress: string;
	zipCode: string;
};

export type Transaction = {
	transactionID: string;
	amount: string;
	status: string;
	createdAt: string;
};

export type Invoice = {
	invoiceID: string;
	entityCode: string;
	clientID: number;
	paymentProfileID: string;
	invoiceStatus: string;
	invoiceTotal: string;
	createdAt: string;
	createdBy: string;
	approvedBy: string;
	approvedAt: string;
	collected: boolean;
	transactionID: string;
};

export type Note = {
	clientID: string | number;
	note: string;
	author: string;
	important: string;
	noteID: string | null;
	createdAt: string | null;
	archived: string | null;
};

export const entityNames = {
	wc: 'WholeSale Communications',
	cg: 'Contract Genie',
	vbc: 'Voice Broadcasting',
};

// Define the PaymentMethodPayload type
export type PaymentMethodPayload = {
    billingDetails: {
        firstName: string;
        lastName: string;
        streetAddress: string;
        zipCode: string;
    };
    CardDetails: {
        cardCode: string;
        cardNumber: string;
        expirationDate: string;
    };
    clientID: number;
    note?: string;
};

// Define the response type
export type PaymentProfileResponse = {
    entities: Array<{[key: string]: string}>;
    clientID: number;
    paymentProfiles: Array<{
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
        billingDetails: {
            firstName: string;
            lastName: string;
            streetAddress: string;
            zipCode: string;
        }
    }>;
};
