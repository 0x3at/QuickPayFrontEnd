import { InvoiceTable } from "../invoice-table";
import { SiteHeader } from "@/components/site-header";
import { CreateInvoiceDialog } from "./create-invoice-sheet";
export default function InvoicePage() {
  return (
    <div className="container mx-auto p-4 ">
        <SiteHeader title="Invoices" actions={<CreateInvoiceDialog />} />
        <InvoiceTable />
    </div>
  );
}
