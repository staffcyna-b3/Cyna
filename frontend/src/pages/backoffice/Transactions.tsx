import { DataTable } from "@/components/Backoffice/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
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
import type { TransactionAdminDTO } from "@/types/interfaces/admin/TransactionAdminDTO.interface";
import type { SubscriptionAdminDTO } from "@/types/interfaces/admin/SubscriptionAdminDTO.interface";
import type { CreateRefundRequest } from "@/types/interfaces/admin/CreateRefundRequest.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    getTransactions,
    getSubscriptions,
    createRefund,
    cancelSubscriptionAdmin,
    BackOfficeApiError,
} from "@/services/BackOfficeOrderService";
import { toast } from "sonner";
import { TransactionSheet } from "../../components/Backoffice/sheets/TransactionSheet";
import { formatCurrency } from "@/utils/currencyFormatter";

export default function Transactions() {
    const { accessToken } = useAuth();

    // Transactions state
    const [transactions, setTransactions] = useState<TransactionAdminDTO[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pendingRefund = useRef<{ paymentIntentId: string; amount: number | undefined; reason: string } | null>(null);

    // Subscriptions state
    const [subscriptions, setSubscriptions] = useState<SubscriptionAdminDTO[]>([]);
    const [subLoading, setSubLoading] = useState(true);
    const [cancelTarget, setCancelTarget] = useState<SubscriptionAdminDTO | null>(null);
    const [subSubmitting, setSubSubmitting] = useState(false);

    useEffect(() => {
        if (!accessToken) return;
        setTxLoading(true);
        getTransactions(accessToken)
            .then(setTransactions)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setTxLoading(false));
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

    // Transaction handlers
    function handleRowClick(transaction: TransactionAdminDTO) {
        setSelectedTransaction(transaction);
        setSheetOpen(true);
    }

    function handleConfirmRefund(paymentIntentId: string, amount: number | undefined, reason: string) {
        pendingRefund.current = { paymentIntentId, amount, reason };
        setConfirmOpen(true);
    }

    function handleSubmitRefund() {
        if (!accessToken || !pendingRefund.current) return;
        setSubmitting(true);
        const { paymentIntentId, amount, reason } = pendingRefund.current;
        const payload: CreateRefundRequest = {
            payment_intent_id: paymentIntentId,
            ...(amount !== undefined && { amount }),
            ...(reason && { reason }),
        };
        createRefund(accessToken, payload)
            .then(() => {
                toast.success(t("admin.refundSuccess"));
                setSheetOpen(false);
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("admin.refundError"));
                }
            })
            .finally(() => {
                setSubmitting(false);
                pendingRefund.current = null;
            });
    }

    // Subscription handlers
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

    const txColumns: ColumnDef<TransactionAdminDTO>[] = [
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
        { accessorKey: "amount", header: "Amount" },
        { accessorKey: "currency", header: "Currency" },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status
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
            <header className="px-4 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Typography variant="h1">{t("transactions")}</Typography>
            </header>

            <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
                <Tabs defaultValue="transactions">
                    <TabsList>
                        <TabsTrigger value="transactions">{t("transactions")}</TabsTrigger>
                        <TabsTrigger value="subscriptions">{t("subscriptions.licenses")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions">
                        <div className="border rounded-lg">
                            {txLoading ? (
                                <p className="p-4 text-muted-foreground">{t("loading")}</p>
                            ) : (
                                <DataTable
                                    columns={txColumns}
                                    data={transactions}
                                    onRowClick={handleRowClick}
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

            {/* Transaction refund sheet */}
            {selectedTransaction && (
                <TransactionSheet
                    open={sheetOpen}
                    transactionId={selectedTransaction.id}
                    amount={selectedTransaction.amount}
                    currency={selectedTransaction.currency}
                    status={selectedTransaction.status}
                    description={selectedTransaction.description}
                    createdAt={selectedTransaction.created}
                    title={t("admin.viewTransaction")}
                    amountLabel={t("admin.amount")}
                    statusLabel={t("admin.status")}
                    descriptionLabel={t("admin.description")}
                    dateLabel={t("admin.date")}
                    submitting={submitting}
                    onOpenChange={setSheetOpen}
                    onConfirmRefund={handleConfirmRefund}
                />
            )}

            {/* Transaction refund confirm dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("admin.confirmRefund")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.confirmRefundDescription")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setConfirmOpen(false); handleSubmitRefund(); }}>
                            {t("admin.refund")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
