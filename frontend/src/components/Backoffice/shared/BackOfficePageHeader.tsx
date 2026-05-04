import type { ReactNode } from 'react';
import { Typography } from '@/components/ui/typography';
import { SidebarTrigger } from '@/components/ui/sidebar';

type BackOfficePageHeaderProps = {
    title: string;
    rightSlot?: ReactNode;
};

export function BackOfficePageHeader({ title, rightSlot }: BackOfficePageHeaderProps) {
    return (
        <header className="px-6 flex flex-col sm:flex-row sm:h-16 shrink-0 sm:items-center gap-3 py-3 sm:py-0 justify-between">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden -ml-1" />
                <Typography variant="h1">{title}</Typography>
            </div>
            {rightSlot}
        </header>
    );
}
