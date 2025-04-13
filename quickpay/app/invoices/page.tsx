import { InvoiceTable } from "../invoice-table";
import { SiteHeader } from "@/components/site-header";
import { CreateInvoiceSheet } from "./create-invoice-sheet";
export default function InvoicePage() {
  return (
    <div className="container mx-auto p-4 ">
        <SiteHeader title="Invoices" actions={<CreateInvoiceSheet />} />
        <InvoiceTable />
    </div>
  );
}
