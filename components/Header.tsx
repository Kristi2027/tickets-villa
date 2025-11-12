import React, { useState } from 'react';
// FIX: Import DisplayMode to use in component props
import { User, DisplayMode } from '../types.ts';

interface HeaderProps {
    user: User | null;
    onNavigate: (view: string, tab?: string) => void;
    onCreateEvent: () => void;
    categoryVisibility: { events: boolean; movies: boolean; venues: boolean; mobileTheatres: boolean; artists: boolean; };
    activeView: string;
    // FIX: Add displayMode to props to determine active link state
    displayMode: DisplayMode;
    viewingArtistAsAdmin: User | null;
    onExitArtistDashboardView: () => void;
}

const NavLink: React.FC<{ onClick: () => void, children: React.ReactNode, isActive?: boolean, className?: string }> = ({ onClick, children, isActive, className }) => (
    <button onClick={onClick} className={`py-1 border-b-2 transition-colors font-medium ${isActive ? 'border-red-600 text-white' : 'border-transparent text-slate-300 hover:text-white hover:border-red-600/50'} ${className}`}>
        {children}
    </button>
);

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onCreateEvent, categoryVisibility, activeView, displayMode, viewingArtistAsAdmin, onExitArtistDashboardView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleMobileNav = (view: string) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    const handleMobileCreate = () => {
        onCreateEvent();
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {viewingArtistAsAdmin && (
                <div className="bg-yellow-500 text-black text-sm text-center py-1.5 px-4 font-semibold flex justify-center items-center gap-4 sticky top-0 z-50">
                    <span>
                        You are viewing the dashboard as <span className="font-bold">{viewingArtistAsAdmin.email}</span>.
                    </span>
                    <button onClick={onExitArtistDashboardView} className="bg-black/20 text-white font-bold text-xs py-1 px-3 rounded-full hover:bg-black/40">
                        Exit View
                    </button>
                </div>
            )}
            <header className="bg-black/30 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-800">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div onClick={() => onNavigate('events')} className='cursor-pointer'>
                        <h1 className="text-2xl font-bold">Tickets <span className="text-red-600">Villa</span></h1>
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-6">
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.events && <NavLink onClick={() => onNavigate('events')} isActive={activeView === 'event_list' && displayMode === 'events'}>Events</NavLink>}
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.movies && <NavLink onClick={() => onNavigate('movies')} isActive={activeView === 'event_list' && displayMode === 'movies'}>Movies</NavLink>}
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.venues && <NavLink onClick={() => onNavigate('venues')} isActive={activeView === 'event_list' && displayMode === 'venues'}>Venues</NavLink>}
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.mobileTheatres && <NavLink onClick={() => onNavigate('mobileTheatres')} isActive={activeView === 'event_list' && displayMode === 'mobileTheatres'}>Mobile Theatres</NavLink>}
                        {categoryVisibility.artists && <NavLink onClick={() => onNavigate('artists')} isActive={activeView === 'event_list' && displayMode === 'artists'}>Artists</NavLink>}
                        {user && <NavLink onClick={() => onNavigate('my_bookings')} isActive={activeView === 'my_bookings'}>My Bookings</NavLink>}
                        {user?.role === 'theatre_manager' && <NavLink onClick={() => onNavigate('theatre_manager')} isActive={activeView === 'theatre_manager'}>Manager Dashboard</NavLink>}
                        {user?.role === 'artist' && <NavLink onClick={() => onNavigate('artist_dashboard')} isActive={activeView === 'artist_dashboard'}>Artist Dashboard</NavLink>}
                        {user?.role === 'admin' && <NavLink onClick={() => onNavigate('admin')} isActive={activeView === 'admin'}>Admin Dashboard</NavLink>}
                    </nav>
                    
                    <div className="hidden md:flex items-center space-x-4">
                        {user && (user.role === 'admin' || user.role === 'organizer') && (
                            <button onClick={onCreateEvent} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                                Create Event
                            </button>
                        )}
                    </div>
                    
                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu" className="text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                role="dialog"
                aria-modal="true"
                className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                {/* Menu Panel */}
                <div
                    className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-zinc-950 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-4 border-b border-slate-800">
                        <h2 className="text-lg font-bold text-white">Menu</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="text-white p-1 rounded-full hover:bg-white/10">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                         </button>
                    </div>
                    <nav className="flex flex-col p-6 space-y-4">
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.events && <NavLink onClick={() => handleMobileNav('events')} className="text-xl text-left" isActive={activeView === 'event_list' && displayMode === 'events'}>Events</NavLink>}
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.movies && <NavLink onClick={() => handleMobileNav('movies')} className="text-xl text-left" isActive={activeView === 'event_list' && displayMode === 'movies'}>Movies</NavLink>}
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.venues && <NavLink onClick={() => handleMobileNav('venues')} className="text-xl text-left" isActive={activeView === 'event_list' && displayMode === 'venues'}>Venues</NavLink>}
                        {/* FIX: Use `displayMode` prop instead of non-existent `appState` */}
                        {categoryVisibility.mobileTheatres && <NavLink onClick={() => handleMobileNav('mobileTheatres')} className="text-xl text-left" isActive={activeView === 'event_list' && displayMode === 'mobileTheatres'}>Mobile Theatres</NavLink>}
                        {categoryVisibility.artists && <NavLink onClick={() => handleMobileNav('artists')} className="text-xl text-left" isActive={activeView === 'event_list' && displayMode === 'artists'}>Artists</NavLink>}
                        {user && <NavLink onClick={() => handleMobileNav('my_bookings')} className="text-xl text-left" isActive={activeView === 'my_bookings'}>My Bookings</NavLink>}
                        {user?.role === 'theatre_manager' && <NavLink onClick={() => handleMobileNav('theatre_manager')} className="text-xl text-left" isActive={activeView === 'theatre_manager'}>Manager Dashboard</NavLink>}
                        {user?.role === 'artist' && <NavLink onClick={() => handleMobileNav('artist_dashboard')} className="text-xl text-left" isActive={activeView === 'artist_dashboard'}>Artist Dashboard</NavLink>}
                        {user?.role === 'admin' && <NavLink onClick={() => handleMobileNav('admin')} className="text-xl text-left" isActive={activeView === 'admin'}>Admin Dashboard</NavLink>}
                         
                        <div className="pt-6 border-t border-slate-800 w-full flex flex-col items-center space-y-4">
                            {user && (user.role === 'admin' || user.role === 'organizer') && (
                                <button onClick={handleMobileCreate} className="w-full text-center bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-red-700 transition-colors">
                                    Create Event
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Header;
