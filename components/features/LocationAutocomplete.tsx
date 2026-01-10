"use client";

import { useState, useEffect, useRef } from "react";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";

interface LocationAutocompleteProps {
    onLocationSelect: (data: {
        place_name: string;
        place_address: string;
        lat: number;
        lng: number;
        google_place_id: string;
    }) => void;
    defaultValue?: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export default function LocationAutocomplete({
    onLocationSelect,
    defaultValue,
    onChange,
    className,
    placeholder,
    disabled,
}: LocationAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue || "");
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        predictions,
        loading,
        onInputFocus,
        onInputChange,
        onPlaceSelect,
        clearSession
    } = usePlacesAutocomplete();

    useEffect(() => {
        setInputValue(defaultValue || "");
    }, [defaultValue]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onChange?.(val);
        onInputChange(val);
        setShowDropdown(true);
    };

    const handleSelect = (placeId: string, description: string) => {
        setInputValue(description);
        onChange?.(description); // Update parent state immediately with the full name
        setShowDropdown(false);
        onPlaceSelect(placeId, (details) => {
            onLocationSelect(details);
        });
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                type="text"
                value={inputValue}
                onFocus={() => {
                    if (disabled) return;
                    onInputFocus();
                    if (predictions.length > 0) setShowDropdown(true);
                }}
                onChange={handleInputChange}
                placeholder={placeholder || "Enter cafe or location"}
                className={`${className || "w-full rounded-md border px-3 py-2"} ${disabled ? "bg-secondary/50 cursor-not-allowed opacity-70" : ""}`}
                autoComplete="off"
                readOnly={disabled}
            />

            {showDropdown && (predictions.length > 0 || loading) && (
                <div className="absolute z-50 w-full mt-1 bg-card border-2 border-primary/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {loading && predictions.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground animate-pulse">
                            Searching cafes...
                        </div>
                    )}
                    {predictions.map((prediction) => (
                        <button
                            key={prediction.place_id}
                            type="button"
                            onClick={() => handleSelect(prediction.place_id, prediction.description)}
                            className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-primary/5 last:border-0"
                        >
                            <div className="font-bold text-sm text-foreground">
                                {prediction.structured_formatting.main_text}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {prediction.structured_formatting.secondary_text}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
