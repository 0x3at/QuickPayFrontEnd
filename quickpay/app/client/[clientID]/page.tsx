"use client"

import React, { useEffect, useState } from 'react'
import { SiteHeader } from "@/components/site-header"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ClientInfoCard } from "./client-info-card"
import { ClientTable } from '@/app/client-table'
import { getClient } from '@/hooks/api-hooks'
import { DashboardTabs } from './client-tabs'


export default function ClientPage({ params }: { 
  params: Promise<{ clientID: string }> 
}) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = React.use(params);
  // Now access the clientID from the resolved params
  const clientID: number = parseInt(resolvedParams.clientID, 10);
  return (
    <div className="container mx-auto p-4 ">
      <SiteHeader title={`Client ${clientID}`} />
      <ClientInfoCard clientID={clientID} />
      <DashboardTabs clientID={clientID} />
    </div>
  );
}