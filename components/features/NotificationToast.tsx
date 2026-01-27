"use client";

import { useEffect, useState } from 'react';
import { Heart, UserPlus, Coffee, Bookmark, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/core/types/types';

interface NotificationToastProps {
    notification: Notification | null;
    onDismiss: () => void;
}

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300); // Wait for fade out
            }, 4000); // Show for 4 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, onDismiss]);

    if (!notification && !isVisible) return null;

    const handleClick = () => {
        setIsVisible(false);
        onDismiss();

        // Navigate mainly to user profile of the sender
        const senderUsername = notification?.sender?.username;
        if (senderUsername) {
            router.push(`/user/${senderUsername}`);
        }
    };

    const getIcon = () => {
        switch (notification?.type) {
            case 'like': return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
            case 'follow': return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'post': return <Coffee className="w-5 h-5 text-amber-700" />;
            case 'save_list': return <Bookmark className="w-5 h-5 text-orange-500 fill-orange-500" />;
            default: return <Coffee className="w-5 h-5 text-gray-500" />;
        }
    };

    const getText = () => {
        const username = notification?.sender?.username || 'Someone';
        switch (notification?.type) {
            case 'like': return <><b>@{username}</b> liked your coffee log</>;
            case 'follow': return <><b>@{username}</b> started following you</>;
            case 'post': return <><b>@{username}</b> posted a new coffee log</>;
            case 'save_list': return <><b>@{username}</b> saved your coffee log</>;
            default: return <>New notification from <b>@{username}</b></>;
        }
    };

    return (
        <div
            className={`fixed top-6 md:top-20 left-1/2 -translate-x-1/2 z-[5000] w-[90%] md:w-auto md:min-w-[320px] transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}
        >
            <div
                onClick={handleClick}
                className="bg-journal-card border border-journal-text/10 shadow-2xl rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-journal-text/5 transition-colors"
                style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
            >
                <div>
                    {getIcon()}
                </div>
                <div className="flex-1 text-sm text-journal-text">
                    {getText()}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                        onDismiss();
                    }}
                    className="p-1 hover:bg-journal-text/10 rounded-full text-journal-text/40 hover:text-journal-text"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
