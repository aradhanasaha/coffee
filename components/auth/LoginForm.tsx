"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validateUsernameLoginCredentials } from '@/core/domain/authDomain';
import Link from 'next/link';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [keepSignedIn, setKeepSignedIn] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { loginWithUsername, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation using domain logic
        const validation = validateUsernameLoginCredentials(username, password);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid credentials');
            return;
        }

        setSubmitting(true);

        try {
            const result = await loginWithUsername(username, password);

            if (result.success) {
                // Call success callback (parent handles navigation)
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const loading = submitting || authLoading;

    return (
        <>
            <FormContainer title="Welcome Back">
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        id="username"
                        type="text"
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="your_username"
                        className="bg-secondary"
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="bg-secondary"
                    />

                    {/* Keep me signed in & Forgot password row */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={keepSignedIn}
                                onChange={(e) => setKeepSignedIn(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="lowercase">keep me signed in</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-primary hover:underline lowercase"
                        >
                            forgot password?
                        </button>
                    </div>

                    <ErrorMessage message={error} />

                    <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="mt-2"
                    >
                        {loading ? 'logging in...' : 'log in'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground lowercase">
                    don't have an account?{' '}
                    <Link href="/signup" className="font-bold text-primary hover:underline">
                        sign up
                    </Link>
                </div>
            </FormContainer>

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </>
    );
}
