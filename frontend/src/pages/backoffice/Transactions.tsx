import { DataTable } from "@/components/Backoffice/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
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
import type { CreateRefundRequest } from "@/types/interfaces/admin/CreateRefundRequest.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTransactions, createRefund, BackOfficeApiError } from "@/services/BackOfficeService";
import { toast } from "sonner";
import { TransactionSheet } from "../../components/Backoffice/sheets/TransactionSheet";

export default function Transactions() {
    const { accessToken } = useAuth();
    const [selected, setSelected] = useState("active");
    const [data, setData] = useState<TransactionAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTransaction, setSelectedTransaction] = useState<TransactionAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pendingRefund = useRef<{ paymentIntentId: string; amount: number | undefined; reason: string } | null>(null);

    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        getTransactions(accessToken)
            .then(setData)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setLoading(false));
    }, [accessToken]);

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

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button variant={selected === "active" ? 'selected' : 'notSelected'} onClick={() => setSelected("active")}>{t("active")}</Button>
            <Button variant={selected === "inactive" ? 'selected' : 'notSelected'} onClick={() => setSelected("inactive")}>{t("inactive")}</Button>
        </div>
    );

    const columns: ColumnDef<TransactionAdminDTO>[] = [
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

    return (
        <>
            <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Typography variant="h1">{t("transactions")}</Typography>
                {topRightActions}
            </header>
            <div className="flex flex-1 flex-col gap-2 p-4 pt-0 border m-4 rounded-lg">
                {loading ? (
                    <p className="p-4 text-muted-foreground">{t("loading")}</p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        onRowClick={handleRowClick}
                    />
                )}
            </div>
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
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.confirmRefund')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.confirmRefundDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setConfirmOpen(false); handleSubmitRefund(); }}>
                            {t('admin.refund')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
