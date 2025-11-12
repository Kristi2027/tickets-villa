

import React from 'react';
import { DisplayMode } from '../types.ts';

interface DisplayModeToggleProps {
    activeMode: DisplayMode;
    onModeChange: (mode: DisplayMode) => void;
    categoryVisibility: {
        events: boolean;
        movies: boolean;
        venues: boolean;
        mobileTheatres: boolean;
    };
}

const NavLink: React.FC<{ onClick: () => void, children: React.ReactNode, isActive?: boolean }> = ({ onClick, children, isActive }) => (
    <button onClick={onClick} className={`px-4 py-2 text-base font-medium border-b-2 transition-colors ${isActive ? 'border-red-600 text-white' : 'border-transparent text-slate-400 hover:text-white hover:border-red-600/50'}`}>
        {children}
    </button>
);

const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({ activeMode, onModeChange, categoryVisibility }) => {
    const availableModes: { key: DisplayMode, label: string }[] = [];
    if (categoryVisibility.events) availableModes.push({ key: 'events', label: 'Events' });
    if (categoryVisibility.movies) availableModes.push({ key: 'movies', label: 'Movies' });
    if (categoryVisibility.venues) availableModes.push({ key: 'venues', label: 'Venues' });
    if (categoryVisibility.mobileTheatres) availableModes.push({ key: 'mobileTheatres', label: 'Mobile Theatres' });
    
    // If only one or zero modes are available, don't render the toggle
    if (availableModes.length <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-4 mb-8">
            {availableModes.map(mode => (
                 <NavLink
                    key={mode.key}
                    onClick={() => onModeChange(mode.key)}
                    isActive={activeMode === mode.key}
                >
                    {mode.label}
                </NavLink>
            ))}
        </div>
    );
};

export default DisplayModeToggle;