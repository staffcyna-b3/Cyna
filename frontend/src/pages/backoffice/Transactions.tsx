import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import type { SubscriptionAdminDTO } from '@/types/interfaces/admin/SubscriptionAdminDTO.interface';
import type { ColumnDef } from '@tanstack/react-table';
import { LucideArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    getSales,
    getSubscriptions,
    cancelSubscriptionAdmin,
    BackOfficeApiError,
} from '@/services/BackOfficeOrderService';
import { formatCurrency } from '@/utils/currencyFormatter';

export default function Transactions() {
    const { t } = useTranslation();
    const { accessToken } = useAuth();

    // Sales state
    const [sales, setSales] = useState<SaleAdminDTO[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);
    const [salesSearch, setSalesSearch] = useState('');
    const [salesFilterOpen, setSalesFilterOpen] = useState(false);
    const [salesClientEmail, setSalesClientEmail] = useState('');
    const [salesStatus, setSalesStatus] = useState('all');
    const [salesType, setSalesType] = useState('all');
    const [salesDateFrom, setSalesDateFrom] = useState('');
    const [salesDateTo, setSalesDateTo] = useState('');
    const salesDateFromRef = useRef<HTMLInputElement>(null);
    const salesDateToRef = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState<'transactions' | 'subscriptions'>('transactions');

    // Subscriptions state
    const [subscriptions, setSubscriptions] = useState<SubscriptionAdminDTO[]>([]);
    const [subLoading, setSubLoading] = useState(true);
    const [subSearch, setSubSearch] = useState('');
    const [subFilterOpen, setSubFilterOpen] = useState(false);
    const [subClientEmail, setSubClientEmail] = useState('');
    const [subStatus, setSubStatus] = useState('all');
    const [cancelTarget, setCancelTarget] = useState<SubscriptionAdminDTO | null>(null);
    const [subSubmitting, setSubSubmitting] = useState(false);

    useEffect(() => {
        if (!accessToken) return;
        getSales(accessToken)
            .then(setSales)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setSalesLoading(false));
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;
        getSubscriptions(accessToken)
            .then(setSubscriptions)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setSubLoading(false));
    }, [accessToken]);

    function handleCancelSubscription() {
        if (!accessToken || !cancelTarget) return;
        setSubSubmitting(true);
        cancelSubscriptionAdmin(accessToken, cancelTarget.id)
            .then(() => {
                toast.success(t('subscriptions.cancelSuccess'));
                setSubscriptions((prev) =>
                    prev.map((s) =>
                        s.id === cancelTarget.id ? { ...s, status: 'cancelled' } : s,
                    ),
                );
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => {
                setSubSubmitting(false);
                setCancelTarget(null);
            });
    }

    const filteredSales = useMemo(() => {
        const searchLower = salesSearch.trim().toLowerCase();
        const from = salesDateFrom ? new Date(salesDateFrom).getTime() : null;
        const to = salesDateTo ? new Date(salesDateTo + 'T23:59:59').getTime() : null;
        return sales.filter((sale) => {
            const searchMatch =
                !searchLower ||
                sale.productName.toLowerCase().includes(searchLower) ||
                (sale.userEmail ?? '').toLowerCase().includes(searchLower);
            const emailMatch =
                !salesClientEmail.trim() ||
                (sale.userEmail ?? '').toLowerCase().includes(salesClientEmail.trim().toLowerCase());
            const statusMatch = salesStatus === 'all' || sale.status === salesStatus;
            const typeMatch = salesType === 'all' || sale.type === salesType;
            const saleDate = new Date(sale.date).getTime();
            const dateMatch = (!from || saleDate >= from) && (!to || saleDate <= to);
            return searchMatch && emailMatch && statusMatch && typeMatch && dateMatch;
        });
    }, [sales, salesSearch, salesClientEmail, salesStatus, salesType, salesDateFrom, salesDateTo]);

    const filteredSubs = useMemo(() => {
        const searchLower = subSearch.trim().toLowerCase();
        return subscriptions.filter((sub) => {
            const searchMatch =
                !searchLower ||
                (sub.product?.name ?? '').toLowerCase().includes(searchLower) ||
                (sub.user?.email ?? '').toLowerCase().includes(searchLower);
            const emailMatch =
                !subClientEmail.trim() ||
                (sub.user?.email ?? '').toLowerCase().includes(subClientEmail.trim().toLowerCase());
            const statusMatch = subStatus === 'all' || sub.status === subStatus;
            return searchMatch && emailMatch && statusMatch;
        });
    }, [subscriptions, subSearch, subClientEmail, subStatus]);

    function resetSalesFilters() {
        setSalesClientEmail('');
        setSalesStatus('all');
        setSalesType('all');
        setSalesDateFrom('');
        setSalesDateTo('');
        setSalesSearch('');
    }

    function resetSubFilters() {
        setSubClientEmail('');
        setSubStatus('all');
        setSubSearch('');
    }

    const salesColumns: ColumnDef<SaleAdminDTO>[] = [
        {
            accessorKey: 'date',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('admin.date')}
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => new Date(row.original.date).toLocaleDateString('fr-FR'),
        },
        {
            accessorKey: 'userEmail',
            header: t('admin.client'),
            cell: ({ row }) => row.original.userEmail ?? '—',
        },
        {
            accessorKey: 'productName',
            header: t('admin.products'),
            cell: ({ row }) =>
                row.original.productName === '—'
                    ? '—'
                    : row.original.productName
                          .split(', ')
                          .map((name) => t(`products.${name}.name`, { defaultValue: name }))
                          .join(', '),
        },
        {
            accessorKey: 'type',
            header: t('admin.type'),
            cell: ({ row }) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.original.type === 'subscription'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {row.original.type === 'subscription'
                        ? t('subscriptions.licenses')
                        : t('admin.oneTime')}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: t('admin.amount'),
            cell: ({ row }) => formatCurrency(row.original.amount),
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
    ];

    const subColumns: ColumnDef<SubscriptionAdminDTO>[] = [
        {
            accessorKey: 'product',
            header: t('admin.subscription'),
            cell: ({ row }) =>
                t(`products.${row.original.product?.name}.name`) ?? '—',
        },
        {
            accessorKey: 'user',
            header: t('admin.client'),
            cell: ({ row }) => row.original.user?.email ?? '—',
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
        {
            accessorKey: 'price',
            header: t('admin.amount'),
            cell: ({ row }) => formatCurrency(row.original.price),
        },
        {
            accessorKey: 'end_date',
            header: 'Fin',
            cell: ({ row }) => new Date(row.original.end_date).toLocaleDateString('fr-FR'),
        },
        {
            id: 'actions',
            header: t('admin.actions'),
            cell: ({ row }) => {
                const sub = row.original;
                const isCancelled = sub.status === 'cancelled';
                return (
                    <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={isCancelled}
                            onClick={() => setCancelTarget(sub)}
                        >
                            {t('subscriptions.cancelButton')}
                        </Button>
                    </div>
                );
            },
        },
    ];

    const globalToggle = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 self-start sm:self-auto shadow-sm">
            <Button
                type="button"
                variant={tab === 'transactions' ? 'selected' : 'notSelected'}
                onClick={() => setTab('transactions')}
            >
                {t('transactions')}
            </Button>
            <Button
                type="button"
                variant={tab === 'subscriptions' ? 'selected' : 'notSelected'}
                onClick={() => setTab('subscriptions')}
            >
                {t('subscriptions.licenses')}
            </Button>
        </div>
    );

    return (
        <>
            <BackOfficePageHeader title={t('transactions')} rightSlot={globalToggle} />

            <div className="px-6 pb-6 space-y-3">
                {tab === 'transactions' ? (
                    <>
                        <BackOfficeListToolbar
                            searchValue={salesSearch}
                            onSearchChange={setSalesSearch}
                            searchPlaceholder={t('backoffice.searchByProductName')}
                            searchAriaLabel={t('search')}
                            filterLabel={t('filters')}
                            onFilterClick={() => setSalesFilterOpen((prev) => !prev)}
                            filterActive={
                                !!salesClientEmail ||
                                salesStatus !== 'all' ||
                                salesType !== 'all' ||
                                !!salesDateFrom ||
                                !!salesDateTo
                            }
                            filterPanel={
                                salesFilterOpen ? (
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                                            <div>
                                                <Label className="mb-1.5 block text-sm text-gray-600">
                                                    {t('admin.type')}
                                                </Label>
                                                <Select value={salesType} onValueChange={setSalesType}>
                                                    <SelectTrigger className="h-9 w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{t('backoffice.allTypes')}</SelectItem>
                                                        <SelectItem value="order">{t('admin.oneTime')}</SelectItem>
                                                        <SelectItem value="subscription">{t('subscriptions.licenses')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="mb-1.5 block text-sm text-gray-600">
                                                    {t('backoffice.dateFrom')}
                                                </Label>
                                                <Input
                                                    ref={salesDateFromRef}
                                                    type="date"
                                                    className="h-9"
                                                    max="9999-12-31"
                                                    value={salesDateFrom}
                                                    onChange={(e) => setSalesDateFrom(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Tab' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            salesDateToRef.current?.focus();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-1.5 block text-sm text-gray-600">
                                                    {t('backoffice.dateTo')}
                                                </Label>
                                                <Input
                                                    ref={salesDateToRef}
                                                    type="date"
                                                    className="h-9"
                                                    max="9999-12-31"
                                                    value={salesDateTo}
                                                    onChange={(e) => setSalesDateTo(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Tab' && e.shiftKey) {
                                                            e.preventDefault();
                                                            salesDateFromRef.current?.focus();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-9"
                                                onClick={resetSalesFilters}
                                            >
                                                {t('resetFilters')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null
                            }
                        />
                    
                        {salesLoading ? (
                            <div className="rounded-md border p-6 text-sm text-muted-foreground">
                                {t('loading')}
                            </div>
                        ) : (
                            <DataTable columns={salesColumns} data={filteredSales} />
                        )}
                    
                    </>
                ) : (
                    <>
                        <BackOfficeListToolbar
                            searchValue={subSearch}
                            onSearchChange={setSubSearch}
                            searchPlaceholder={t('backoffice.searchBySubscriptionName')}
                            searchAriaLabel={t('search')}
                            filterLabel={t('filters')}
                            onFilterClick={() => setSubFilterOpen((prev) => !prev)}
                            filterActive={!!subClientEmail || subStatus !== 'all'}
                            filterPanel={
                                subFilterOpen ? (
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                            <div>
                                                <Label className="mb-1.5 block text-sm text-gray-600">
                                                    {t('admin.status')}
                                                </Label>
                                                <Select value={subStatus} onValueChange={setSubStatus}>
                                                    <SelectTrigger className="h-9 w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{t('backoffice.allStatuses')}</SelectItem>
                                                        <SelectItem value="active">{t('active')}</SelectItem>
                                                        <SelectItem value="cancelled">{t('inactive')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-9"
                                                onClick={resetSubFilters}
                                            >
                                                {t('resetFilters')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null
                            }
                        />
                        
                        {subLoading ? (
                            <div className="rounded-md border p-6 text-sm text-muted-foreground">
                                {t('loading')}
                            </div>
                        ) : (
                            <DataTable columns={subColumns} data={filteredSubs} />
                        )}
                        
                    </>
                )}
            </div>

            <AlertDialog
                open={!!cancelTarget}
                onOpenChange={(open) => {
                    if (!open) setCancelTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('subscriptions.cancelTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(`products.${cancelTarget?.product?.name}.name`, { defaultValue: cancelTarget?.product?.name })} — {cancelTarget?.user?.email}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={subSubmitting}>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={subSubmitting}
                            onClick={handleCancelSubscription}
                        >
                            {t('admin.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
