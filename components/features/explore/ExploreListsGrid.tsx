"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ExploreListCard from "./ExploreListCard";
import { Loader2 } from "lucide-react";

interface ListData {
    id: string;
    id: string;
    title: string;
    description: string | null;
    user_id: string;
    visibility: 'public' | 'private';
    created_at: string;
    items: {
        coffee_log: {
            image_url: string | null;
        } | null;
    }[];
}

export default function ExploreListsGrid() {
    const [lists, setLists] = useState<ListData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const { data, error } = await supabase
                    .from('lists')
                    .select(`
                        *,
                        items:list_items(
                            coffee_log:coffee_logs(image_url)
                        )
                    `)
                    .eq('visibility', 'public')
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (error) {
                    console.error('Error fetching lists:', error);
                } else {
                    console.log('Fetched lists:', data);
                    setLists(data || []);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLists();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (lists.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <p>No public lists found yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 pb-20 px-1">
            {lists.map((list) => (
                <ExploreListCard key={list.id} list={list} />
            ))}
        </div>
    );
}
