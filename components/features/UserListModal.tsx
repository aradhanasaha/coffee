"use client";

import Modal from '@/components/common/Modal';
import UsernameLink from '@/components/common/UsernameLink';
import { X } from 'lucide-react';

interface UserProfile {
    user_id: string;
    username: string;
}

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: UserProfile[];
    loading: boolean;
    error?: string | null;
}

export default function UserListModal({ isOpen, onClose, title, users, loading, error }: UserListModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="w-full max-h-[60vh] overflow-y-auto min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="text-sm text-journal-text/60 italic">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="text-sm text-red-500 italic">{error}</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="text-sm text-journal-text/60 italic">No users found</span>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-journal-border/30">
                        {users.map((user) => (
                            <div key={user.user_id} className="flex items-center px-4 py-3 hover:bg-black/5 transition-colors">
                                {/* Can add avatar here if available later */}
                                <div className="w-8 h-8 rounded-full bg-journal-accent/30 flex items-center justify-center mr-3 text-xs font-bold text-journal-text/70 uppercase">
                                    {user.username.charAt(0)}
                                </div>
                                <UsernameLink
                                    username={user.username}
                                    className="text-base font-medium text-journal-text"
                                    onClick={onClose} // Close modal on navigate
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
