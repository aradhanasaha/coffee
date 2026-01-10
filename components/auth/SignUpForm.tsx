"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';
import { validateUsername } from '@/lib/usernameValidation';
import { useEffect } from 'react';

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 3) {
                setUsernameError(null);
                setIsUsernameAvailable(null);
                return;
            }

            const validation = validateUsername(username);
            if (!validation.isValid) {
                setUsernameError(validation.error || 'Invalid username');
                setIsUsernameAvailable(null);
                return;
            }

            setUsernameError(null);

            // Live availability check
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username.toLowerCase());

            if (error) {
                // If table doesn't exist or other error, don't block but don't say available
                console.error('Error checking username availability:', error);
                setIsUsernameAvailable(null);
                return;
            }

            if (data && data.length > 0) {
                setIsUsernameAvailable(false);
                setUsernameError('Username is already taken');
            } else {
                setIsUsernameAvailable(true);
                setUsernameError(null);
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate username one last time
            const validation = validateUsername(username);
            if (!validation.isValid) throw new Error(validation.error);
            if (isUsernameAvailable === false) throw new Error('Username is already taken');

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // Insert into profiles
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        user_id: authData.user.id,
                        username: username.toLowerCase(),
                        username_last_changed_at: new Date().toISOString(),
                    });

                if (profileError) throw profileError;
            }

            // Successful signup
            router.push('/home');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                {isUsernameAvailable && !usernameError && (
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
