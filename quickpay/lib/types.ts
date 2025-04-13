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
	clientID: string;
	note: string;
	author: string;
	important: string;
	noteID: string;
	createdAt: string;
	archived: string;
};

export const entityNames = {
	wc: 'WholeSale Communications',
	cg: 'Contract Genie',
	vbc: 'Voice Broadcasting',
};