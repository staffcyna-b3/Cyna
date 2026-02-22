export function TypographyH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className='scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance'>
      {children}
    </h1>
  );
}

export function TypographyH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className='scroll-m-20 pb-4 text-3xl font-semibold tracking-tight first:mt-0 font-inter'>
      {children}
    </h2>
  );
}

export function TypographyH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='scroll-m-20 text-lg font-semibold tracking-tight'>
      {children}
    </h3>
  );
}

export function TypographyBody({ children }: { children: React.ReactNode }) {
  return (
    <p className='scroll-m-20 text-base font-normal tracking-tight'>
      {children}
    </p>
  );
}