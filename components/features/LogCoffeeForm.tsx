"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

export default function LogCoffeeForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        coffee_name: '',
        place: '',
        price: '',
        rating: 0,
        review: '',
        flavor_notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('coffee_logs')
                .insert([
                    {
                        user_id: user.id,
                        coffee_name: formData.coffee_name,
                        place: formData.place,
                        price: formData.price ? parseFloat(formData.price) : null,
                        rating: formData.rating,
                        review: formData.review,
                        flavor_notes: formData.flavor_notes
                    }
                ]);

            if (error) throw error;

            router.push('/home');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-card p-8 rounded-2xl shadow-lg border-2 border-primary/20">
            <h2 className="text-2xl font-bold text-center mb-6 text-primary">Log a Coffee</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Coffee Name</label>
                        <input
                            type="text"
                            required
                            value={formData.coffee_name}
                            onChange={e => setFormData({ ...formData, coffee_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Iced Latte"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Place</label>
                        <input
                            type="text"
                            required
                            value={formData.place}
                            onChange={e => setFormData({ ...formData, place: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Blue Tokai"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Price (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors"
                            placeholder="250"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Rating</label>
                        <div className="flex gap-2 items-center h-[42px]">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className={`transition-transform hover:scale-110 focus:outline-none ${formData.rating >= star ? 'text-primary' : 'text-muted-foreground/30'
                                        }`}
                                >
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Review</label>
                    <textarea
                        rows={3}
                        value={formData.review}
                        onChange={e => setFormData({ ...formData, review: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                        placeholder="How was it?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Flavor Notes</label>
                    <input
                        type="text"
                        value={formData.flavor_notes}
                        onChange={e => setFormData({ ...formData, flavor_notes: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-background focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Nutty, Chocolatey, Fruity"
                    />
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 px-4 bg-secondary text-secondary-foreground font-bold rounded-xl shadow-sm hover:bg-secondary/80 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging...' : 'Log Coffee'}
                    </button>
                </div>
            </form>
        </div>
    );
}
