import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/hooks/useAuth';
import type { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';
import {
  getContactMessages,
  markContactAsProcessed,
  replyToContact,
  BackOfficeApiError,
} from '@/services/BackOfficeOrderService';
import { ContactMessageSheet, StatusBadge } from './components/ContactMessageSheet';

export default function Support() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [data, setData] = useState<ContactMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessageDTO | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [marking, setMarking] = useState(false);

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
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleString('fr-FR'),
    },
    { accessorKey: 'email', header: t('contact.email') },
    { accessorKey: 'subject', header: t('contact.subject') },
    {
      accessorKey: 'status',
      header: t('admin.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <>
      <header className="px-4 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <Typography variant="h1">{t('contact.support')}</Typography>
      </header>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0 border m-4 rounded-lg">
        {loading ? (
          <p className="p-4 text-muted-foreground">{t('loading')}</p>
        ) : (
          <DataTable columns={columns} data={data} onRowClick={handleRowClick} />
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
