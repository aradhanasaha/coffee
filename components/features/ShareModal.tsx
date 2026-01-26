"use client";

import { useEffect, useState } from 'react';
import { X, Download, Share2, Copy, Instagram } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageBlob: Blob | null;
    fileName: string;
}

export default function ShareModal({ isOpen, onClose, imageBlob, fileName }: ShareModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (imageBlob) {
            const url = URL.createObjectURL(imageBlob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImageUrl(null);
        }
    }, [imageBlob]);

    if (!isOpen || !imageUrl) return null;

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = imageUrl;
        link.click();
    };

    const handleShare = async () => {
        if (!imageBlob) return;
        if (navigator.share) {
            const file = new File([imageBlob], fileName, { type: 'image/png' });
            try {
                await navigator.share({
                    files: [file],
                    title: 'Check out this coffee!',
                    text: 'Shared from imnotupyet'
                });
            } catch (e) {
                console.error('Share failed', e);
            }
        } else {
            // Fallback to clipboard if share not supported (desktop)
            handleCopy();
        }
    };

    const handleCopy = async () => {
        if (!imageBlob) return;
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': imageBlob
                })
            ]);
            alert('Image copied to clipboard!');
        } catch (e) {
            console.error('Copy failed', e);
            alert('Failed to copy image.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-journal-card border border-white/10 rounded-3xl p-6 space-y-6 animate-in slide-in-from-bottom-10 mb-24 sm:mb-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-journal-text">Share Activity</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                        <X className="w-6 h-6 text-journal-text" />
                    </button>
                </div>

                {/* Preview */}
                <div className="relative w-full aspect-[4/5] bg-[url('/grid-pattern.png')] bg-repeat rounded-xl overflow-hidden shadow-2xl flex items-center justify-center bg-white/5">
                    {/* Checkerboard pattern for transparency visualization */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}></div>

                    <img src={imageUrl} alt="Share Preview" className="max-w-full max-h-full object-contain relative z-10" />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-4">
                    <ActionButton icon={<Instagram className="w-6 h-6 text-white" />} label="Stories" onClick={handleShare} color="bg-[#d62976]" />
                    <ActionButton icon={<Copy className="w-6 h-6 text-journal-text" />} label="Copy" onClick={handleCopy} color="bg-secondary/20" />
                    <ActionButton icon={<Download className="w-6 h-6 text-journal-text" />} label="Download" onClick={handleDownload} color="bg-secondary/20" />
                    <ActionButton icon={<Share2 className="w-6 h-6 text-journal-text" />} label="More" onClick={handleShare} color="bg-secondary/20" />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color: string;
}

function ActionButton({ icon, label, onClick, color }: ActionButtonProps) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center transition-transform group-active:scale-95 shadow-sm`}>
                {icon}
            </div>
            <span className="text-xs font-medium text-journal-text/70">{label}</span>
        </button>
    );
}
