import React, { JSX } from 'react';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body';
  className?: string;
}

const variantStyles: Record<string, string> = {
  h1: 'scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance font-space-grotesk',
  h2: 'scroll-m-20 pb-4 text-3xl font-semibold tracking-tight first:mt-0 font-space-grotesk text-left',
  h3: 'scroll-m-20 text-lg font-semibold tracking-tight font-space-grotesk',
  body: 'scroll-m-20 text-base font-normal tracking-tight',
};

const variantTags: Record<string, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
};

export const Typography: React.FC<TypographyProps> = ({ 
  children, 
  variant = 'body',
  className = ''
}) => {
  const Tag = variantTags[variant] as React.ElementType;
  const styles = `${variantStyles[variant]} ${className}`;

  return <Tag className={styles}>{children}</Tag>;
};