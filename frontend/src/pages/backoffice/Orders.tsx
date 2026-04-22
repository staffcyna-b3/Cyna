import { DataTable } from "@/components/Backoffice/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
import type { OrderAdminDTO } from "@/types/interfaces/admin/OrderAdminDTO.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAdminOrders, updateOrderStatus, BackOfficeApiError } from "@/services/BackOfficeService";
import { toast } from "sonner";
import { OrderEditorSheet } from "../../components/Backoffice/sheets/OrderEditorSheet";

export default function Orders() {
    const { accessToken } = useAuth();
    const [selected, setSelected] = useState("active");
    const [data, setData] = useState<OrderAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const [selectedOrder, setSelectedOrder] = useState<OrderAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editStatus, setEditStatus] = useState('');
    const [saving, setSaving] = useState(false);

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
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setLoading(false));
    }, [accessToken, page]);

    const handleRowClick = (order: OrderAdminDTO) => {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setSheetOpen(true);
    };

    const handleSave = async () => {
        if (!selectedOrder || !accessToken) return;
        setSaving(true);
        try {
            const updated = await updateOrderStatus(accessToken, selectedOrder.id, editStatus);
            setData((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSheetOpen(false);
            toast.success(t("admin.orderUpdated"));
        } catch (err: unknown) {
            if (err instanceof BackOfficeApiError && err.status === 401) {
                toast.error(t("sessionExpired"));
            } else {
                toast.error(t("errorOccurred"));
            }
        } finally {
            setSaving(false);
        }
    };

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button variant={selected === "active" ? 'selected' : 'notSelected'} onClick={() => setSelected("active")}>{t("active")}</Button>
            <Button variant={selected === "inactive" ? 'selected' : 'notSelected'} onClick={() => setSelected("inactive")}>{t("inactive")}</Button>
        </div>
    );

    const columns: ColumnDef<OrderAdminDTO>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        { accessorKey: "id", header: "ID" },
        { accessorKey: "created_at", header: "Created At" },
        { accessorKey: "total_amount", header: "Total Amount" },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        { accessorKey: "stripe_payment_intent_id", header: "Stripe ID" },
        { accessorKey: "user_id", header: "User ID" },
    ];

    return (
        <>
            <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Typography variant="h1">{t("orders")}</Typography>
                {topRightActions}
            </header>
            <div className="flex flex-1 flex-col gap-2 p-4 pt-0 border m-4 rounded-lg">
                {loading ? (
                    <p className="p-4 text-muted-foreground">{t("loading")}</p>
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={data}
                            onRowClick={handleRowClick}
                        />
                        <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="text-sm text-muted-foreground">{total} {t("orders")}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t("previous")}</Button>
                                <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>{t("next")}</Button>
                            </div>
                        </div>
                    </>
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
                    title={t("admin.editOrder")}
                    saveLabel={t("update")}
                    statusLabel={t("admin.status")}
                    itemsLabel={t("admin.items")}
                    totalLabel={t("total")}
                    saving={saving}
                    onOpenChange={setSheetOpen}
                    onStatusChange={setEditStatus}
                    onSave={handleSave}
                />
            )}
        </>
    );
}
