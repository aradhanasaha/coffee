import NotificationProvider from '@/context/NotificationContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <NotificationProvider>
            {children}
        </NotificationProvider>
    );
}
