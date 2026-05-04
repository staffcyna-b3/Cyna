import { Button } from '@/components/ui/button';
import type { StatusValue } from '@/types/backoffice/StatusValue';

type BackOfficeStatusToggleProps = {
    value: StatusValue;
    activeLabel: string;
    inactiveLabel: string;
    onChange: (next: StatusValue) => void;
};

export function BackOfficeStatusToggle({
    value,
    activeLabel,
    inactiveLabel,
    onChange,
}: BackOfficeStatusToggleProps) {
    return (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1 self-start sm:self-auto shadow-sm">
            <Button
                type="button"
                variant={value === 'active' ? 'selected' : 'notSelected'}
                onClick={() => onChange('active')}
            >
                {activeLabel}
            </Button>
            <Button
                type="button"
                variant={value === 'inactive' ? 'selected' : 'notSelected'}
                onClick={() => onChange('inactive')}
            >
                {inactiveLabel}
            </Button>
        </div>
    );
}
