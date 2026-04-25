import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Typography } from '@/components/ui/typography';
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
import {
  getRefundRequests,
  updateRefundRequestStatus,
  BackOfficeApiError,
} from '@/services/BackOfficeOrderService';
import { toast } from 'sonner';

export default function RefundRequests() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<RefundRequestAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; action: 'approved' | 'rejected' } | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    getRefundRequests(accessToken)
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
    updateRefundRequestStatus(accessToken, confirmTarget.id, confirmTarget.action)
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
      <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <Typography variant="h1">{t('refundRequests')}</Typography>
      </header>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0 border m-4 rounded-lg">
        {loading ? (
          <p className="p-4 text-muted-foreground">{t('loading')}</p>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>

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
