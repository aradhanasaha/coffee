"use client";

import { useRouter } from 'next/navigation';
import SignUpForm from '@/components/auth/SignUpForm';
import Header from '@/components/layout/Header';

export default function SignUpPage() {
    const router = useRouter();

    const handleSignupSuccess = () => {
        router.push('/home');
    };

    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* Header with default props since we don't need city selection here */}
            <Header selectedCity="Delhi" onSelectCity={() => { }} />

            <div className="flex-1 flex items-center justify-center px-3 md:px-4 py-6 md:py-12">
                <SignUpForm onSuccess={handleSignupSuccess} />
            </div>
        </main>
    );
}
