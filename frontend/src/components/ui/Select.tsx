import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Select({
    value,
    onChange,
    children,
    className,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className={cn('relative inline-flex items-center', className)}>
            <select
                value={value}
                onChange={onChange}
                className="appearance-none pr-8 pl-3 py-2 bg-[#0d0a16] border border-transparent rounded-md text-sm text-[#b7bdd9] w-full focus:outline-none focus:ring-2 focus:ring-[#7b61ff]"
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 text-[#9aa0c7]" />
        </div>
    );
}
