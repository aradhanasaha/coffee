"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Successful signup
            router.push('/home');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border-2 border-primary/20">
            <h2 className="text-2xl font-bold text-center mb-6 text-primary">Join the Club</h2>

            <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors"
                        placeholder="barista@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}
