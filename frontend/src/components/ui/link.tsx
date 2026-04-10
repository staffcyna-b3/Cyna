import { NavLink } from "react-router-dom";

export function Link({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} className='text-primary underline hover:text-primary-foreground'>
      {children}
    </NavLink>
  );
}