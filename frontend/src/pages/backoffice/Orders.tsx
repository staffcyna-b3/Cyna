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
import type { OrderAdminDTO } from '@/types/interfaces/admin/OrderAdminDTO.interface';
import type { ColumnDef } from '@tanstack/react-table';
import { LucideArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAdminOrders, BackOfficeApiError } from '@/services/BackOfficeOrderService';
import { OrderEditorSheet } from '../../components/Backoffice/sheets/OrderEditorSheet';

type OrderGroup = 'inProgress' | 'finalized';

const FINALIZED_STATUSES = ['PAID', 'REFUNDED', 'CANCELLED'];
const ORDER_STATUSES = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const;

export default function Orders() {
    const { t } = useTranslation();
    const { accessToken } = useAuth();

    const [orderGroup, setOrderGroup] = useState<OrderGroup>('inProgress');
    const [data, setData] = useState<OrderAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const [search, setSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const dateFromRef = useRef<HTMLInputElement>(null);
    const dateToRef = useRef<HTMLInputElement>(null);

    const [selectedOrder, setSelectedOrder] = useState<OrderAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editStatus, setEditStatus] = useState('');

    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        getAdminOrders(accessToken, page, limit)
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setLoading(false));
    }, [accessToken, page]);

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        const from = dateFrom ? new Date(dateFrom).getTime() : null;
        const to = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null;

        return data.filter((order) => {
            const groupMatch =
                orderGroup === 'inProgress'
                    ? order.status === 'PENDING'
                    : FINALIZED_STATUSES.includes(order.status);
            const searchMatch =
                !searchLower ||
                (order.stripe_payment_intent_id ?? '').toLowerCase().includes(searchLower) ||
                order.user_id.toLowerCase().includes(searchLower);
            const statusMatch = statusFilter === 'all' || order.status === statusFilter;
            const orderDate = new Date(order.created_at).getTime();
            const dateMatch = (!from || orderDate >= from) && (!to || orderDate <= to);
            return groupMatch && searchMatch && statusMatch && dateMatch;
        });
    }, [data, orderGroup, search, statusFilter, dateFrom, dateTo]);

    function handleRowClick(order: OrderAdminDTO) {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setSheetOpen(true);
    }

    function resetFilters() {
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        setSearch('');
    }

    const columns: ColumnDef<OrderAdminDTO>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'created_at', header: t('admin.createdAt') },
        { accessorKey: 'total_amount', header: t('totalAmount') },
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
        { accessorKey: 'stripe_payment_intent_id', header: 'Stripe ID' },
        { accessorKey: 'user_id', header: 'User ID' },
    ];

    const globalToggle = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 self-start sm:self-auto shadow-sm">
            <Button
                type="button"
                variant={orderGroup === 'inProgress' ? 'selected' : 'notSelected'}
                onClick={() => { setOrderGroup('inProgress'); setStatusFilter('all'); }}
            >
                {t('backoffice.ordersInProgress')}
            </Button>
            <Button
                type="button"
                variant={orderGroup === 'finalized' ? 'selected' : 'notSelected'}
                onClick={() => { setOrderGroup('finalized'); setStatusFilter('all'); }}
            >
                {t('backoffice.ordersFinalized')}
            </Button>
        </div>
    );

    return (
        <>
            <BackOfficePageHeader title={t('orders.label')} rightSlot={globalToggle} />
            <div className="px-6 pb-6 space-y-3">
                <BackOfficeListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder={t('backoffice.searchByPaymentOrUser')}
                    searchAriaLabel={t('search')}
                    filterLabel={t('filters')}
                    onFilterClick={() => setIsFilterOpen((prev) => !prev)}
                    filterActive={statusFilter !== 'all' || !!dateFrom || !!dateTo}
                    filterPanel={
                        isFilterOpen ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                                    <div>
                                        <Label className="mb-1.5 block text-sm text-gray-600">
                                            {t('admin.status')}
                                        </Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('backoffice.allStatuses')}</SelectItem>
                                                {ORDER_STATUSES.map((s) => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9"
                                        onClick={resetFilters}
                                    >
                                        {t('resetFilters')}
                                    </Button>
                                </div>
                            </div>
                        ) : null
                    }
                />
                {loading ? (
                    <div className="rounded-md border p-6 text-sm text-muted-foreground">
                        {t('loading')}
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        onRowClick={handleRowClick}
                    />
                )}
            </div>
            {selectedOrder && (
                <OrderEditorSheet
                    open={sheetOpen}
                    orderId={selectedOrder.id}
                    userId={selectedOrder.user_id}
                    status={editStatus}
                    totalAmount={selectedOrder.total_amount}
                    stripePaymentIntentId={selectedOrder.stripe_payment_intent_id}
                    createdAt={selectedOrder.created_at}
                    items={selectedOrder.items}
                    title={t('admin.editOrder')}
                    statusLabel={t('admin.status')}
                    itemsLabel={t('admin.items')}
                    totalLabel={t('total')}
                    onOpenChange={setSheetOpen}
                />
            )}
        </>
    );
}
