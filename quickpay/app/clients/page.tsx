import { Button } from "@/components/ui/button";
import { ClientTable } from "../client-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateClientSheet } from "./create-client-sheet";
import { SiteHeader } from "@/components/site-header";
export default function Home() {
  return (
    <div className="container mx-auto p-4 ">
      <SiteHeader title="Clients" actions={<CreateClientSheet />} />
      <div className="mt-6 mx-auto">
        <ClientTable />
      </div>
    </div>
  );
}
