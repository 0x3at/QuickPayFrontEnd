'use client';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
	CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Star,
	MailIcon,
	UserIcon,
	CircleUserRoundIcon,
	Building,
	Calendar,
	CheckCircle2,
	XCircle,
	Clock,
	PhoneIcon,
	ScrollTextIcon,
	MegaphoneIcon,
	Plus,
	FileText,
	CreditCard,
	Pencil,
} from 'lucide-react';
import { useEntitiesV2 } from '@/hooks/apiv2-hooks';
import { ClientDetailResponseV2, EntityDetailV2 } from '@/lib/typesV2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { successToast } from '@/lib/utils';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { EditClientDialog } from "@/components/edit-client-popup";
import { IntegrationSettingsDialog } from "@/components/integration-settings-dialog";
import { IntegrationStatusCard } from "@/components/integration-status-card";
import { ClientInfoCard } from "@/components/client-info-card";
import { NotesCard } from "@/components/notes-card";
import { TransactionsCard } from "@/components/transactions-card";
import { AddNoteDialog } from "@/components/add-note-dialog";

// Helper function to format dates
const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

// Helper function to format currency
const formatCurrency = (amount: string) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number.parseFloat(amount));
};

interface ClientOverviewPanelProps {
    clientID: number;
    clientDetails: ClientDetailResponseV2;
    onRefresh: () => void;
}

export function ClientOverviewPanel({ clientID, clientDetails, onRefresh }: ClientOverviewPanelProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
    
    // Fetch entities for all application options
    const { 
        data: entitiesData, 
        isLoading: entitiesLoading, 
        error: entitiesError 
    } = useEntitiesV2();
    
    const entities = entitiesData?.entities || [];

	// Loading state
	if (entitiesLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="flex flex-col items-center gap-4">
					<Clock className="h-10 w-10 animate-spin text-primary" />
					<h2 className="text-xl font-medium">Loading Entity Information...</h2>
				</div>
			</div>
		);
	}

	// Error state
	if (entitiesError) {
		return (
			<Card className="border-error">
				<CardHeader>
					<CardTitle className="text-error flex items-center gap-2">
						<XCircle className="h-5 w-5" />
						Error Loading Entities
					</CardTitle>
					<CardDescription>Failed to load entity data</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button onClick={() => window.location.reload()} variant="outline">
						Try Again
					</Button>
				</CardFooter>
			</Card>
		);
	}

	const handleIntegrationPopup = (entityKey: string) => {
		setSelectedEntity(entityKey);
		setDialogOpen(true);
	};

	// Data loaded successfully
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{/* Client Information Card */}
			<ClientInfoCard 
				clientDetails={clientDetails}
				onEdit={() => setIsEditDialogOpen(true)}
				className="md:col-span-1"
			/>

			{/* Recent Notes Card */}
			<NotesCard 
				notes={clientDetails.notes}
				formatDate={formatDate}
				onAddNote={() => setIsAddNoteDialogOpen(true)}
				className="md:col-span-2"
			/>

			{/* Recent Transactions Card */}
			<TransactionsCard 
				transactions={clientDetails.transactions}
				formatDate={formatDate}
				formatCurrency={formatCurrency}
				className="md:col-span-1"
			/>

			{/* Integration Status Card */}
			<IntegrationStatusCard 
				clientDetails={clientDetails}
				entities={entities}
				onManageIntegration={handleIntegrationPopup}
				className="md:col-span-2"
			/>

			{/* Edit Client Dialog */}
			<EditClientDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				client={clientDetails.client}
			/>

			{/* Add Note Dialog */}
			<AddNoteDialog
				open={isAddNoteDialogOpen}
				onOpenChange={setIsAddNoteDialogOpen}
				clientID={clientID}
				onSuccess={onRefresh}
			/>

			{/* Integration Settings Dialog */}
			<IntegrationSettingsDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				selectedEntity={selectedEntity}
				clientID={clientID}
				onSuccess={onRefresh}
			/>
		</div>
	);
}
