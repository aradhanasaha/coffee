"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginCredentials } from '@/core/domain/authDomain';
import Link from 'next/link';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation using domain logic
        const validation = validateLoginCredentials(email, password);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid credentials');
            return;
        }

        setSubmitting(true);

        try {
            const result = await login(email, password);

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
        <FormContainer title="Welcome Back">
            <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="barista@example.com"
                />

                <Input
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />

                <ErrorMessage message={error} />

                <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="mt-2"
                >
                    {loading ? 'Logging In...' : 'Log In'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="font-bold text-primary hover:underline">
                    Sign up
                </Link>
            </div>
        </FormContainer>
    );
}
