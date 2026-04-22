import { DataTable } from "@/components/Backoffice/data-table";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserAdminDTO } from "@/types/interfaces/admin/UserAdminDTO.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUsers, BackOfficeApiError } from "@/services/BackOfficeService";
import { toast } from "sonner";
import { UserEditorSheet } from "./components/UserEditorSheet";

export default function Users() {
    const { accessToken } = useAuth();
    const [selected, setSelected] = useState("active");
    const [data, setData] = useState<UserAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const [selectedUser, setSelectedUser] = useState<UserAdminDTO | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        getUsers(accessToken, page, limit)
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

    const handleRowClick = (user: UserAdminDTO) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setSheetOpen(true);
    };

    const handleSave = () => {
        // TODO: PATCH /api/back-office/users/:id — endpoint not yet implemented
        setSaving(true);
        toast.info(t("admin.notImplemented"));
        setSaving(false);
    };

    const handleDelete = () => {
        // TODO: DELETE /api/back-office/users/:id — endpoint not yet implemented
        setDeleting(true);
        toast.info(t("admin.notImplemented"));
        setDeleting(false);
    };

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button variant={selected === "active" ? 'selected' : 'notSelected'} onClick={() => setSelected("active")}>{t("active")}</Button>
            <Button variant={selected === "inactive" ? 'selected' : 'notSelected'} onClick={() => setSelected("inactive")}>{t("inactive")}</Button>
        </div>
    );

    const columns: ColumnDef<UserAdminDTO>[] = [
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
        { accessorKey: "full_name", header: "Full Name" },
        { accessorKey: "email", header: "Email" },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Role
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <>
            <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Typography variant="h1">{t("users")}</Typography>
                {topRightActions}
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 border m-4 rounded-lg">
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
                            <span className="text-sm text-muted-foreground">{total} {t("users")}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t("previous")}</Button>
                                <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>{t("next")}</Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {selectedUser && (
                <UserEditorSheet
                    open={sheetOpen}
                    userId={selectedUser.id}
                    fullName={selectedUser.full_name}
                    email={selectedUser.email}
                    role={editRole}
                    createdAt={selectedUser.created_at}
                    title={t("admin.editUser")}
                    saveLabel={t("update")}
                    deleteLabel={t("admin.deleteUser")}
                    roleLabel={t("admin.role")}
                    saving={saving}
                    deleting={deleting}
                    onOpenChange={setSheetOpen}
                    onRoleChange={setEditRole}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}
