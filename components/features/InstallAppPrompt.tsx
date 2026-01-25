"use client";

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallAppPrompt() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-between backdrop-blur-sm/90">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Download className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="font-bold text-sm lowercase leading-tight">install app</span>
                        <span className="text-xs opacity-90 lowercase">add to home screen</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleInstallClick}
                        className="bg-background text-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-background/90 transition-colors shadow-sm lowercase"
                    >
                        get
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
