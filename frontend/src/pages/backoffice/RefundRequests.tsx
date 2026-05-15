import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { RefundRequestAdminDTO } from '@/types/interfaces/admin/RefundRequestAdminDTO.interface';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackOfficeOrderApi, BackOfficeApiError } from '@/api/BackOfficeOrderApi';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function RefundRequests() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<RefundRequestAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; action: 'approved' | 'rejected' } | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequestAdminDTO | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    BackOfficeOrderApi.getInstance().getRefundRequests()
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof BackOfficeApiError && err.status === 401) {
          toast.error(t('sessionExpired'));
        } else {
          toast.error(t('errorOccurred'));
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  function handleAction(id: number, action: 'approved' | 'rejected') {
    setConfirmTarget({ id, action });
  }

  function handleConfirm() {
    if (!accessToken || !confirmTarget) return;
    setSubmitting(true);
    BackOfficeOrderApi.getInstance().updateRefundRequestStatus(confirmTarget.id, confirmTarget.action)
      .then((updated) => {
        setData((prev) => prev.filter((r) => r.id !== updated.id));
        toast.success(
          confirmTarget.action === 'approved'
            ? t('admin.refundRequestApproved')
            : t('admin.refundRequestRejected')
        );
        setConfirmTarget(null);
      })
      .catch((err: unknown) => {
        if (err instanceof BackOfficeApiError && err.status === 401) {
          toast.error(t('sessionExpired'));
        } else {
          toast.error(t('errorOccurred'));
        }
      })
      .finally(() => setSubmitting(false));
  }

  const filteredData = statusFilter === 'all' ? data : data.filter((r) => r.status === statusFilter);

  const statusToggle = (
    <div className="flex items-center gap-2 bg-primary rounded-full p-1 w-fit">
      <Button variant={statusFilter === 'all' ? 'selected' : 'notSelected'} onClick={() => setStatusFilter('all')}>Tous</Button>
      <Button variant={statusFilter === 'pending' ? 'selected' : 'notSelected'} onClick={() => setStatusFilter('pending')}>En attente</Button>
      <Button variant={statusFilter === 'approved' ? 'selected' : 'notSelected'} onClick={() => setStatusFilter('approved')}>{t('admin.approve')}</Button>
      <Button variant={statusFilter === 'rejected' ? 'selected' : 'notSelected'} onClick={() => setStatusFilter('rejected')}>{t('admin.reject')}</Button>
    </div>
  );

  const columns: ColumnDef<RefundRequestAdminDTO>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'user_id', header: t('admin.client') },
    { accessorKey: 'stripe_subscription_id', header: t('admin.subscription') },
    { accessorKey: 'reason', header: t('admin.reason') },
    {
      accessorKey: 'created_at',
      header: t('admin.date'),
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleDateString('fr-FR'),
    },
    {
      id: 'actions',
      header: t('admin.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAction(row.original.id, 'approved')}
          >
            {t('admin.approve')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(row.original.id, 'rejected')}
          >
            {t('admin.reject')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <BackOfficePageHeader title={t('refundRequests')} rightSlot={statusToggle} />
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0 border m-4 rounded-lg">
        {loading ? (
          <p className="p-4 text-muted-foreground">{t('loading')}</p>
        ) : (
          <DataTable columns={columns} data={filteredData} onRowClick={(row) => setSelectedRefund(row)} />
        )}
      </div>

      <Sheet open={selectedRefund !== null} onOpenChange={(v) => { if (!v) setSelectedRefund(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('refundRequests')}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-y-auto p-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.client')}</Label>
              <span className="text-xs font-mono text-muted-foreground">{selectedRefund?.user_id}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.subscription')}</Label>
              <span className="text-xs font-mono text-muted-foreground">{selectedRefund?.stripe_subscription_id}</span>
            </div>
            {selectedRefund?.stripe_payment_intent_id && (
              <div className="flex flex-col gap-1.5">
                <Label>Payment Intent</Label>
                <span className="text-xs font-mono text-muted-foreground">{selectedRefund.stripe_payment_intent_id}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.reason')}</Label>
              <span className="text-sm text-muted-foreground">{selectedRefund?.reason || '—'}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.status')}</Label>
              <span className="text-sm">{selectedRefund?.status ?? '—'}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.date')}</Label>
              <span className="text-sm text-muted-foreground">
                {selectedRefund?.created_at
                  ? new Date(selectedRefund.created_at).toLocaleDateString('fr-FR')
                  : '—'}
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmTarget} onOpenChange={(v) => { if (!v) setConfirmTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.action === 'approved'
                ? t('admin.confirmApproveRefund')
                : t('admin.confirmRejectRefund')}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('admin.confirmRefundDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={submitting}>
              {submitting ? t('loading') : t('admin.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
