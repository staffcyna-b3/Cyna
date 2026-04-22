import { DataTable } from "@/components/Backoffice/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
import type { RefundAdminDTO } from "@/types/interfaces/admin/RefundAdminDTO.interface";
import type { CreateRefundRequest } from "@/types/interfaces/admin/CreateRefundRequest.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRefunds, createRefund, BackOfficeApiError } from "@/services/BackOfficeService";
import { toast } from "sonner";

export default function Refunds() {
    const { accessToken } = useAuth();
    const [selected, setSelected] = useState("active");
    const [data, setData] = useState<RefundAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleRefund = (paymentIntentId: string) => {
        if (!accessToken) return;
        if (!confirm(t("admin.confirmRefund"))) return;

        const payload: CreateRefundRequest = { payment_intent_id: paymentIntentId };
        createRefund(accessToken, payload)
            .then(() => {
                toast.success(t("admin.refundSuccess"));
                fetchData();
            })
            .catch((err: unknown) => {
                if (err instanceof BackOfficeApiError && err.status === 401) {
                    toast.error(t("sessionExpired"));
                } else {
                    toast.error(t("admin.refundError"));
                }
            });
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
                    onClick={() => handleRefund(row.original.payment_intent)}
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
                    <DataTable columns={columns} data={data} />
                )}
            </div>
        </>
    );
}
