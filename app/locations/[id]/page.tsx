"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import JournalLayout from '@/components/layout/JournalLayout';
import LocationHeader from '@/components/features/locations/LocationHeader';
import FeaturedLists from '@/components/features/locations/FeaturedLists';
import JournalFeedCard from '@/components/features/JournalFeedCard';
import { fetchLocationDetails, LocationDetailsExtended } from '@/services/locationService';
import Modal from '@/components/common/Modal';
import PhotoFirstLogCoffeeForm from '@/components/features/PhotoFirstLogCoffeeForm';

export default function LocationDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [location, setLocation] = useState<LocationDetailsExtended | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            const result = await fetchLocationDetails(id);
            if (result.success && result.data) {
                setLocation(result.data);
            }
            setLoading(false);
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-journal-bg flex items-center justify-center">
                <p className="text-journal-text animate-pulse">loading location...</p>
            </div>
        );
    }

    if (!location) {
        return (
            <div className="min-h-screen bg-journal-bg flex items-center justify-center">
                <p className="text-journal-text">Location not found.</p>
            </div>
        );
    }

    return (
        <JournalLayout
            rightPanel={
                <div className="sticky top-24">
                    <FeaturedLists />
                </div>
            }
        >
            <div className="space-y-10">
                <LocationHeader
                    location={location}
                    onLogCoffee={() => setShowLogModal(true)}
                />

                {/* Reviews Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-journal-text">Reviews</h2>
                    <div className="space-y-6">
                        {location.logs.length > 0 ? (
                            location.logs.map((log) => (
                                <JournalFeedCard
                                    key={log.id}
                                    log={log}
                                    onUsernameClick={() => {
                                        if (log.username) {
                                            router.push(`/user/${log.username}`);
                                        }
                                    }}
                                />
                            ))
                        ) : (
                            <p className="text-journal-text/60 italic">No reviews yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Log Coffee Modal */}
            <Modal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
            >
                <PhotoFirstLogCoffeeForm
                    initialLocation={{
                        place_name: location.place_name,
                        place_address: location.place_address || location.place_name,
                        lat: location.lat || 0,
                        lng: location.lng || 0,
                        google_place_id: location.google_place_id
                    }}
                    onSuccess={() => {
                        setShowLogModal(false);
                        window.location.reload(); // Refresh to show new log
                    }}
                    onCancel={() => setShowLogModal(false)}
                />
            </Modal>
        </JournalLayout>
    );
}
