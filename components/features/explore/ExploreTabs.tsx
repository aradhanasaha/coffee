"use client";

import classNames from "classnames";

interface ExploreTabsProps {
    activeTab: 'lists' | 'map';
    onTabChange: (tab: 'lists' | 'map') => void;
}

export default function ExploreTabs({ activeTab, onTabChange }: ExploreTabsProps) {
    return (
        <div className="flex items-center justify-center w-full max-w-md mx-auto mb-6">
            <div className="flex bg-secondary/30 rounded-full p-1 w-full relative">
                {/* Animated Indicator - simplified implementation for now */}
                <button
                    onClick={() => onTabChange('lists')}
                    className={classNames(
                        "flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 z-10",
                        activeTab === 'lists'
                            ? "bg-secondary text-primary shadow-sm"
                            : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    Lists
                </button>
                <button
                    onClick={() => onTabChange('map')}
                    className={classNames(
                        "flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 z-10",
                        activeTab === 'map'
                            ? "bg-secondary text-primary shadow-sm"
                            : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    Map
                </button>
            </div>
        </div>
    );
}
