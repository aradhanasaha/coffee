"use client";

import { useNotificationContext } from "@/context/NotificationContext";
import NotificationToast from "./NotificationToast";

export default function ToastManager() {
    const { latestNotification, clearLatestNotification } = useNotificationContext();

    return (
        <NotificationToast
            notification={latestNotification}
            onDismiss={clearLatestNotification}
        />
    );
}
