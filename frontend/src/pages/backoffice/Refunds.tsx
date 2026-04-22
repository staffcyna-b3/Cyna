import { DataTable } from "@/components/Backoffice/data-table";
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
import type { RefundAdminDTO } from "@/types/interfaces/admin/RefundAdminDTO.interface";
import type { CreateRefundRequest } from "@/types/interfaces/admin/CreateRefundRequest.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRefunds, createRefund, BackOfficeApiError } from "@/services/BackOfficeService";
import { toast } from "sonner";
import { RefundSheet } from "./components/RefundSheet";

export default function Refunds() {
    const { accessToken } = useAuth();
    const [selected, setSelected] = useState("active");
    const [data, setData] = useState<RefundAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedRefund, setSelectedRefund] = useState<RefundAdminDTO | null>(null);
    const [viewSheetOpen, setViewSheetOpen] = useState(false);
    const [createSheetOpen, setCreateSheetOpen] = useState(false);
    const [createPaymentIntentId, setCreatePaymentIntentId] = useState('');
    const [createAmount, setCreateAmount] = useState<number | undefined>(undefined);
    const [createReason, setCreateReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const fetchData = () => {
        if (!accessToken) return;
        setLoading(true);
        getRefunds(accessToken)
            .then(setData)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [accessToken]);

    const handleRowClick = (refund: RefundAdminDTO) => {
        setSelectedRefund(refund);
        setViewSheetOpen(true);
    };

    const handleOpenCreate = (paymentIntentId: string) => {
        setCreatePaymentIntentId(paymentIntentId);
        setCreateAmount(undefined);
        setCreateReason('');
        setCreateSheetOpen(true);
    };

    const handleCreateRefund = () => {
        if (!accessToken) return;
        setSubmitting(true);
        const payload: CreateRefundRequest = {
            payment_intent_id: createPaymentIntentId,
            ...(createAmount !== undefined && { amount: createAmount }),
            ...(createReason && { reason: createReason }),
        };
        createRefund(accessToken, payload)
            .then(() => {
                toast.success(t("admin.refundSuccess"));
                setCreateSheetOpen(false);
                fetchData();
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("admin.refundError"));
                }
            })
            .finally(() => setSubmitting(false));
    };

    const handleRefundRequest = () => setConfirmOpen(true);

    const handleConfirmRefund = () => {
        setConfirmOpen(false);
        handleCreateRefund();
    };

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button variant={selected === "active" ? 'selected' : 'notSelected'} onClick={() => setSelected("active")}>{t("active")}</Button>
            <Button variant={selected === "inactive" ? 'selected' : 'notSelected'} onClick={() => setSelected("inactive")}>{t("inactive")}</Button>
        </div>
    );

    const columns: ColumnDef<RefundAdminDTO>[] = [
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
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        { accessorKey: "reason", header: "Reason" },
        { accessorKey: "payment_intent", header: "Payment Intent" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreate(row.original.payment_intent);
                    }}
                >
                    {t("admin.refund")}
                </Button>
            ),
        },
    ];

    return (
        <>
            <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Typography variant="h1">{t("refunds")}</Typography>
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

            {selectedRefund && (
                <RefundSheet
                    open={viewSheetOpen}
                    mode="view"
                    refundId={selectedRefund.id}
                    refundAmount={selectedRefund.amount}
                    refundStatus={selectedRefund.status}
                    refundReason={selectedRefund.reason}
                    refundCreatedAt={selectedRefund.created}
                    title={t("admin.viewRefund")}
                    confirmLabel={t("admin.confirm")}
                    cancelLabel={t("cancel")}
                    amountLabel={t("admin.amount")}
                    reasonLabel={t("admin.reason")}
                    paymentIntentLabel="Payment Intent"
                    submitting={false}
                    onOpenChange={setViewSheetOpen}
                />
            )}

            <RefundSheet
                open={createSheetOpen}
                mode="create"
                paymentIntentId={createPaymentIntentId}
                title={t("admin.createRefund")}
                confirmLabel={t("admin.confirm")}
                cancelLabel={t("cancel")}
                amountLabel={t("admin.amount")}
                reasonLabel={t("admin.reason")}
                paymentIntentLabel="Payment Intent"
                submitting={submitting}
                amount={createAmount}
                reason={createReason}
                onOpenChange={setCreateSheetOpen}
                onAmountChange={setCreateAmount}
                onReasonChange={setCreateReason}
                onConfirm={handleRefundRequest}
            />
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.confirmRefund')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.confirmRefundDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRefund}>{t('admin.refund')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
