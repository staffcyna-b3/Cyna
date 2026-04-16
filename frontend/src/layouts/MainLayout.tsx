import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Frontoffice/Navbar';

export default function MainLayout() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}
