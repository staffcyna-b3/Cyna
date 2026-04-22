import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type UserEditorSheetProps = {
  open: boolean;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  title: string;
  saveLabel: string;
  deleteLabel: string;
  roleLabel: string;
  saving: boolean;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
};

export function UserEditorSheet({
  open,
  userId,
  fullName,
  email,
  role,
  createdAt,
  title,
  saveLabel,
  deleteLabel,
  roleLabel,
  saving,
  deleting,
  onOpenChange,
  onRoleChange,
  onSave,
  onDelete,
}: UserEditorSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="flex flex-row items-center justify-between border-b p-4">
          <div className="flex flex-col gap-0.5">
            <SheetTitle>{title}</SheetTitle>
            <span className="text-xs text-muted-foreground font-mono">{userId}</span>
            <span className="text-sm font-medium">{fullName}</span>
          </div>
          <Button onClick={onSave} disabled={saving} size="sm">
            {saveLabel}
          </Button>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-fullname">Nom complet</Label>
            <Input id="user-fullname" value={fullName} readOnly disabled className="opacity-60" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" value={email} readOnly disabled className="opacity-60" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-role">{roleLabel}</Label>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Date de création</Label>
            <span className="text-sm text-muted-foreground">
              {new Date(createdAt).toLocaleString('fr-FR')}
            </span>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={deleting}
            className="w-full"
          >
            {deleteLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
