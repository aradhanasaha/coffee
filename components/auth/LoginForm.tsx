"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormContainer, Button, Input, ErrorMessage } from '@/components/common';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/home');
            }
        };
        checkSession();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Successful login
            router.push('/home');
            router.refresh(); // Refresh to update server components if any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
