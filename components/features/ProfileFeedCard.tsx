import { useState } from 'react';
import { Star, Pencil } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import ShareEntryButton from './ShareEntryButton';
import SaveToListButton from './lists/SaveToListButton';
import LikersPopover from './LikersPopover';
import HeartButton from '../common/HeartButton';

interface ProfileFeedCardProps {
    log: any;
    author: any; // Renamed from user to author for clarity
    isOwner: boolean;
    onEdit: (log: any) => void;
}

export default function ProfileFeedCard({ log, author, isOwner, onEdit }: ProfileFeedCardProps) {
    const [imageError, setImageError] = useState(false);
    const { likeStatus, toggleLike, loading: likeLoading } = useLikes(log.id, 'coffee_log');

    // Robust check for image existence
    const hasImage = Boolean(
        !imageError &&
        log.image_url &&
        log.image_url.trim().length > 0 &&
        log.image_url !== 'null' &&
        log.image_url !== 'undefined' &&
        (log.image_url.startsWith('http') || log.image_url.startsWith('/') || log.image_url.startsWith('data:'))
    );

    return (
        <div className="bg-card rounded-2xl border border-primary/5 shadow-sm overflow-hidden group flex flex-col h-full hover:shadow-md transition-all duration-200">
            {/* 1. Header: Username & Edit */}
            <div className="px-4 py-3 flex justify-between items-center bg-card">
                <span className="font-semibold text-sm text-foreground/80 lowercase">
                    @{author?.username}
                </span>
                {isOwner && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(log);
                        }}
                        className="text-foreground/80 hover:text-primary font-semibold text-xs lowercase transition-colors flex items-center gap-1"
                    >
                        <Pencil className="w-3 h-3" /> edit
                    </button>
                )}
            </div>

            {/* 2. Image Container */}
            {hasImage && (
                <div className="w-full relative overflow-hidden bg-muted/20">
                    <img
                        src={log.image_url}
                        alt={log.coffee_name}
                        className="w-full aspect-[4/3] object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
            )}

            {/* 3. Metadata Row */}
            <div className="px-4 pt-3 flex justify-between items-baseline text-foreground/90">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base lowercase font-serif">{log.coffee_name}</h3>
                    {log.price_feel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground/80 font-medium">
                            {log.price_feel}
                        </span>
                    )}
                </div>
                <div className="text-right text-xs opacity-60 font-medium truncate max-w-[120px]">
                    {log.place.toLowerCase()}
                </div>
            </div>

            {/* 4. Action Row (Stars & Social) */}
            <div className="px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-0.5 text-primary">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < log.rating ? 'fill-current' : 'text-primary/20'}`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <ShareEntryButton log={log} />
                    <SaveToListButton coffeeLogId={log.id} />
                    <LikersPopover targetId={log.id} targetType="coffee_log">
                        <HeartButton
                            isLiked={likeStatus?.isLiked || false}
                            onToggle={toggleLike}
                            loading={likeLoading}
                            count={likeStatus?.likeCount || 0}
                        />
                    </LikersPopover>
                </div>
            </div>

            {/* 5. Review Text - Expands to fill space */}
            {(log.review || log.flavor_notes) && (
                <div className="px-4 pb-4 flex-grow flex flex-col justify-start">
                    {log.review ? (
                        <p className="text-foreground/75 text-sm leading-relaxed line-clamp-4 italic">
                            "{log.review}"
                        </p>
                    ) : (
                        <p className="text-foreground/75 text-sm leading-relaxed italic">
                            {log.flavor_notes}
                        </p>
                    )}
                </div>
            )}

            {/* Spacer for bottom padding consistency if no review */}
            {!log.review && !log.flavor_notes && <div className="pb-4" />}
        </div>
    );
}
