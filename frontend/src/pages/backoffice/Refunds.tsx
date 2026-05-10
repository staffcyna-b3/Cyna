import { DataTable } from "@/components/Backoffice/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BackOfficePageHeader } from "@/components/Backoffice/shared/BackOfficePageHeader";
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
import type { RefundRequestAdminDTO } from "@/types/interfaces/admin/RefundRequestAdminDTO.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    getRefunds,
    getRefundRequests,
    updateRefundRequestStatus,
    BackOfficeApiError,
} from "@/services/BackOfficeOrderService";
import { toast } from "sonner";
import { RefundSheet } from "../../components/Backoffice/sheets/RefundSheet";

type View = "requests" | "processed";

export default function Refunds() {
    const { accessToken } = useAuth();
    const [view, setView] = useState<View>("requests");

    // Processed refunds
    const [refunds, setRefunds] = useState<RefundAdminDTO[]>([]);
    const [refundsLoading, setRefundsLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState<RefundAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Refund requests
    const [requests, setRequests] = useState<RefundRequestAdminDTO[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<{ id: number; action: "approved" | "rejected" } | null>(null);

    useEffect(() => {
        if (!accessToken) return;
        setRefundsLoading(true);
        getRefunds(accessToken)
            .then(setRefunds)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setRefundsLoading(false));
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) return;
        setRequestsLoading(true);
        getRefundRequests(accessToken)
            .then(setRequests)
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setRequestsLoading(false));
    }, [accessToken]);

    function handleRowClick(refund: RefundAdminDTO) {
        setSelectedRefund(refund);
        setSheetOpen(true);
    }

    function handleAction(id: number, action: "approved" | "rejected") {
        setConfirmTarget({ id, action });
    }

    function handleConfirm() {
        if (!accessToken || !confirmTarget) return;
        setSubmitting(true);
        updateRefundRequestStatus(accessToken, confirmTarget.id, confirmTarget.action)
            .then((updated) => {
                setRequests((prev) => prev.filter((r) => r.id !== updated.id));
                toast.success(
                    confirmTarget.action === "approved"
                        ? t("admin.refundRequestApproved")
                        : t("admin.refundRequestRejected")
                );
                setConfirmTarget(null);
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else if (err instanceof BackOfficeApiError) {
                    toast.error(err.message);
                } else {
                    toast.error(t("errorOccurred"));
                }
            })
            .finally(() => setSubmitting(false));
    }

    const refundColumns: ColumnDef<RefundAdminDTO>[] = [
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
        {
            accessorKey: "amount",
            header: t("admin.amount"),
            cell: ({ row }) =>
                (row.original.amount / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
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
        { accessorKey: "reason", header: t("admin.reason") },
        { accessorKey: "payment_intent", header: "Payment Intent" },
        {
            accessorKey: "created",
            header: t("admin.date"),
            cell: ({ row }) => new Date(row.original.created * 1000).toLocaleDateString("fr-FR"),
        },
    ];

    const requestColumns: ColumnDef<RefundRequestAdminDTO>[] = [
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
        { accessorKey: "user_id", header: t("admin.client") },
        { accessorKey: "stripe_subscription_id", header: t("admin.subscription") },
        { accessorKey: "reason", header: t("admin.reason") },
        {
            accessorKey: "created_at",
            header: t("admin.date"),
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString("fr-FR"),
        },
        {
            id: "actions",
            header: t("admin.actions"),
            cell: ({ row }) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" onClick={() => handleAction(row.original.id, "approved")}>
                        {t("admin.approve")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(row.original.id, "rejected")}>
                        {t("admin.reject")}
                    </Button>
                </div>
            ),
        },
    ];

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 w-fit">
            <Button
                variant={view === "requests" ? "selected" : "notSelected"}
                onClick={() => setView("requests")}
            >
                Demandes
            </Button>
            <Button
                variant={view === "processed" ? "selected" : "notSelected"}
                onClick={() => setView("processed")}
            >
                Traitées
            </Button>
        </div>
    );

    return (
        <>
            <BackOfficePageHeader title={t("refunds")} rightSlot={topRightActions} />

            <div className="flex flex-1 flex-col gap-2 p-4 pt-0 border m-4 rounded-lg">
                {view === "requests" ? (
                    requestsLoading ? (
                        <p className="p-4 text-muted-foreground">{t("loading")}</p>
                    ) : (
                        <DataTable columns={requestColumns} data={requests} />
                    )
                ) : (
                    refundsLoading ? (
                        <p className="p-4 text-muted-foreground">{t("loading")}</p>
                    ) : (
                        <DataTable columns={refundColumns} data={refunds} onRowClick={handleRowClick} />
                    )
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
                    title={t("admin.viewRefund")}
                    amountLabel={t("admin.amount")}
                    reasonLabel={t("admin.reason")}
                    paymentIntentLabel="Payment Intent"
                    onOpenChange={setSheetOpen}
                />
            )}

            <AlertDialog open={!!confirmTarget} onOpenChange={(v) => { if (!v) setConfirmTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmTarget?.action === "approved"
                                ? t("admin.confirmApproveRefund")
                                : t("admin.confirmRejectRefund")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.confirmRefundDescription")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={submitting}>
                            {submitting ? t("loading") : t("admin.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
