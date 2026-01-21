"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { validateNewPassword } from '@/core/domain/authDomain';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';
import Header from '@/components/layout/Header';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { updatePassword, session, loading: authLoading } = useAuth();

    // Check if we have a valid recovery session
    useEffect(() => {
        // Supabase handles the token exchange automatically when the user clicks the reset link
        // The user will have an active session if the token was valid
        if (!authLoading) {
            // Check if we have a session (user was redirected from email with valid token)
            if (session) {
                setIsValidSession(true);
            } else {
                // No session means invalid or expired token
                setIsValidSession(false);
            }
        }
    }, [session, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords
        const validation = validateNewPassword(password, confirmPassword);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid password');
            return;
        }

        setSubmitting(true);

        try {
            const result = await updatePassword(password);

            if (result.success) {
                setSuccess(true);
                // Redirect to home after a short delay
                setTimeout(() => {
                    router.push('/home');
                }, 2000);
            } else {
                setError(result.error || 'Failed to update password');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || isValidSession === null) {
        return (
            <main className="min-h-screen bg-cream flex flex-col">
                <Header hideCitySelector />
                <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-12">
                    <div className="text-journal-text lowercase">loading...</div>
                </div>
            </main>
        );
    }

    if (!isValidSession) {
        return (
            <main className="min-h-screen bg-cream flex flex-col">
                <Header hideCitySelector />
                <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-12">
                    <FormContainer title="Invalid Link">
                        <div className="space-y-4 text-center">
                            <p className="text-journal-text/70 lowercase">
                                this password reset link is invalid or has expired.
                            </p>
                            <Button
                                type="button"
                                onClick={() => router.push('/login')}
                                size="lg"
                            >
                                back to login
                            </Button>
                        </div>
                    </FormContainer>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-cream flex flex-col">
            <Header hideCitySelector />
            <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-12">
                {success ? (
                    <FormContainer title="Password Updated">
                        <div className="space-y-4 text-center">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm lowercase">
                                your password has been updated successfully. redirecting to home...
                            </div>
                        </div>
                    </FormContainer>
                ) : (
                    <FormContainer title="Set New Password">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                id="new-password"
                                type="password"
                                label="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="bg-secondary"
                            />

                            <Input
                                id="confirm-password"
                                type="password"
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="bg-secondary"
                            />

                            <ErrorMessage message={error} />

                            <Button
                                type="submit"
                                disabled={submitting}
                                size="lg"
                            >
                                {submitting ? 'updating...' : 'update password'}
                            </Button>
                        </form>
                    </FormContainer>
                )}
            </div>
        </main>
    );
}
