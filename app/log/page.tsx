"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/layout/Header";
import LogCoffeeForm from "@/components/features/LogCoffeeForm";

export default function LogCoffeePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
            }
            setLoading(false);
        };
        checkSession();
    }, [router]);

    const handleLogSuccess = () => {
        router.push('/home');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header selectedCity="Delhi" onSelectCity={() => { }} user={user} />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <LogCoffeeForm onSuccess={handleLogSuccess} />
            </div>
        </div>
    );
}
