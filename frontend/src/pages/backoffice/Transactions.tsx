import { DataTable } from "@/components/Backoffice/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BackOfficePageHeader } from "@/components/Backoffice/shared/BackOfficePageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SaleAdminDTO } from "@/types/interfaces/admin/SaleAdminDTO.interface";
import type { SubscriptionAdminDTO } from "@/types/interfaces/admin/SubscriptionAdminDTO.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    getSales,
    getSubscriptions,
    cancelSubscriptionAdmin,
    BackOfficeApiError,
} from "@/services/BackOfficeOrderService";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";

export default function Transactions() {
    const { accessToken } = useAuth();

    // Sales state
    const [sales, setSales] = useState<SaleAdminDTO[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);

    // Subscriptions state
    const [subscriptions, setSubscriptions] = useState<SubscriptionAdminDTO[]>([]);
    const [subLoading, setSubLoading] = useState(true);
    const [cancelTarget, setCancelTarget] = useState<SubscriptionAdminDTO | null>(null);
    const [subSubmitting, setSubSubmitting] = useState(false);

    useEffect(() => {
        if (!accessToken) return;
        getSales(accessToken)
            .then(setSales)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setSalesLoading(false));
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;
        setSubLoading(true);
        getSubscriptions(accessToken)
            .then(setSubscriptions)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setSubLoading(false));
    }, [accessToken]);

    function handleCancelSubscription() {
        if (!accessToken || !cancelTarget) return;
        setSubSubmitting(true);
        cancelSubscriptionAdmin(accessToken, cancelTarget.id)
            .then(() => {
                toast.success(t("subscriptions.cancelSuccess"));
                setSubscriptions((prev) =>
                    prev.map((s) =>
                        s.id === cancelTarget.id ? { ...s, status: "cancelled" } : s
                    )
                );
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => {
                setSubSubmitting(false);
                setCancelTarget(null);
            });
    }

    const salesColumns: ColumnDef<SaleAdminDTO>[] = [
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
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    {t("admin.date")}
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => new Date(row.original.date).toLocaleDateString("fr-FR"),
        },
        {
            accessorKey: "userEmail",
            header: t("admin.client"),
            cell: ({ row }) => row.original.userEmail ?? "—",
        },
        {
            accessorKey: "productName",
            header: t("admin.product"),
        },
        {
            accessorKey: "type",
            header: t("admin.type"),
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.original.type === "subscription"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}>
                    {row.original.type === "subscription" ? t("subscriptions.licenses") : t("admin.oneTime")}
                </span>
            ),
        },
        {
            accessorKey: "amount",
            header: t("admin.amount"),
            cell: ({ row }) => formatCurrency(row.original.amount),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    {t("admin.status")}
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
    ];

    const subColumns: ColumnDef<SubscriptionAdminDTO>[] = [
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
        {
            accessorKey: "product",
            header: t("admin.subscription"),
            cell: ({ row }) => row.original.product?.name ?? "—",
        },
        {
            accessorKey: "user",
            header: t("admin.client"),
            cell: ({ row }) => row.original.user?.email ?? "—",
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    {t("admin.status")}
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "price",
            header: t("admin.amount"),
            cell: ({ row }) => formatCurrency(row.original.price),
        },
        {
            accessorKey: "end_date",
            header: "Fin",
            cell: ({ row }) => new Date(row.original.end_date).toLocaleDateString("fr-FR"),
        },
        {
            id: "actions",
            header: t("admin.actions"),
            cell: ({ row }) => {
                const sub = row.original;
                const isCancelled = sub.status === "cancelled";
                return (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={isCancelled}
                            onClick={() => setCancelTarget(sub)}
                        >
                            {t("subscriptions.cancelButton")}
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <BackOfficePageHeader title={t("transactions")} />

            <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
                <Tabs defaultValue="transactions">
                    <TabsList>
                        <TabsTrigger value="transactions">{t("transactions")}</TabsTrigger>
                        <TabsTrigger value="subscriptions">{t("subscriptions.licenses")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions">
                        <div className="border rounded-lg">
                            {salesLoading ? (
                                <p className="p-4 text-muted-foreground">{t("loading")}</p>
                            ) : (
                                <DataTable
                                    columns={salesColumns}
                                    data={sales}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="subscriptions">
                        <div className="border rounded-lg">
                            {subLoading ? (
                                <p className="p-4 text-muted-foreground">{t("loading")}</p>
                            ) : (
                                <DataTable
                                    columns={subColumns}
                                    data={subscriptions}
                                />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Subscription cancel confirm dialog */}
            <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("subscriptions.cancelTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {cancelTarget?.product?.name} — {cancelTarget?.user?.email}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={subSubmitting}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction disabled={subSubmitting} onClick={handleCancelSubscription}>
                            {t("admin.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
