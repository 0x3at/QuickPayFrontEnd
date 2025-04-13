import { SectionCards } from "@/components/section-cards";
import { DashboardTabs } from "./table-toggle";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="container mx-auto p-4 ">
      <SiteHeader title="QuickPay Dashboard" />
      <SectionCards />
      <div className="mt-6 mx-auto text-center">
        <DashboardTabs />
      </div>
    </div>
  );
}
