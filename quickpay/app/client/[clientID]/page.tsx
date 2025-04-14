"use client"

import { ClientHeader } from "@/components/client-header"
import { EditClientDialog } from "@/components/edit-client-popup"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClientDetailsV2 } from '@/hooks/apiv2-hooks'
import { ClientDetailResponseV2 } from '@/lib/typesV2'
import React, { useState, useEffect } from 'react'
import { InvoiceTable } from "./client-invoice-table"
import { ClientNotesPanel } from "./client-notes-panel"
import { ClientOverviewPanel } from "./client-overview-panel"
import { ClientPaymentMethodsPanel } from "./client-payment-methods-panel"
import { ClientTransactionsPanel } from "./client-transactions-panel"

export default function ClientPage({ params }: { params: Promise<{ clientID: string }> }) {
  const resolvedParams = React.use(params);
  const clientID: number = parseInt(resolvedParams.clientID, 10);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  // Use the V2 API hook to fetch client details
  const { 
    data: clientDetails, 
    isLoading, 
    error, 
    refetch: refreshClientData 
  } = useClientDetailsV2(clientID);

  if (isLoading || !clientDetails) {
    return (
      <div className="container mx-auto p-4">
        <SiteHeader title={`Client ${clientID}`} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading client information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <SiteHeader title={`Client ${clientID}`} />
        <div className="flex items-center justify-center h-64 text-error">
          <div>Error loading client: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <SiteHeader title={`Client ${clientID}`} />
      
      {/* Client Header */}
      <div className="mb-6">
        <ClientHeader 
          clientDetails={clientDetails} 
          onEdit={() => setIsEditDialogOpen(true)} 
        />

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 md:w-auto w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ClientOverviewPanel clientID={clientID} clientDetails={clientDetails} onRefresh={refreshClientData} />
          </TabsContent>
          
          <TabsContent value="payment" className="mt-6">
            <ClientPaymentMethodsPanel clientID={clientID} clientDetails={clientDetails} onRefresh={refreshClientData} />
          </TabsContent>
          
          <TabsContent value="invoices" className="mt-6">
            <InvoiceTable clientID={clientID} clientDetails={clientDetails} />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <ClientTransactionsPanel clientID={clientID} clientDetails={clientDetails} />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-6">
            <ClientNotesPanel clientID={clientID} clientDetails={clientDetails} onRefresh={refreshClientData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={clientDetails.client}
      />
    </div>
  );
}