import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import type { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';
import {
  getContactMessages,
  markContactAsProcessed,
  replyToContact,
  BackOfficeApiError,
} from '@/services/BackOfficeOrderService';

function StatusBadge({ status }: { status: 'new' | 'processed' }) {
  return (
    <Badge variant={status === 'new' ? 'default' : 'secondary'}>
      {status === 'new' ? t('contact.statusNew') : t('contact.statusProcessed')}
    </Badge>
  );
}

function ContactMessageSheet({
  message,
  open,
  onOpenChange,
  onMarked,
}: {
  message: ContactMessageDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarked: (updated: ContactMessageDTO) => void;
}) {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [marking, setMarking] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  if (!message) return null;

  async function handleMark() {
    if (!accessToken || !message) return;
    setMarking(true);
    try {
      const updated = await markContactAsProcessed(accessToken, message.id);
      onMarked(updated);
      toast.success(t('contact.markProcessed'));
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setMarking(false);
    }
  }

  async function handleReply() {
    if (!message || !accessToken || !replyMessage.trim()) return;
    setReplying(true);
    try {
      const updated = await replyToContact(accessToken, message.id, replyMessage);
      onMarked(updated);
      setReplyMessage('');
      onOpenChange(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('contact.support')}</SheetTitle>
          <SheetDescription>{message.id}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t('contact.email')}</Label>
            <span className="text-sm">{message.email}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('contact.subject')}</Label>
            <span className="text-sm">{message.subject}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('contact.message')}</Label>
            <Textarea
              value={message.message}
              readOnly
              disabled
              className="h-32 resize-none opacity-80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('admin.date')}</Label>
            <span className="text-sm text-muted-foreground">
              {new Date(message.created_at).toLocaleString('fr-FR')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('admin.status')}</Label>
            <StatusBadge status={message.status} />
          </div>

          {message.status === 'new' && (
            <Button onClick={handleMark} disabled={marking} variant="outline">
              {t('contact.markProcessed')}
            </Button>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label className="text-sm text-gray-500">{t('contact.replyLabel')}</Label>
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={t('contact.replyPlaceholder')}
              className="h-28 resize-none"
              disabled={replying}
            />
            <Button
              onClick={handleReply}
              disabled={replying || !replyMessage.trim()}
              className="w-full"
            >
              {replying ? t('loading') : t('contact.reply')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Support() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [data, setData] = useState<ContactMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessageDTO | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
        onMarked={handleMarked}
      />
    </>
  );
}
