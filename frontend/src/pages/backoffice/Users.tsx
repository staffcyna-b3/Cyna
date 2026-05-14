import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Button } from '@/components/ui/button';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeListToolbar } from '@/components/Backoffice/shared/BackOfficeListToolbar';
import type { UserAdminDTO } from '@/types/interfaces/admin/UserAdminDTO.interface';
import type { ColumnDef } from '@tanstack/react-table';
import { LucideArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUsers, updateUserRole, deleteUser, BackOfficeApiError } from '@/services/BackOfficeOrderService';
import { UserEditorSheet } from '../../components/Backoffice/sheets/UserEditorSheet';

type UserGroup = 'client' | 'professional';

export default function Users() {
    const { t } = useTranslation();
    const { accessToken } = useAuth();

    const [userGroup, setUserGroup] = useState<UserGroup>('client');
    const [data, setData] = useState<UserAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const [search, setSearch] = useState('');

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
                    toast.error(t('sessionExpired'));
                } else {
                    toast.error(t('errorOccurred'));
                }
            })
            .finally(() => setLoading(false));
    }, [accessToken, page]);

    const filteredData = useMemo(() => {
        const searchLower = search.trim().toLowerCase();
        return data.filter((user) => {
            const role = user.role.toUpperCase();
            const groupMatch =
                userGroup === 'client'
                    ? role === 'USER'
                    : role === 'ADMIN' || role === 'COMMERCIAL';
            const searchMatch =
                !searchLower ||
                user.full_name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower);
            return groupMatch && searchMatch;
        });
    }, [data, userGroup, search]);

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
            toast.success(t('admin.userUpdated'));
        } catch (err: unknown) {
            if (err instanceof BackOfficeApiError && err.status === 401) {
                toast.error(t('sessionExpired'));
            } else {
                toast.error(t('errorOccurred'));
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
            toast.success(t('admin.userDeleted'));
        } catch (err: unknown) {
            if (err instanceof BackOfficeApiError && err.status === 401) {
                toast.error(t('sessionExpired'));
            } else {
                toast.error(t('errorOccurred'));
            }
        } finally {
            setDeleting(false);
        }
    }

    const columns: ColumnDef<UserAdminDTO>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'full_name', header: t('fullName') },
        { accessorKey: 'email', header: t('email') },
        {
            accessorKey: 'role',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('admin.role')}
                    <LucideArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
    ];

    const globalToggle = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 self-start sm:self-auto shadow-sm">
            <Button
                type="button"
                variant={userGroup === 'client' ? 'selected' : 'notSelected'}
                onClick={() => setUserGroup('client')}
            >
                {t('backoffice.usersClients')}
            </Button>
            <Button
                type="button"
                variant={userGroup === 'professional' ? 'selected' : 'notSelected'}
                onClick={() => setUserGroup('professional')}
            >
                {t('backoffice.usersProfessionals')}
            </Button>
        </div>
    );

    return (
        <>
            <BackOfficePageHeader title={t('users')} rightSlot={globalToggle} />
            <div className="px-6 pb-6 space-y-3">
                <BackOfficeListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder={t('backoffice.searchByNameOrEmail')}
                    searchAriaLabel={t('search')}
                />
                {loading ? (
                    <div className="rounded-md border p-6 text-sm text-muted-foreground">
                        {t('loading')}
                    </div>
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            onRowClick={handleRowClick}
                        />
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
                    title={t('admin.editUser')}
                    saveLabel={t('update')}
                    deleteLabel={t('admin.deleteUser')}
                    roleLabel={t('admin.role')}
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
