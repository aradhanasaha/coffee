"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/common";
import { ArrowLeft, LogOut, Coffee, MapPin, Calendar, Star, TrendingUp, Map as MapIcon, User as UserIcon, Users, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import { validateUsername } from "@/lib/usernameValidation";
import LogCoffeeForm from "@/components/features/LogCoffeeForm";
import UserProfileCard from "@/components/features/UserProfileCard";
import * as listService from '@/services/listService';
import ExploreListCard from '@/components/discovery/ExploreListCard';
import type { ListWithItems } from '@/core/types/types';

interface CoffeeLog {
    id: string;
    created_at: string;
    coffee_name: string;
    place: string;
    rating: number;
    price: number | null;
    review: string | null;
    flavor_notes: string | null;
    price_feel: 'steal' | 'fair' | 'expensive' | '';
    location_id: string | null;
}

export default function UserDashboard() {
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

            // Check if user has a profile
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
                .select('*')
                .eq('user_id', session.user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (!error && logsData) {
                const activeLogs = logsData.filter((log: any) => !log.deleted_at);
                setLogs(activeLogs as CoffeeLog[]);
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const [activeTab, setActiveTab] = useState<'history' | 'lists'>('history');
    const [myLists, setMyLists] = useState<ListWithItems[]>([]);
    const [listsLoading, setListsLoading] = useState(false);

    // Fetch lists when tab changes to 'lists'
    useEffect(() => {
        const fetchLists = async () => {
            if (activeTab === 'lists' && user) {
                setListsLoading(true);
                try {
                    // Fetch own lists (public & private)
                    const ownListsResult = await listService.fetchUserLists(user.id);
                    // Fetch saved lists
                    const savedListsResult = await listService.fetchSavedLists(user.id);

                    const combinedLists = [
                        ...(ownListsResult.data || []),
                        ...(savedListsResult.data || [])
                    ];

                    // Remove duplicates
                    const uniqueLists = Array.from(new Map(combinedLists.map(list => [list.id, list])).values());

                    setMyLists(uniqueLists);
                } catch (err) {
                    console.error("Failed to fetch lists", err);
                } finally {
                    setListsLoading(false);
                }
            }
        };

        fetchLists();
    }, [activeTab, user]);

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
    const [editFormData, setEditFormData] = useState<Partial<CoffeeLog>>({});
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleEditClick = (log: CoffeeLog) => {
        setEditingLogId(log.id);
        setEditFormData(log);
    };

    const handleCancelEdit = () => {
        setEditingLogId(null);
        setEditFormData({});
    };

    const handleUpdateLog = async () => {
        // This is now handled by LogCoffeeForm onSuccess
        setEditingLogId(null);
        // Refresh logs to show updated data
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

    const handleDeleteLog = async (id: string) => {
        if (!confirm("This entry will be removed from your profile and all feeds. Are you sure?")) return;
        setIsDeleting(id);

        try {
            const { error } = await supabase
                .from('coffee_logs')
                .update({
                    deleted_at: new Date().toISOString(),
                    deleted_by: user.id,
                    deletion_reason: 'user_deleted'
                })
                .eq('id', id);

            if (error) throw error;

            setLogs(logs.filter(log => log.id !== id));
        } catch (err: any) {
            console.error("Error deleting log:", err.message);
            alert("Failed to delete log: " + err.message);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;
    }

    const totalEntries = logs.length;
    const firstEntryDate = logs.length > 0 ? new Date(logs[logs.length - 1].created_at).toLocaleDateString() : "—";
    const lastEntryDate = logs.length > 0 ? new Date(logs[0].created_at).toLocaleDateString() : "—";

    const getPriceLabel = (feel: string) => {
        switch (feel) {
            case 'steal': return 'What a steal!';
            case 'fair': return 'Just right';
            case 'expensive': return 'Felt expensive';
            default: return feel || '—';
        }
    };

    return (
        <div className="min-h-screen bg-cream text-espresso pb-20">
            {/* Top Bar */}
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
                {/* Profile Card - Same as other users' pages */}
                <UserProfileCard
                    profile={{
                        user_id: user.id,
                        username: user.username,
                        created_at: user.created_at
                    }}
                    stats={{
                        totalLogs: totalEntries,
                        followerCount: user?.follower_count || 0,
                        followingCount: user?.following_count || 0
                    }}
                    currentUserId={user.id}
                    // Edit Props
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


                {/* Tabs */}
                <div>
                    <div className="flex items-center gap-6 border-b border-primary/10 mb-6">
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'history'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-primary/70'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'history' ? 'bg-primary/10' : 'bg-transparent'}`}>
                                    <Calendar className={`w-5 h-5 ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                My Coffee History
                            </span>
                            {activeTab === 'history' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('lists')}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'lists'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-primary/70'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'lists' ? 'bg-primary/10' : 'bg-transparent'}`}>
                                    <TrendingUp className={`w-5 h-5 ${activeTab === 'lists' ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                My Lists
                            </span>
                            {activeTab === 'lists' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <section>
                        {activeTab === 'history' ? (
                            <>
                                {logs.length === 0 ? (
                                    <div className="bg-card/50 border-2 border-dashed border-primary/10 rounded-2xl p-12 text-center">
                                        <p className="text-muted-foreground">You haven’t logged any coffees yet.</p>
                                        <Link href="/log" className="mt-4 inline-block">
                                            <Button size="md">Log your first coffee</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {logs.map((log) => (
                                            <div key={log.id} className="bg-card p-5 rounded-2xl border-2 border-primary/5 hover:border-primary/20 transition-all shadow-sm">
                                                {editingLogId === log.id ? (
                                                    <LogCoffeeForm
                                                        initialData={log}
                                                        onSuccess={handleUpdateLog}
                                                        submitLabel="Save Changes"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <h3 className="font-bold text-lg">{log.coffee_name}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{log.place} • Delhi</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4">
                                                            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                                                                <Star className="w-4 h-4 text-primary fill-primary" />
                                                                <span className="font-bold text-primary">{log.rating}</span>
                                                            </div>
                                                            <div className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                                                                {getPriceLabel(log.price_feel)}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-medium">
                                                                {new Date(log.created_at).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-auto">
                                                                <button
                                                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                                    onClick={() => handleEditClick(log)}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                                    onClick={() => handleDeleteLog(log.id)}
                                                                    disabled={isDeleting === log.id}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {listsLoading ? (
                                    <div className="text-center py-12 text-muted-foreground">Loading lists...</div>
                                ) : myLists.length === 0 ? (
                                    <div className="bg-card rounded-2xl border-2 border-dashed border-primary/20 p-12 text-center text-muted-foreground">
                                        No lists found
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {myLists.map((list) => (
                                            <ExploreListCard
                                                key={list.id}
                                                title={list.title}
                                                subtitle={`${list.item_count || 0} items`}
                                                curatedBy={list.owner?.username}
                                                onClick={() => router.push(`/lists/${list.id}?from=profile`)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>

                {/* Placeholder Sections */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 grayscale">
                    <div className="bg-card p-6 rounded-2xl border-2 border-dashed border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                            Coming Soon
                        </div>
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <MapIcon className="w-4 h-4" />
                            Map of logged places
                        </h3>
                        <p className="text-sm text-muted-foreground">Visualize your coffee journey across the city.</p>
                    </div>
                    <div className="bg-card p-6 rounded-2xl border-2 border-dashed border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                            Coming Soon
                        </div>
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Taste analytics & trends
                        </h3>
                        <p className="text-sm text-muted-foreground">Discover your flavor profile and habits.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
