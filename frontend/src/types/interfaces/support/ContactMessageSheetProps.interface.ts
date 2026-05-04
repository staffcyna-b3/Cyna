import type { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';

export interface ContactMessageSheetProps {
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
