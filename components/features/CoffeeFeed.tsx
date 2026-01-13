"use client";

import { usePublicCoffeeFeed } from '@/hooks/useCoffeeLogs';
import { useLikes } from '@/hooks/useLikes';
import { Star } from 'lucide-react';
import UsernameLink from '../common/UsernameLink';
import LikeButton from '../common/LikeButton';

interface CoffeeFeedProps {
    selectedCity: string;
    limit?: number;
    onUsernameClick?: (username: string) => void; // Optional navigation callback
}

export default function CoffeeFeed({ selectedCity, limit, onUsernameClick }: CoffeeFeedProps) {
    // Don't filter by city if "All" is selected
    const cityFilter = selectedCity === "All" ? undefined : selectedCity;
    const { logs, loading } = usePublicCoffeeFeed({ limit, city: cityFilter });

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-card/50 animate-pulse border-2 border-primary/10" />
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border-2 border-dashed border-primary/20">
                <p>No coffee logs yet. Be the first to log one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => (
                <CoffeeCard
                    key={log.id}
                    log={log}
                    onUsernameClick={onUsernameClick}
                />
            ))}
        </div>
    );
}

// Separate card component to manage individual like state
function CoffeeCard({ log, onUsernameClick }: { log: any; onUsernameClick?: (username: string) => void }) {
    const { likeStatus, toggleLike, loading: likeLoading } = useLikes(log.id, 'coffee_log');

    return (
        <div className="group bg-card hover:bg-card/80 border-2 border-primary/10 hover:border-primary/30 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary leading-tight">{log.coffee_name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-muted-foreground font-medium">{log.place}</p>
                        {log.username && (
                            <UsernameLink
                                username={log.username}
                                onClick={onUsernameClick}
                            />
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                    <span className="font-bold text-secondary-foreground">{log.rating}</span>
                    <Star className="w-3 h-3 fill-current text-secondary-foreground" />
                </div>
            </div>

            {log.review && (
                <p className="text-sm text-foreground/80 line-clamp-3 italic">
                    "{log.review}"
                </p>
            )}

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/5">
                <div className="flex gap-2 text-xs text-muted-foreground">
                    {log.price_feel && (
                        <span className="font-medium text-foreground">
                            {log.price_feel === 'steal' && '💰 Steal'}
                            {log.price_feel === 'fair' && '✓ Fair'}
                            {log.price_feel === 'expensive' && '💸 Pricey'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {log.flavor_notes && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium truncate max-w-[120px]">
                            {log.flavor_notes}
                        </span>
                    )}
                    <LikeButton
                        likeStatus={likeStatus}
                        onToggle={toggleLike}
                        loading={likeLoading}
                    />
                </div>
            </div>
        </div>
    );
}

