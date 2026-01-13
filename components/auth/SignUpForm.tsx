"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { validateSignupData } from '@/core/domain/authDomain';
import Link from 'next/link';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';

interface SignUpFormProps {
    onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { signup, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // Use useUserProfile for username validation (pass null for userId since we're signing up)
    const {
        usernameAvailable,
        usernameError,
        checkUsernameAvailability
    } = useUserProfile(null);

    // Debounced username availability check
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (username.length >= 3) {
                checkUsernameAvailability(username);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [username, checkUsernameAvailability]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate signup data using domain logic
        const validation = validateSignupData(email, password, username);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid signup data');
            return;
        }

        // Check username is available
        if (usernameAvailable === false) {
            setError('Username is already taken');
            return;
        }

        setSubmitting(true);

        try {
            const result = await signup(email, password, username);

            if (result.success) {
                // Call success callback (parent handles navigation)
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setError(result.error || 'Signup failed');
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setSubmitting(false);
        }
    };

    const loading = submitting || authLoading;

    return (
        <FormContainer title="Join the Club">
            <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                    id="username"
                    type="text"
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    placeholder="coffee_lover"
                    error={usernameError || undefined}
                />
                {usernameAvailable && !usernameError && (
                    <p className="text-xs text-green-500 -mt-3">Username is available!</p>
                )}

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
                    minLength={6}
                    placeholder="••••••••"
                />

                <ErrorMessage message={error} />

                <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="mt-2"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                    Log in
                </Link>
            </div>
        </FormContainer>
    );
}
