import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeListToolbar } from '@/components/Backoffice/shared/BackOfficeListToolbar';
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
import type { RefundAdminDTO } from '@/types/interfaces/admin/RefundAdminDTO.interface';
import type { RefundRequestAdminDTO } from '@/types/interfaces/admin/RefundRequestAdminDTO.interface';
import type { ColumnDef } from '@tanstack/react-table';
import { LucideArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BackOfficeOrderApi, BackOfficeApiError } from '@/api/BackOfficeOrderApi';
import { RefundSheet } from '../../components/Backoffice/sheets/RefundSheet';

type View = 'requests' | 'processed';

export default function Refunds() {
    const { t } = useTranslation();
    const { accessToken } = useAuth();
    const [view, setView] = useState<View>('requests');

    // Processed refunds
    const [refunds, setRefunds] = useState<RefundAdminDTO[]>([]);
    const [refundsLoading, setRefundsLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState<RefundAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [refundSearch, setRefundSearch] = useState('');
    const [refundFilterOpen, setRefundFilterOpen] = useState(false);
    const [refundDateFrom, setRefundDateFrom] = useState('');
    const [refundDateTo, setRefundDateTo] = useState('');
    const refundDateFromRef = useRef<HTMLInputElement>(null);
    const refundDateToRef = useRef<HTMLInputElement>(null);

    // Refund requests
    const [requests, setRequests] = useState<RefundRequestAdminDTO[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<{ id: number; action: 'approved' | 'rejected' } | null>(null);
    const [requestSearch, setRequestSearch] = useState('');
    const [requestFilterOpen, setRequestFilterOpen] = useState(false);
    const [requestDateFrom, setRequestDateFrom] = useState('');
    const [requestDateTo, setRequestDateTo] = useState('');
    const requestDateFromRef = useRef<HTMLInputElement>(null);
    const requestDateToRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!accessToken) return;
        setRefundsLoading(true);
        BackOfficeOrderApi.getInstance().getRefunds()
            .then(setRefunds)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setRefundsLoading(false));
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;
        setRequestsLoading(true);
        BackOfficeOrderApi.getInstance().getRefundRequests()
            .then(setRequests)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setRequestsLoading(false));
    }, [accessToken]);

    const filteredRefunds = useMemo(() => {
        const searchLower = refundSearch.trim().toLowerCase();
        const from = refundDateFrom ? new Date(refundDateFrom).getTime() : null;
        const to = refundDateTo ? new Date(refundDateTo + 'T23:59:59').getTime() : null;
        return refunds.filter((refund) => {
            const searchMatch =
                !searchLower || refund.payment_intent.toLowerCase().includes(searchLower);
            const refundDate = refund.created * 1000;
            const dateMatch = (!from || refundDate >= from) && (!to || refundDate <= to);
            return searchMatch && dateMatch;
        });
    }, [refunds, refundSearch, refundDateFrom, refundDateTo]);

    const filteredRequests = useMemo(() => {
        const searchLower = requestSearch.trim().toLowerCase();
        const from = requestDateFrom ? new Date(requestDateFrom).getTime() : null;
        const to = requestDateTo ? new Date(requestDateTo + 'T23:59:59').getTime() : null;
        return requests.filter((req) => {
            const searchMatch =
                !searchLower || req.stripe_subscription_id.toLowerCase().includes(searchLower);
            const reqDate = new Date(req.created_at).getTime();
            const dateMatch = (!from || reqDate >= from) && (!to || reqDate <= to);
            return searchMatch && dateMatch;
        });
    }, [requests, requestSearch, requestDateFrom, requestDateTo]);

    function handleRowClick(refund: RefundAdminDTO) {
        setSelectedRefund(refund);
        setSheetOpen(true);
    }

    function handleAction(id: number, action: 'approved' | 'rejected') {
        setConfirmTarget({ id, action });
    }

    function handleConfirm() {
        if (!accessToken || !confirmTarget) return;
        setSubmitting(true);
        BackOfficeOrderApi.getInstance().updateRefundRequestStatus(confirmTarget.id, confirmTarget.action)
            .then((updated) => {
                setRequests((prev) => prev.filter((r) => r.id !== updated.id));
                toast.success(
                    confirmTarget.action === 'approved'
                        ? t('admin.refundRequestApproved')
                        : t('admin.refundRequestRejected'),
                );
                setConfirmTarget(null);
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else if (err instanceof BackOfficeApiError) {
                    toast.error(err.message);
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setSubmitting(false));
    }

    const refundColumns: ColumnDef<RefundAdminDTO>[] = [
        { accessorKey: 'id', header: 'ID' },
        {
            accessorKey: 'amount',
            header: t('admin.amount'),
            cell: ({ row }) =>
                (row.original.amount / 100).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                }),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('admin.status')}
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        { accessorKey: 'reason', header: t('admin.reason') },
        { accessorKey: 'payment_intent', header: 'Payment Intent' },
        {
            accessorKey: 'created',
            header: t('admin.date'),
            cell: ({ row }) =>
                new Date(row.original.created * 1000).toLocaleDateString('fr-FR'),
        },
    ];

    const requestColumns: ColumnDef<RefundRequestAdminDTO>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'user_id', header: t('admin.client') },
        { accessorKey: 'stripe_subscription_id', header: t('admin.subscription') },
        { accessorKey: 'reason', header: t('admin.reason') },
        {
            accessorKey: 'created_at',
            header: t('admin.date'),
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('fr-FR'),
        },
        {
            id: 'actions',
            header: t('admin.actions'),
            cell: ({ row }) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" onClick={() => handleAction(row.original.id, 'approved')}>
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

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 self-start sm:self-auto shadow-sm">
            <Button
                type="button"
                variant={view === 'requests' ? 'selected' : 'notSelected'}
                onClick={() => setView('requests')}
            >
                Demandes
            </Button>
            <Button
                type="button"
                variant={view === 'processed' ? 'selected' : 'notSelected'}
                onClick={() => setView('processed')}
            >
                Traitées
            </Button>
        </div>
    );

    function dateFilterPanel(
        filterOpen: boolean,
        setFilterOpen: (v: boolean) => void,
        dateFrom: string,
        setDateFrom: (v: string) => void,
        dateTo: string,
        setDateTo: (v: string) => void,
        onReset: () => void,
        dateFromRef: React.RefObject<HTMLInputElement | null>,
        dateToRef: React.RefObject<HTMLInputElement | null>,
    ) {
        return filterOpen ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                        <Label className="mb-1.5 block text-sm text-gray-600">
                            {t('backoffice.dateFrom')}
                        </Label>
                        <Input
                            ref={dateFromRef}
                            type="date"
                            className="h-9"
                            max="9999-12-31"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    dateToRef.current?.focus();
                                }
                            }}
                        />
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-sm text-gray-600">
                            {t('backoffice.dateTo')}
                        </Label>
                        <Input
                            ref={dateToRef}
                            type="date"
                            className="h-9"
                            max="9999-12-31"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Tab' && e.shiftKey) {
                                    e.preventDefault();
                                    dateFromRef.current?.focus();
                                }
                            }}
                        />
                    </div>
                    <Button type="button" variant="outline" className="h-9" onClick={onReset}>
                        {t('resetFilters')}
                    </Button>
                </div>
            </div>
        ) : null;
    }

    return (
        <>
            <BackOfficePageHeader title={t('refunds')} rightSlot={topRightActions} />

            <div className="px-6 pb-6 space-y-3">
                {view === 'requests' ? (
                    <>
                        <BackOfficeListToolbar
                            searchValue={requestSearch}
                            onSearchChange={setRequestSearch}
                            searchPlaceholder={t('backoffice.searchBySubscriptionId')}
                            searchAriaLabel={t('search')}
                            filterLabel={t('filters')}
                            onFilterClick={() => setRequestFilterOpen((prev) => !prev)}
                            filterActive={!!requestDateFrom || !!requestDateTo}
                            filterPanel={dateFilterPanel(
                                requestFilterOpen,
                                setRequestFilterOpen,
                                requestDateFrom,
                                setRequestDateFrom,
                                requestDateTo,
                                setRequestDateTo,
                                () => { setRequestDateFrom(''); setRequestDateTo(''); setRequestSearch(''); },
                                requestDateFromRef,
                                requestDateToRef,
                            )}
                        />
                        {requestsLoading ? (
                            <div className="rounded-md border p-6 text-sm text-muted-foreground">
                                {t('loading')}
                            </div>
                        ) : (
                            <DataTable columns={requestColumns} data={filteredRequests} />
                        )}
                    </>
                ) : (
                    <>
                        <BackOfficeListToolbar
                            searchValue={refundSearch}
                            onSearchChange={setRefundSearch}
                            searchPlaceholder={t('backoffice.searchByPaymentIntent')}
                            searchAriaLabel={t('search')}
                            filterLabel={t('filters')}
                            onFilterClick={() => setRefundFilterOpen((prev) => !prev)}
                            filterActive={!!refundDateFrom || !!refundDateTo}
                            filterPanel={dateFilterPanel(
                                refundFilterOpen,
                                setRefundFilterOpen,
                                refundDateFrom,
                                setRefundDateFrom,
                                refundDateTo,
                                setRefundDateTo,
                                () => { setRefundDateFrom(''); setRefundDateTo(''); setRefundSearch(''); },
                            )}
                        />
                        {refundsLoading ? (
                            <div className="rounded-md border p-6 text-sm text-muted-foreground">
                                {t('loading')}
                            </div>
                        ) : (
                            <DataTable
                                columns={refundColumns}
                                data={filteredRefunds}
                                onRowClick={handleRowClick}
                            />
                        )}
                    </>
                )}
            </div>

            {selectedRefund && (
                <RefundSheet
                    open={sheetOpen}
                    refundId={selectedRefund.id}
                    refundAmount={selectedRefund.amount}
                    refundStatus={selectedRefund.status}
                    refundReason={selectedRefund.reason}
                    refundPaymentIntent={selectedRefund.payment_intent}
                    refundCreatedAt={selectedRefund.created}
                    title={t('admin.viewRefund')}
                    amountLabel={t('admin.amount')}
                    reasonLabel={t('admin.reason')}
                    paymentIntentLabel="Payment Intent"
                    onOpenChange={setSheetOpen}
                />
            )}

            <AlertDialog
                open={!!confirmTarget}
                onOpenChange={(v) => {
                    if (!v) setConfirmTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmTarget?.action === 'approved'
                                ? t('admin.confirmApproveRefund')
                                : t('admin.confirmRejectRefund')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('admin.confirmRefundDescription')}
                        </AlertDialogDescription>
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
