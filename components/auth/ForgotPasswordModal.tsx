"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validatePasswordResetEmail } from '@/core/domain/authDomain';
import { Button, Input, ErrorMessage } from '@/components/common';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { sendPasswordResetEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate email
        const validation = validatePasswordResetEmail(email);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid email');
            return;
        }

        setSubmitting(true);

        try {
            const result = await sendPasswordResetEmail(email);

            if (result.success) {
                setSuccess(true);
                setEmail('');
            } else {
                setError(result.error || 'Failed to send reset email');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setError(null);
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-cream rounded-2xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-journal-text lowercase">
                        reset password
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-journal-text/60 hover:text-journal-text text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm lowercase">
                            check your email for a password reset link. it may take a few minutes to arrive. please check your spam folder.
                        </div>
                        <Button
                            type="button"
                            onClick={handleClose}
                            size="lg"
                            className="w-full"
                        >
                            done
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-journal-text/70 lowercase">
                            enter your email address and we'll send you a link to reset your password.
                        </p>

                        <Input
                            id="reset-email"
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="bg-secondary"
                        />

                        <ErrorMessage message={error} />

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                size="lg"
                                className="flex-1"
                            >
                                cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                size="lg"
                                className="flex-1"
                            >
                                {submitting ? 'sending...' : 'send link'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
