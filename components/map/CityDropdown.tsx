import { ChevronDown } from "lucide-react";

interface CityDropdownProps {
    cities: string[];
    selectedCity: string;
    onSelectCity: (city: string) => void;
    isLoading?: boolean;
}

export default function CityDropdown({ cities, selectedCity, onSelectCity, isLoading }: CityDropdownProps) {
    return (
        <div className="relative inline-block text-left">
            <div className="group">
                <button
                    type="button"
                    className="inline-flex justify-between items-center w-full rounded-md border border-[#4A2C2A]/20 shadow-sm px-4 py-2 bg-[#F5E6D3] text-sm font-medium text-[#4A2C2A] hover:bg-[#EBDBC6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2C2A] transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : selectedCity || "Select City"}
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </button>

                {/* Dropdown menu */}
                <div className="hidden group-hover:block absolute right-0 mt-0 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {cities.map((city) => (
                            <button
                                key={city}
                                onClick={() => onSelectCity(city)}
                                className={`block w-full text-left px-4 py-2 text-sm ${selectedCity === city ? 'bg-[#4A2C2A]/10 text-[#4A2C2A] font-semibold' : 'text-gray-700 hover:bg-[#F5E6D3] hover:text-[#4A2C2A]'}`}
                                role="menuitem"
                            >
                                {city}
                            </button>
                        ))}
                        {cities.length === 0 && !isLoading && (
                            <div className="px-4 py-2 text-sm text-gray-500">No cities found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
