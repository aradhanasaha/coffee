"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/common";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { validateUsername } from "@/lib/usernameValidation";
import LogCoffeeForm from "@/components/features/LogCoffeeForm";
import UserProfileCard from "@/components/features/UserProfileCard";
import ProfileFeedCard from "@/components/features/ProfileFeedCard";
import type { CoffeeLog } from '@/core/types/types';
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/common/Modal";

export default function UserDashboard() {
    const { logout } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [logs, setLogs] = useState<CoffeeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (!profile) {
                router.push('/set-username');
                return;
            }

            setUser({ ...session.user, ...profile });

            const { data: logsData, error } = await supabase
                .from('coffee_logs')
                .select(`
                    *,
                    locations:location_id (city)
                `)
                .eq('user_id', session.user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (!error && logsData) {
                setLogs(logsData.filter((log: any) => !log.deleted_at) as CoffeeLog[]);
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const canChangeUsername = () => {
        if (!user?.username_last_changed_at) return true;
        const lastChanged = new Date(user.username_last_changed_at);
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        return lastChanged < fifteenDaysAgo;
    };

    const getDaysUntilNextChange = () => {
        if (!user?.username_last_changed_at) return 0;
        const lastChanged = new Date(user.username_last_changed_at);
        const nextAvailable = new Date(lastChanged);
        nextAvailable.setDate(nextAvailable.getDate() + 15);
        const diff = nextAvailable.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const handleUpdateUsername = async () => {
        if (!canChangeUsername()) {
            const daysWait = getDaysUntilNextChange();
            setUsernameError(`You can change your username again in ${daysWait} days`);
            return;
        }

        const validation = validateUsername(newUsername);
        if (!validation.isValid) {
            setUsernameError(validation.error || "Invalid username");
            return;
        }

        setUpdateLoading(true);
        setUsernameError(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: newUsername.toLowerCase(),
                    username_last_changed_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (error) {
                if (error.code === '23505') throw new Error("Username already taken");
                throw error;
            }

            setUser({
                ...user,
                username: newUsername.toLowerCase(),
                username_last_changed_at: new Date().toISOString()
            });
            setIsEditingUsername(false);
        } catch (err: any) {
            setUsernameError(err.message);
        } finally {
            setUpdateLoading(false);
        }
    };

    const [editingLogId, setEditingLogId] = useState<string | null>(null);

    const handleEditClick = (log: CoffeeLog) => {
        setEditingLogId(log.id);
    };

    const handleCancelEdit = () => {
        setEditingLogId(null);
    };

    const handleUpdateLog = async () => {
        setEditingLogId(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: logsData } = await supabase
                .from('coffee_logs')
                .select('*')
                .eq('user_id', session.user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            if (logsData) setLogs(logsData);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-cream text-espresso pb-20">
            <header className="sticky top-0 z-10 w-full py-3 md:py-4 px-3 md:px-6 bg-cream/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between gap-2">
                <Link href="/home">
                    <Button variant="secondary" size="sm" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden xs:inline">Back</span>
                    </Button>
                </Link>
                <span className="text-xs md:text-sm font-bold text-primary truncate max-w-[120px] md:max-w-[200px]">
                    @{user?.username}
                </span>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="text-destructive hover:bg-destructive/10 px-2 md:px-3 text-xs md:text-sm">
                    <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
            </header>

            <main className="container mx-auto max-w-4xl px-3 md:px-4 py-4 md:py-8 space-y-6 md:space-y-12">
                <UserProfileCard
                    profile={{
                        user_id: user.id,
                        username: user.username,
                        created_at: user.created_at
                    }}
                    stats={{
                        totalLogs: logs.length,
                        followerCount: user?.follower_count || 0,
                        followingCount: user?.following_count || 0
                    }}
                    currentUserId={user.id}
                    isEditing={isEditingUsername}
                    editUsername={newUsername}
                    onEditUsernameChange={setNewUsername}
                    onStartEdit={() => {
                        if (canChangeUsername()) {
                            setNewUsername(user.username);
                            setIsEditingUsername(true);
                            setUsernameError(null);
                        } else {
                            const daysWait = getDaysUntilNextChange();
                            alert(`You can change your username again in ${daysWait} days`);
                        }
                    }}
                    onCancelEdit={() => {
                        setIsEditingUsername(false);
                        setNewUsername("");
                        setUsernameError(null);
                    }}
                    onSaveEdit={handleUpdateUsername}
                    editLoading={updateLoading}
                    editError={usernameError}
                />

                <section>
                    {logs.length === 0 ? (
                        <div className="bg-card/50 border-2 border-dashed border-primary/10 rounded-2xl p-12 text-center">
                            <p className="text-muted-foreground">You haven't logged any coffees yet.</p>
                            <Link href="/log" className="mt-4 inline-block">
                                <Button size="md">Log your first coffee</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {logs.map((log) => (
                                <ProfileFeedCard
                                    key={log.id}
                                    log={log}
                                    author={user}
                                    isOwner={user?.id === log.user_id}
                                    onEdit={handleEditClick}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Modal isOpen={!!editingLogId} onClose={handleCancelEdit}>
                <div className="p-1">
                    {editingLogId && logs.find(l => l.id === editingLogId) && (
                        <LogCoffeeForm
                            initialData={logs.find(l => l.id === editingLogId)}
                            onSuccess={handleUpdateLog}
                            submitLabel="Save Changes"
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
