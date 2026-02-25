"use client";

import { useState, useEffect } from 'react';
import JournalLayout from '@/components/layout/JournalLayout';
import ExploreTabs from '@/components/features/explore/ExploreTabs';
import ExploreListsGrid from '@/components/features/explore/ExploreListsGrid';
import CityDropdown from '@/components/map/CityDropdown';
import dynamic from 'next/dynamic';

const GoogleMapExplore = dynamic(
    () => import('@/components/map/GoogleMapExplore'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-[#F5E6D3]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A]"></div>
            </div>
        )
    }
);
import { ArrowLeft } from 'lucide-react';
import { getDistinctCities, getLocationsByCity } from '@/services/locationService';
import { Location } from '@/core/types/types';



export default function ExplorePage() {
    const [activeTab, setActiveTab] = useState<'lists' | 'map'>('lists');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [mapLocations, setMapLocations] = useState<Location[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(true);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    // Fetch cities on mount
    useEffect(() => {
        async function fetchCities() {
            try {
                const { data, success } = await getDistinctCities();
                if (success && data && data.length > 0) {
                    setCities(data);
                    setSelectedCity(data[0]); // Default to first city
                }
            } catch (error) {
                console.error("Failed to fetch cities", error);
            } finally {
                setIsLoadingCities(false);
            }
        }
        fetchCities();
    }, []);

    // Fetch locations when city changes
    useEffect(() => {
        if (!selectedCity) return;

        async function fetchLocs() {
            setIsLoadingLocations(true);
            try {
                const { data, success } = await getLocationsByCity(selectedCity);
                if (success && data) {
                    // Filter out locations without lat/lng
                    const validLocs = data.filter(l => l.lat && l.lng);
                    setMapLocations(validLocs);
                }
            } catch (error) {
                console.error("Failed to fetch locations", error);
            } finally {
                setIsLoadingLocations(false);
            }
        }
        fetchLocs();
    }, [selectedCity]);

    const handleCityChange = (city: string) => {
        setSelectedCity(city);
    };


    return (
        <JournalLayout showRightPanel={false} fullWidth={true}>
            <div className="flex flex-col min-h-[calc(100vh-64px)]">

                {/* Mobile Header & Tabs */}
                <div className="md:hidden flex flex-col border-b border-[#4A2C2A]/10">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-4">
                            <a href="/home" className="flex items-center gap-1 text-journal-text/60 hover:text-journal-text transition-colors text-sm lowercase">
                                <ArrowLeft className="w-4 h-4" />
                            </a>
                            <h1 className="text-xl font-serif text-[#4A2C2A]">Explore</h1>
                        </div>
                        <CityDropdown
                            cities={cities}
                            selectedCity={selectedCity}
                            onSelectCity={handleCityChange}
                            isLoading={isLoadingCities}
                        />
                    </div>
                    {/* Map is disabled on mobile for now */}
                    {/* <ExploreTabs activeTab={activeTab} onTabChange={setActiveTab} /> */}
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between px-8 py-6 max-w-[900px] mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-sans font-medium text-[#4A2C2A]">explore</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[#4A2C2A]/60 italic">{mapLocations.length} places logged</span>
                        <CityDropdown
                            cities={cities}
                            selectedCity={selectedCity}
                            onSelectCity={handleCityChange}
                            isLoading={isLoadingCities}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative w-full min-h-[500px]">

                    {/* Mobile: Conditional Rendering based on Tab */}
                    <div className="md:hidden absolute inset-0">
                        {/* Map disabled on mobile, defaulting to lists */}
                        <div className="p-4 overflow-y-auto h-full pb-20">
                            <ExploreListsGrid />
                        </div>
                    </div>

                    {/* Desktop: Always Map */}
                    <div className="hidden md:flex absolute inset-0 justify-center pb-8 px-8">
                        <div className="w-full max-w-[900px] h-full relative rounded-2xl overflow-hidden shadow-sm">
                            {isLoadingLocations && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#F5E6D3]/50 z-20 backdrop-blur-[1px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A]"></div>
                                </div>
                            )}

                            {!isLoadingLocations && (
                                <div className="absolute inset-0 z-0">
                                    <GoogleMapExplore locations={mapLocations} selectedCity={selectedCity} />
                                </div>
                            )}
                            {mapLocations.length === 0 && !isLoadingLocations && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="p-6 bg-[#F5E6D3]/90 rounded-xl border border-[#4A2C2A]/10 text-center max-w-xs shadow-sm backdrop-blur-sm">
                                        <p className="text-[#4A2C2A] font-medium mb-1">No places logged yet</p>
                                        <p className="text-[#4A2C2A]/60 text-sm">Select another city or start logging!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </JournalLayout>
    );
}
