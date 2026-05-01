import { useTranslation } from 'react-i18next';
import type { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';
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
import { ContactStatusBadge } from '@/components/Backoffice/ContactStatusBadge';

interface ContactMessageSheetProps {
  open: boolean;
  message: ContactMessageDTO | null;
  replyMessage: string;
  replying: boolean;
  marking: boolean;
  onOpenChange: (open: boolean) => void;
  onReplyMessageChange: (value: string) => void;
  onReply: () => void;
  onMarkAsProcessed: () => void;
}

export function ContactMessageSheet({
  open,
  message,
  replyMessage,
  replying,
  marking,
  onOpenChange,
  onReplyMessageChange,
  onReply,
  onMarkAsProcessed,
}: ContactMessageSheetProps) {
  const { t } = useTranslation();

  if (!message) return null;

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
            <ContactStatusBadge status={message.status} />
          </div>

          {message.status === 'new' && (
            <Button onClick={onMarkAsProcessed} disabled={marking} variant="outline">
              {t('contact.markProcessed')}
            </Button>
          )}

          {message.admin_reply && (
            <div className="space-y-1 border-t pt-4">
              <Label className="text-sm text-gray-500">{t('contact.previousReply')}</Label>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3 whitespace-pre-wrap">
                {message.admin_reply}
              </p>
              {message.replied_at && (
                <p className="text-xs text-gray-400">
                  {t('contact.repliedAt')} {new Date(message.replied_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label className="text-sm text-gray-500">{t('contact.replyLabel')}</Label>
            <Textarea
              value={replyMessage}
              onChange={(e) => onReplyMessageChange(e.target.value)}
              placeholder={t('contact.replyPlaceholder')}
              className="h-28 resize-none"
              disabled={replying}
            />
            <Button
              onClick={onReply}
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
