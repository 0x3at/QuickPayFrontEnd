import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ClientTable } from "./client-table"
import { InvoiceTable } from "./invoice-table"

export function DashboardTabs() {
  return (
    <Tabs defaultValue="clients">
      <TabsList className="grid w-1/3 grid-cols-2">
        <TabsTrigger value="clients">Clients</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>
      <TabsContent value="clients">
        <ClientTable />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoiceTable />
      </TabsContent>
    </Tabs>
  )
}
