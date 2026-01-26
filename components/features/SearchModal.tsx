"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Coffee, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as searchService from '@/services/searchService';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<searchService.SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const data = await searchService.globalSearch(query);
                setResults(data);
                setLoading(false);
            } else {
                setResults(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleResultClick = (item: searchService.SearchResultItem) => {
        onClose();
        if (item.type === 'user') {
            router.push(`/user/${item.title}`);
        } else if (item.type === 'place') {
            if (item.id && item.id !== item.title) {
                router.push(`/locations/${item.id}`);
            } else {
                console.log("No location ID found for place:", item.title);
                // Fallback? Maybe generic search page? For now just log.
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-0 md:pt-20 bg-black/40 backdrop-blur-sm">
            {/* Desktop Modal / Mobile Full Screen */}
            <div className="w-full md:w-[600px] h-full md:h-auto bg-journal-card md:rounded-2xl shadow-2xl flex flex-col md:max-h-[80vh] overflow-hidden">

                {/* Search Header */}
                <div className="p-4 border-b border-journal-text/10 flex items-center gap-3">
                    <Search className="w-5 h-5 text-journal-text/50" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="search places, coffee, or people..."
                        className="flex-1 bg-transparent text-lg placeholder:text-journal-text/30 focus:outline-none lowercase text-journal-text"
                    />
                    <button
                        onClick={() => {
                            setQuery('');
                            onClose();
                        }}
                        className="p-2 hover:bg-journal-text/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-journal-text/50" />
                    </button>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-journal-text"></div>
                        </div>
                    ) : !results && query.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-journal-text/40 gap-2">
                            <Search className="w-8 h-8 opacity-20" />
                            <p className="text-sm lowercase">start typing to search...</p>
                        </div>
                    ) : !results || (results.users.length === 0 && results.places.length === 0 && results.coffees.length === 0) ? (
                        <div className="text-center p-8 text-journal-text/50">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Places */}
                            {results.places.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-journal-text/40 uppercase tracking-widest pl-2">Places</h3>
                                    {results.places.map((place) => (
                                        <div
                                            key={place.id}
                                            onClick={() => handleResultClick(place)}
                                            className="p-2 hover:bg-journal-text/5 rounded-lg flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-journal-text group-hover:text-primary transition-colors">{place.title}</p>
                                                <p className="text-xs text-journal-text/50">{place.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Coffee */}
                            {results.coffees.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-journal-text/40 uppercase tracking-widest pl-2">Coffee</h3>
                                    {results.coffees.map((coffee) => (
                                        <div
                                            key={coffee.id}
                                            onClick={() => handleResultClick(coffee)}
                                            className="p-2 hover:bg-journal-text/5 rounded-lg flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-brown-100 flex items-center justify-center text-brown-600">
                                                <Coffee className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-journal-text group-hover:text-primary transition-colors">{coffee.title}</p>
                                                <p className="text-xs text-journal-text/50">{coffee.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* People */}
                            {results.users.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-journal-text/40 uppercase tracking-widest pl-2">People</h3>
                                    {results.users.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleResultClick(user)}
                                            className="p-2 hover:bg-journal-text/5 rounded-lg flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-journal-text group-hover:text-primary transition-colors">@{user.title}</p>
                                                <p className="text-xs text-journal-text/50">{user.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
