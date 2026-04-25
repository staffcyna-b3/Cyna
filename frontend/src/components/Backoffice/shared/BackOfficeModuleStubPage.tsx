import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeStatusToggle } from '@/components/Backoffice/shared/BackOfficeStatusToggle';
import { Typography } from '@/components/ui/typography';

type BackOfficeModuleStubPageProps = {
    title: string;
    activeLabel: string;
    inactiveLabel: string;
    message: string;
};

export function BackOfficeModuleStubPage({
    title,
    activeLabel,
    inactiveLabel,
    message,
}: BackOfficeModuleStubPageProps) {
    return (
        <>
            <BackOfficePageHeader
                title={title}
                rightSlot={
                    <BackOfficeStatusToggle
                        value="active"
                        activeLabel={activeLabel}
                        inactiveLabel={inactiveLabel}
                        onChange={() => undefined}
                    />
                }
            />
            <div className="px-6 pb-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <Typography variant="h3" className="mb-2 text-gray-900">
                        {title}
                    </Typography>
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
            </div>
        </>
    );
}
