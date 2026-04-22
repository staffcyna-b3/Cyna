import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type TransactionSheetProps = {
  open: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: number;
  title: string;
  closeLabel: string;
  amountLabel: string;
  statusLabel: string;
  descriptionLabel: string;
  dateLabel: string;
  onOpenChange: (open: boolean) => void;
};

export function TransactionSheet({
  open,
  transactionId,
  amount,
  currency,
  status,
  description,
  createdAt,
  title,
  closeLabel,
  amountLabel,
  statusLabel,
  descriptionLabel,
  dateLabel,
  onOpenChange,
}: TransactionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="flex flex-row items-center justify-between border-b p-4">
          <div className="flex flex-col gap-0.5">
            <SheetTitle>{title}</SheetTitle>
            <span className="text-xs text-muted-foreground font-mono">{transactionId}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {closeLabel}
          </Button>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label>{amountLabel}</Label>
            <span className="text-sm">
              {(amount / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: currency.toUpperCase(),
              })}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{statusLabel}</Label>
            <span className="text-sm">{status}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{descriptionLabel}</Label>
            <span className="text-sm text-muted-foreground">{description ?? '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{dateLabel}</Label>
            <span className="text-sm text-muted-foreground">
              {new Date(createdAt * 1000).toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
