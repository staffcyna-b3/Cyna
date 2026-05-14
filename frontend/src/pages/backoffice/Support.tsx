import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeListToolbar } from '@/components/Backoffice/shared/BackOfficeListToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import type { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';
import {
  getContactMessages,
  markContactAsProcessed,
  replyToContact,
  BackOfficeApiError,
} from '@/services/BackOfficeOrderService';
import { ContactMessageSheet } from '@/components/Backoffice/sheets/ContactMessageSheet';
import { ContactStatusBadge } from '@/components/Backoffice/ContactStatusBadge';

export default function Support() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [data, setData] = useState<ContactMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'processed'>('all');
  const [selected, setSelected] = useState<ContactMessageDTO | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [marking, setMarking] = useState(false);

  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    getContactMessages(accessToken)
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof BackOfficeApiError && err.status === 401) {
          toast.error(t('sessionExpired'));
        } else {
          toast.error(t('errorOccurred'));
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  function handleRowClick(msg: ContactMessageDTO) {
    setSelected(msg);
    setSheetOpen(true);
  }

  function handleMarked(updated: ContactMessageDTO) {
    setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelected(updated);
  }

  async function handleMarkAsProcessed() {
    if (!accessToken || !selected) return;
    setMarking(true);
    try {
      const updated = await markContactAsProcessed(accessToken, selected.id);
      handleMarked(updated);
      toast.success(t('contact.markProcessed'));
    } catch (err: unknown) {
      if (err instanceof BackOfficeApiError && err.status === 401) {
        toast.error(t('sessionExpired'));
      } else {
        toast.error(t('errorOccurred'));
      }
    } finally {
      setMarking(false);
    }
  }

  async function handleReply() {
    if (!selected || !accessToken || !replyMessage.trim()) return;
    setReplying(true);
    try {
      const updated = await replyToContact(accessToken, selected.id, replyMessage);
      handleMarked(updated);
      setReplyMessage('');
      setSheetOpen(false);
      toast.success(t('contact.replySent'));
    } catch (err: unknown) {
      if (err instanceof BackOfficeApiError && err.status === 401) {
        toast.error(t('sessionExpired'));
      } else {
        toast.error(t('errorOccurred'));
      }
    } finally {
      setReplying(false);
    }
  }

  const columns: ColumnDef<ContactMessageDTO>[] = [
    {
      accessorKey: 'created_at',
      header: t('admin.date'),
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString('fr-FR'),
    },
    { accessorKey: 'email', header: t('contact.email') },
    { accessorKey: 'subject', header: t('contact.subject') },
    {
      accessorKey: 'status',
      header: t('admin.status'),
      cell: ({ row }) => <ContactStatusBadge status={row.original.status} />,
    },
  ];

  const filteredData = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null;
    return data.filter((msg) => {
      const statusMatch = statusFilter === 'all' || msg.status === statusFilter;
      const searchMatch = !searchLower || msg.email.toLowerCase().includes(searchLower);
      const msgDate = new Date(msg.created_at).getTime();
      const dateMatch = (!from || msgDate >= from) && (!to || msgDate <= to);
      return statusMatch && searchMatch && dateMatch;
    });
  }, [data, statusFilter, search, dateFrom, dateTo]);

  function resetFilters() {
    setDateFrom('');
    setDateTo('');
    setSearch('');
  }

  const statusToggle = (
    <div className="flex items-center gap-2 bg-primary rounded-full p-1 self-start sm:self-auto shadow-sm">
      <Button
        type="button"
        variant={statusFilter === 'all' ? 'selected' : 'notSelected'}
        onClick={() => setStatusFilter('all')}
      >
        {t('contact.statusAll')}
      </Button>
      <Button
        type="button"
        variant={statusFilter === 'new' ? 'selected' : 'notSelected'}
        onClick={() => setStatusFilter('new')}
      >
        {t('contact.statusNew')}
      </Button>
      <Button
        type="button"
        variant={statusFilter === 'processed' ? 'selected' : 'notSelected'}
        onClick={() => setStatusFilter('processed')}
      >
        {t('contact.statusProcessed')}
      </Button>
    </div>
  );

  return (
    <>
      <BackOfficePageHeader title={t('contact.support')} rightSlot={statusToggle} />
      <div className="px-6 pb-6 space-y-3">
        <BackOfficeListToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('backoffice.searchBySenderEmail')}
          searchAriaLabel={t('search')}
          filterLabel={t('filters')}
          onFilterClick={() => setFilterOpen((prev) => !prev)}
          filterActive={!!dateFrom || !!dateTo}
          filterPanel={
            filterOpen ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <Label className="mb-1.5 block text-sm text-gray-600">
                      {t('backoffice.dateFrom')}
                    </Label>
                    <Input
                      type="date"
                      className="h-9"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm text-gray-600">
                      {t('backoffice.dateTo')}
                    </Label>
                    <Input
                      type="date"
                      className="h-9"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" className="h-9" onClick={resetFilters}>
                    {t('resetFilters')}
                  </Button>
                </div>
              </div>
            ) : null
          }
        />
        {loading ? (
          <div className="rounded-md border p-6 text-sm text-muted-foreground">
            {t('loading')}
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} onRowClick={handleRowClick} />
        )}
      </div>
      <ContactMessageSheet
        message={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        replyMessage={replyMessage}
        replying={replying}
        marking={marking}
        onReplyMessageChange={setReplyMessage}
        onReply={handleReply}
        onMarkAsProcessed={handleMarkAsProcessed}
      />
    </>
  );
}
