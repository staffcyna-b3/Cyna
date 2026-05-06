import { Link } from 'react-router-dom';

const baseStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', textDecoration: 'none' };
const hoverStyle: React.CSSProperties = { color: 'rgba(255,255,255,1)' };

interface FooterLinkProps {
    to: string;
    children: React.ReactNode;
}

export function FooterLink({ to, children }: FooterLinkProps) {
    return (
        <Link
            to={to}
            style={baseStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, baseStyle)}
            className='text-sm transition-colors'
        >
            {children}
        </Link>
    );
}
