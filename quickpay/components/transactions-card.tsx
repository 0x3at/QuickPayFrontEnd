import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionV2 } from '@/lib/typesV2';
import { CreditCard } from 'lucide-react';

interface TransactionsCardProps {
  transactions: TransactionV2[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: string) => string;
  onViewAllTransactions?: () => void;
  className?: string;
  maxTransactions?: number;
}

export function TransactionsCard({
  transactions,
  formatDate,
  formatCurrency,
  className = '',
  maxTransactions = 3
}: TransactionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {transactions.slice(0, maxTransactions).map((transaction, index) => {
            // Derive a status from the result field
            const status = transaction.result === "1" ? "completed" : "failed";
            
            return (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                </div>
                <Badge variant={status === "completed" ? "success" : "warning"}>
                  {status}
                </Badge>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">No transactions found</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
      </CardFooter>
    </Card>
  );
} 