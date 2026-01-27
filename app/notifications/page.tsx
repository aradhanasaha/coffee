"use client";

import JournalLayout from '@/components/layout/JournalLayout';
import { Bell } from 'lucide-react';
import PushNotificationManager from '@/components/features/PushNotificationManager';

export default function NotificationsPage() {
    return (
        <JournalLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                    <Bell className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-journal-text">Notifications</h1>
                <p className="text-muted-foreground">No new notifications.</p>
                <div className="pt-4">
                    <PushNotificationManager />
                </div>
            </div>
        </JournalLayout>
    );
}
