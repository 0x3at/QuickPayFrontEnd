import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceTable } from './client-invoice-table';
import { ClientDetailsPanel } from './client-details-panel';
import { ClientPaymentMethodsPanel } from './client-payment-methods-panel';
import { ClientNotesPanel } from './client-notes-panel';
export function DashboardTabs({ clientID }: { clientID: number }) {
	return (
		<Tabs defaultValue='invoices'>
			<TabsList className='grid w-full grid-cols-5'>
				<TabsTrigger value='details'>Details</TabsTrigger>
				<TabsTrigger value='payment-methods'>Payment Methods</TabsTrigger>
				<TabsTrigger value='invoices'>Invoices</TabsTrigger>
				<TabsTrigger value='transactions'>Transactions</TabsTrigger>
				<TabsTrigger value='notes'>Notes</TabsTrigger>
			</TabsList>
			<TabsContent value='details'>
				<ClientDetailsPanel clientID={clientID} />
			</TabsContent>
			<TabsContent value='payment-methods'>
				<ClientPaymentMethodsPanel clientID={clientID} />
			</TabsContent>
			<TabsContent value='invoices'>
				<InvoiceTable clientID={clientID} />
			</TabsContent>
			<TabsContent value='notes'>
				<ClientNotesPanel clientID={clientID} />
			</TabsContent>
		</Tabs>
	);
}
