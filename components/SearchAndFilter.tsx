import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Event, ActiveFilters, INDIAN_CITIES, Venue } from '../types.ts';
import { DisplayMode } from '../types.ts';

// --- Custom Select Component ---
export interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string | null | undefined;
    onChange: (value: string | null) => void;
    placeholder?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Select...', searchable = false, searchPlaceholder = "Search..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const selectRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const justOpened = useRef(false);

    const selectedOption = options.find(option => option.value === value) || options.find(option => !value && option.value === '');

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return options;
        return options.filter(option => 
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm, searchable]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Effect to track when the dropdown is opened
    useEffect(() => {
        if (isOpen) {
            justOpened.current = true;
        }
    }, [isOpen]);

    // This effect manages highlight logic on open and on filter
    useEffect(() => {
        if (!isOpen) {
            setHighlightedIndex(-1);
            setSearchTerm('');
            return;
        }
        
        if (searchable) {
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }

        if (justOpened.current) {
            // If just opened, find the current value in the list
            const currentIndex = filteredOptions.findIndex(o => o.value === value);
            setHighlightedIndex(currentIndex === -1 ? 0 : currentIndex);
            justOpened.current = false;
        } else {
            // If it's already open and options change, it's a filter action. Reset to top.
            setHighlightedIndex(0);
        }
    }, [isOpen, searchable, value, filteredOptions]);
    
    useEffect(() => {
        if (isOpen && listRef.current && highlightedIndex >= 0) {
            const highlightedItem = listRef.current.children[highlightedIndex + (searchable ? 1 : 0)] as HTMLLIElement;
            if (highlightedItem) {
                highlightedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen, searchable]);

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue === '' ? null : optionValue);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            setIsOpen(true);
            return;
        }

        switch(e.key) {
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleOptionClick(filteredOptions[highlightedIndex].value);
                }
                break;
        }
    };
    
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
            handleKeyDown(e);
        }
    };

    return (
        <div className="relative w-full" ref={selectRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className="w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all flex justify-between items-center text-left"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={`truncate ${value ? 'text-white' : 'text-slate-400'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg className={`flex-shrink-0 ml-2 fill-current h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </button>

            {isOpen && (
                <ul
                    ref={listRef}
                    className="absolute z-40 mt-1 w-full bg-zinc-900 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                    role="listbox"
                >
                    {searchable && (
                        <li className="p-2 sticky top-0 bg-zinc-900 z-10">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full bg-zinc-800 border border-slate-700 rounded-md py-1.5 px-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                onClick={e => e.stopPropagation()}
                            />
                        </li>
                    )}
                    {filteredOptions.length > 0 ? filteredOptions.map((option, index) => {
                        const isSelected = option.value === value || (value === null && option.value === '');
                        const isHighlighted = index === highlightedIndex;
                        return (
                            <li
                                key={option.value}
                                onClick={() => handleOptionClick(option.value)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`px-3 py-2 cursor-pointer text-white truncate ${
                                    isHighlighted ? 'bg-slate-700' : (isSelected ? 'bg-red-600' : '')
                                } ${isSelected ? 'font-semibold' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                            >
                                {option.label}
                            </li>
                        )
                    }) : (
                         <li className="px-3 py-2 text-slate-400">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
};


interface SearchAndFilterProps {
  allEvents: Event[];
  allVenues: Venue[];
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  activeFilters: ActiveFilters;
  onActiveFiltersChange: (filters: ActiveFilters) => void;
  displayMode: DisplayMode;
}

const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

const FilterModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    allEvents: Event[],
    allVenues: Venue[],
    applyFilters: (filters: ActiveFilters) => void,
    clearFilters: () => void,
    displayMode: DisplayMode,
}> = ({ isOpen, onClose, allEvents, allVenues, applyFilters, clearFilters, displayMode }) => {
    
    const [localFilters, setLocalFilters] = useState<ActiveFilters>({ category: '', genre: '', actor: '', director: '', minCapacity: 0, amenities: [] });
    
    const unique = useMemo(() => {
        const categories = Array.from(new Set(allEvents.filter(e => e.category !== 'Movies').map(e => e.category))).sort();
        const genres = Array.from(new Set(allEvents.filter(e => e.genre).map(e => e.genre!))).sort();
        const amenities = Array.from(new Set(allVenues.flatMap(v => v.amenities))).sort();
        return { categories, genres, amenities };
    }, [allEvents, allVenues]);
    
    const categoryOptions = useMemo(() => [
        { value: '', label: 'All Categories' },
        ...unique.categories.map(c => ({ value: c, label: c }))
    ], [unique.categories]);

    const genreOptions = useMemo(() => [
        { value: '', label: 'All Genres' },
        ...unique.genres.map(g => ({ value: g, label: g }))
    ], [unique.genres]);

    const handleApply = () => {
        applyFilters(localFilters);
        onClose();
    };
    
    const handleClear = () => {
        const clearedFilters = { category: '', genre: '', actor: '', director: '', minCapacity: 0, amenities: [] };
        setLocalFilters(clearedFilters);
        clearFilters();
    };

    const handleLocalFilterChange = (field: keyof ActiveFilters, value: any) => {
        setLocalFilters(prev => ({...prev, [field]: value}));
    }

    const handleAmenityChange = (amenity: string) => {
        setLocalFilters(prev => {
            const newAmenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities: newAmenities };
        });
    };

    if (!isOpen) return null;
    
    const renderFilters = () => {
        switch(displayMode) {
            case 'events':
                return (
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <CustomSelect
                            options={categoryOptions}
                            value={localFilters.category}
                            onChange={(value) => handleLocalFilterChange('category', value || '')}
                            placeholder="All Categories"
                        />
                    </div>
                );
            case 'movies':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                            <CustomSelect
                                options={genreOptions}
                                value={localFilters.genre}
                                onChange={(value) => handleLocalFilterChange('genre', value || '')}
                                placeholder="All Genres"
                            />
                        </div>
                        <div>
                            <label htmlFor="actor" className="block text-sm font-medium text-slate-300 mb-2">Actor</label>
                            <input type="text" id="actor" placeholder="e.g., Shah Rukh Khan" value={localFilters.actor} onChange={e => handleLocalFilterChange('actor', e.target.value)} className={formInputStyles} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="director" className="block text-sm font-medium text-slate-300 mb-2">Director</label>
                            <input type="text" id="director" placeholder="e.g., S. S. Rajamouli" value={localFilters.director} onChange={e => handleLocalFilterChange('director', e.target.value)} className={formInputStyles} />
                        </div>
                    </div>
                 );
            case 'venues':
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="minCapacity" className="block text-sm font-medium text-slate-300 mb-2">Minimum Capacity</label>
                            <input type="number" id="minCapacity" placeholder="e.g., 100" value={localFilters.minCapacity || ''} onChange={e => handleLocalFilterChange('minCapacity', Number(e.target.value))} className={formInputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Amenities</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {unique.amenities.map(amenity => (
                                    <label key={amenity} className="flex items-center gap-2 bg-black/20 p-2 rounded-md cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={localFilters.amenities.includes(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                            className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-red-600 focus:ring-red-600"
                                        />
                                        <span className="text-sm text-slate-300">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-white">Advanced Filters</h2>
                <div className="space-y-4">
                    {renderFilters()}
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
                    <button type="button" onClick={handleClear} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Clear All</button>
                    <button type="button" onClick={handleApply} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">Apply Filters</button>
                </div>
            </div>
        </div>
    );
};

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
    allEvents,
    allVenues,
    selectedCity,
    onSelectCity,
    searchQuery,
    onSearchQueryChange,
    activeFilters,
    onActiveFiltersChange,
    displayMode
}) => {

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const cityOptions = useMemo(() => [
        { value: '', label: 'All India' },
        ...INDIAN_CITIES.map(city => ({ value: city, label: city }))
    ], []);
    
    const handleClearFilters = () => {
        onActiveFiltersChange({ category: '', genre: '', actor: '', director: '', minCapacity: 0, amenities: [] });
    };

    const getSearchPlaceholder = () => {
        switch(displayMode) {
            case 'events': return 'Search events by name, category or city...';
            case 'movies': return 'Search movies by name, actor or director...';
            case 'venues': return 'Search venues by name or city...';
            case 'artists': return 'Search artists by name or genre...';
            default: return 'Search...';
        }
    }
    
    const clearButtonStyles = "bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-600 hover:text-white transition-colors";
    const filterButtonStyles = "bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors";

    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                    <div className="relative">
                        <input
                            type="search"
                            placeholder={getSearchPlaceholder()}
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className={`${formInputStyles} pl-10`}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
                 <div className="md:col-span-4">
                    <CustomSelect
                        options={cityOptions}
                        value={selectedCity}
                        onChange={onSelectCity}
                        placeholder="Select City"
                        searchable
                        searchPlaceholder="Search city..."
                    />
                </div>
            </div>
             <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                 <button onClick={handleClearFilters} className={clearButtonStyles}>
                    Clear Filters
                </button>
                 <button onClick={() => setIsFilterModalOpen(true)} className={filterButtonStyles}>
                    Advanced Filters
                </button>
            </div>
            
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                allEvents={allEvents}
                allVenues={allVenues}
                applyFilters={onActiveFiltersChange}
                clearFilters={handleClearFilters}
                displayMode={displayMode}
            />
        </div>
    );
};

export default SearchAndFilter;