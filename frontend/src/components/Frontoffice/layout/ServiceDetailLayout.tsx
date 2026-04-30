import React, { JSX, ReactNode } from 'react';

interface ServiceDetailLayoutProps {
    title: string;
    description: string;
    abbreviation: string;
    badge?: ReactNode;
    children: ReactNode;
}

export default function ServiceDetailLayout({
    title,
    description,
    abbreviation,
    badge,
    children,
}: ServiceDetailLayoutProps): JSX.Element {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-10 items-center py-8 md:py-12">
            {/* Left - Text Content */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center gap-6">
                <div className="space-y-4">
                    {badge && (
                        <div className="inline-block">
                            {badge}
                        </div>
                    )}
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                        <span className="text-transparent bg-gradient-to-r from-white via-[#e0e7ff] to-[#c7d2fe] bg-clip-text">
                            {title}
                        </span>
                    </h1>
                    <p className="text-base lg:text-lg text-[#b7bdd9] leading-relaxed max-w-lg">
                        {description}
                    </p>
                </div>

                {children}
            </div>

            {/* Right - Logo Circle */}
            <div className="col-span-12 lg:col-span-6 flex items-center justify-center py-8 lg:py-0">
                <div className="relative w-72 h-72 flex items-center justify-center">
                    {/* Animated background circles */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7b61ff]/40 to-[#2b6ef6]/40 blur-3xl animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#7b61ff]/60 shadow-lg shadow-[#7b61ff]/20" />
                    <div className="absolute inset-8 rounded-full border border-[#2b6ef6]/60" />
                    <div className="absolute inset-16 rounded-full border border-[#7b61ff]/40" />
                    
                    {/* Center circle with abbreviation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full w-56 h-56 bg-gradient-to-br from-[#7b61ff] via-[#6b47ff] to-[#2b6ef6] flex items-center justify-center shadow-2xl shadow-[#7b61ff]/50">
                            <span className="text-7xl font-black text-white drop-shadow-2xl">
                                {abbreviation}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
