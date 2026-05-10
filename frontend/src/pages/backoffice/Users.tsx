import { DataTable } from "@/components/Backoffice/data-table/data-table";
import { Button } from "@/components/ui/button";
import { BackOfficePageHeader } from "@/components/Backoffice/shared/BackOfficePageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserAdminDTO } from "@/types/interfaces/admin/UserAdminDTO.interface";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { LucideArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUsers, updateUserRole, deleteUser, BackOfficeApiError } from "@/services/BackOfficeOrderService";
import { toast } from "sonner";
import { UserEditorSheet } from "../../components/Backoffice/sheets/UserEditorSheet";

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

    function handleRowClick(user: UserAdminDTO) {
        setSelectedUser(user);
        setEditRole(user.role);
        setSheetOpen(true);
    }

    async function handleSave() {
        if (!selectedUser || !accessToken) return;
        setSaving(true);
        try {
            const updated = await updateUserRole(accessToken, selectedUser.id, editRole);
            setData((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setSheetOpen(false);
            toast.success(t("admin.userUpdated"));
        } catch (err: unknown) {
            if (err instanceof BackOfficeApiError && err.status === 401) {
                toast.error(t("sessionExpired"));
            } else {
                toast.error(t("errorOccurred"));
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!selectedUser || !accessToken) return;
        setDeleting(true);
        try {
            await deleteUser(accessToken, selectedUser.id);
            setData((prev) => prev.filter((u) => u.id !== selectedUser.id));
            setSheetOpen(false);
            toast.success(t("admin.userDeleted"));
        } catch (err: unknown) {
            if (err instanceof BackOfficeApiError && err.status === 401) {
                toast.error(t("sessionExpired"));
            } else {
                toast.error(t("errorOccurred"));
            }
        } finally {
            setDeleting(false);
        }
    }

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 w-fit">
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
            <BackOfficePageHeader title={t("users")} rightSlot={topRightActions} />
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
                    deleteLabel={t("delete")}
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
