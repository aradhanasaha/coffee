"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';
import { validateUsername } from '@/lib/usernameValidation';
import Header from '@/components/layout/Header';

export default function SetUsernamePage() {
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
                // Check if they already have a profile
                const { data } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('user_id', session.user.id)
                    .single();

                if (data?.username) {
                    router.push('/home');
                }
            }
        };
        checkSession();
    }, [router]);

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

            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username.toLowerCase());

            if (error) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const validation = validateUsername(username);
            if (!validation.isValid) throw new Error(validation.error);
            if (isUsernameAvailable === false) throw new Error('Username is already taken');

            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    username: username.toLowerCase(),
                    username_last_changed_at: new Date().toISOString(),
                });

            if (profileError) throw profileError;

            router.push('/home');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header selectedCity="Delhi" onSelectCity={() => { }} />

            <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-12">
                <FormContainer title="Choose Your Username">
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">
                        You must choose a username to continue. This is your public name shown on your coffee entries.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <ErrorMessage message={error} />

                        <Button
                            type="submit"
                            disabled={loading || !isUsernameAvailable || !!usernameError}
                            size="lg"
                            className="mt-2 w-full"
                        >
                            {loading ? 'Saving...' : 'Set Username'}
                        </Button>
                    </form>
                </FormContainer>
            </div>
        </main>
    );
}
