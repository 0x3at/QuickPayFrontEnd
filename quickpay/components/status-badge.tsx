// components/ui/status-badge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

type StatusType =
	| 'Active'
	| 'Inactive'
	| 'Pending'
	| 'Approved'
	| 'Rejected'
	| 'Collected'
	| 'completed'
	| string;

interface StatusBadgeProps {
	status: StatusType;
	showIcon?: boolean;
	className?: string;
	children?: React.ReactNode;
}

export function StatusBadge({
	status,
	showIcon = false,
	className = '',
	children,
}: StatusBadgeProps) {
	let variant: string;
	let icon = null;

	switch (status) {
		case 'Active':
		case 'Approved':
		case 'completed':
			variant = 'success';
			icon = showIcon ? <CheckCircle2 className='h-3 w-3 mr-1' /> : null;
			break;
		case 'Inactive':
		case 'Rejected':
			variant = 'error';
			icon = showIcon ? <XCircle className='h-3 w-3 mr-1' /> : null;
			break;
		case 'Pending':
			variant = 'warning';
			icon = showIcon ? <Clock className='h-3 w-3 mr-1' /> : null;
			break;
		case 'Collected':
			variant = 'completed';
			icon = showIcon ? <CheckCircle2 className='h-3 w-3 mr-1' /> : null;
			break;
		default:
			variant = 'default';
	}

	return (
		<Badge
			variant={variant as keyof typeof Badge}
			className={`gap-1 ${className}`}
		>
			{icon}
			{children || status}
		</Badge>
	);
}
