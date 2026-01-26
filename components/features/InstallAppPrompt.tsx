"use client";

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface InstallAppPromptProps {
    variant?: 'banner' | 'landing';
}

export default function InstallAppPrompt({ variant = 'banner' }: InstallAppPromptProps) {
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check for iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            // For landing variant, always show. For banner, maybe show after delay or check if standalone?
            // Checking if already in standalone mode
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
            if (!isStandalone) {
                setIsVisible(true);
            }
        }

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
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const isLanding = variant === 'landing';

    // iOS Instruction Modal
    if (showIOSInstructions) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-journal-bg rounded-3xl p-6 w-full max-w-sm border border-primary/20 shadow-2xl space-y-4 text-center">
                    <div className="flex justify-end">
                        <button onClick={() => setShowIOSInstructions(false)} className="text-journal-text/40 hover:text-journal-text transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Share className="w-8 h-8 text-primary" />
                    </div>

                    <h3 className="text-xl font-bold text-journal-text lowercase">install on ios</h3>

                    <p className="text-journal-text/80 text-sm leading-relaxed">
                        to install this app on your iphone or ipad:
                    </p>

                    <ol className="text-left text-sm space-y-3 bg-secondary/30 p-4 rounded-xl text-journal-text/80">
                        <li className="flex gap-3">
                            <span className="bg-primary/20 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary">1</span>
                            <span>tap the <span className="font-bold">share</span> button in your browser/toolbar</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="bg-primary/20 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary">2</span>
                            <span>scroll down and select <span className="font-bold">"add to home screen"</span></span>
                        </li>
                    </ol>

                    <button
                        onClick={() => setShowIOSInstructions(false)}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold lowercase hover:bg-primary/90 transition-colors"
                    >
                        got it
                    </button>
                </div>
            </div>
        )
    }

    if (!isVisible) return null;

    if (isLanding) {
        return (
            <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 md:gap-3 text-espresso font-bold text-2xl md:text-3xl hover:opacity-80 transition-opacity cursor-pointer group mt-2"
                title="Install App"
            >
                <span>get the app</span>
                <Download className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-y-1 transition-transform" strokeWidth={3} />
            </button>
        );
    }

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
