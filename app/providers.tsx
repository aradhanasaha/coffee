import NotificationProvider from '@/context/NotificationContext';
import ServiceWorkerRegister from '@/components/common/ServiceWorkerRegister';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <NotificationProvider>
            <ServiceWorkerRegister />
            {children}
        </NotificationProvider>
    );
}
