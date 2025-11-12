import React, { memo, useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { User, Theatre, Event, EventBooking, Screen, Showtime, GlobalSettings } from '../types.ts';
import Modal from './Modal';

const BoxOffice = lazy(() => import('./BoxOffice'));

// --- START OF IN-FILE COMPONENTS FOR MOVIE LISTING MANAGEMENT ---
// NOTE: These components are duplicated from AdminDashboard due to file constraints.
// In a standard project, they would be in their own files and imported.

const ShowtimeEditorModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (time: string) => void; initialTime?: string; }> = ({ isOpen, onClose, onSave, initialTime = '10:00' }) => {
    const [time, setTime] = useState(initialTime);

    const handleSave = () => {
        onSave(time);
        onClose();
    };

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-6">Add/Edit Showtime</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Show Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className={formInputStyles}/>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
                <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                <button type="button" onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">Save Time</button>
            </div>
        </Modal>
    );
};

const MovieListingManagement: React.FC<{
    event: Event;
    theatres: Theatre[];
    user: User;
    onSave: (event: Event) => void;
    onBack: () => void;
}> = ({ event, theatres, user, onSave, onBack }) => {
    const [editingEvent, setEditingEvent] = useState<Event>(event);
    const [isSaving, setIsSaving] = useState(false);
    const [showtimeModal, setShowtimeModal] = useState<{ isOpen: boolean; theatreId: string; screen: Screen; showtime?: Showtime; }>({ isOpen: false, theatreId: '', screen: null! });

    const managerTheatreId = user.theatreId;

    const listedTheatres = useMemo(() => {
        const theatreIds = Object.keys(editingEvent.screenListings || {});
        return theatreIds
            .map(theatreId => theatres.find(t => t.id === theatreId))
            .filter((t): t is Theatre => !!t)
            .filter(t => user.role === 'admin' || t.id === managerTheatreId); // Filter for manager
    }, [editingEvent.screenListings, theatres, user.role, managerTheatreId]);

    const handleShowtimeSave = (time: string) => {
        const { theatreId, screen, showtime } = showtimeModal;
        const newShowtime = {
            id: showtime?.id || `st-${Date.now()}`,
            theatreId,
            screenId: screen.id,
            time,
            availability: 'available',
            seatStatus: screen.seatLayout.grid.map(row => row.map(cell => cell === 'aisle' || cell === 'empty' ? 'locked' : 'available'))
        } as Showtime;

        setEditingEvent(prev => {
            const existingShowtimes = prev.showtimes || [];
            if (showtime) { // Editing existing
                return {...prev, showtimes: existingShowtimes.map(st => st.id === showtime.id ? newShowtime : st)};
            } else { // Adding new
                return {...prev, showtimes: [...existingShowtimes, newShowtime]};
            }
        });
        setShowtimeModal({ isOpen: false, theatreId: '', screen: null! });
    };
    
    const handleShowtimeDelete = (showtimeId: string) => {
        if (window.confirm("Are you sure you want to delete this showtime?")) {
            setEditingEvent(prev => ({...prev, showtimes: (prev.showtimes || []).filter(st => st.id !== showtimeId)}));
        }
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        onSave(editingEvent);
        setTimeout(() => {
            setIsSaving(false);
            onBack();
        }, 500);
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                 <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Dashboard
                    </button>
                    <h2 className="text-3xl font-bold text-white">Manage Showtimes for: {event.title}</h2>
                </div>
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            <div className="space-y-4">
                {listedTheatres.map(theatre => (
                    <div key={theatre.id} className="bg-zinc-900 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-xl font-bold text-red-500">{theatre.name}</h4>
                        {theatre.screens.map(screen => {
                            const screenShowtimes = (editingEvent.showtimes || []).filter(st => st.theatreId === theatre.id && st.screenId === screen.id);
                            return (
                                <div key={screen.id} className="mt-2 pt-2 border-t border-slate-800/50">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-white">{screen.name}</p>
                                        <button onClick={() => setShowtimeModal({isOpen: true, theatreId: theatre.id, screen})} className="text-sm font-semibold bg-red-600/20 text-red-400 py-1 px-3 rounded-md hover:bg-red-600/40">+ Add Showtime</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {screenShowtimes.length > 0 ? screenShowtimes.map(st => (
                                            <div key={st.id} className="bg-black/30 p-2 rounded-md flex items-center gap-2 group">
                                                <span className="font-mono text-sm">{st.time}</span>
                                                <button onClick={() => setShowtimeModal({isOpen: true, theatreId: theatre.id, screen, showtime: st})} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                                                <button onClick={() => handleShowtimeDelete(st.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                            </div>
                                        )) : <p className="text-xs text-slate-500">No showtimes added for this screen.</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                {listedTheatres.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-400">This movie is not currently listed at your theatre.</p>
                        <p className="text-sm text-slate-500">An admin must first assign the movie to your location.</p>
                    </div>
                )}
            </div>
             {showtimeModal.isOpen && <ShowtimeEditorModal {...showtimeModal} onClose={() => setShowtimeModal({ isOpen: false, theatreId: '', screen: null! })} onSave={handleShowtimeSave} />}
        </div>
    );
};
// --- END OF IN-FILE COMPONENTS ---


interface TheatreManagerDashboardProps {
    user: User;
    theatres: Theatre[];
    events: Event[];
    bookings: EventBooking[];
    onSaveEvent: (event: Event) => void;
    onAddBooking: (booking: Omit<EventBooking, 'id' | 'paymentId'>) => EventBooking;
    globalSettings: GlobalSettings;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = memo(({ title, value }) => (
    <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-slate-400 uppercase">{title}</h4>
        <p className="text-3xl font-bold text-red-500 mt-2">{value}</p>
    </div>
));

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isActive ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'
        }`}
    >
        {children}
    </button>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
    </div>
);

const TheatreManagerDashboard: React.FC<TheatreManagerDashboardProps> = ({ user, theatres, events, bookings, onSaveEvent, onAddBooking, globalSettings }) => {
    
    const [managingMovie, setManagingMovie] = useState<Event | null>(null);
    const [activeTab, setActiveTab] = useState<'showtimes' | 'boxoffice'>('showtimes');
    const assignedTheatre = theatres.find(t => t.id === user.theatreId);

    if (!assignedTheatre) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-white">No Theatre Assigned</h2>
                <p className="text-slate-400 mt-2">Please contact an administrator to be assigned to a theatre.</p>
            </div>
        );
    }
    
    const theatreEvents = events.filter(event => 
        event.category === 'Movies' && 
        event.screenListings &&
        event.screenListings[assignedTheatre.id]
    );

    const theatreBookings = bookings.filter(booking => {
        const event = events.find(e => e.id === booking.eventId);
        return event?.showtimes?.some(st => st.theatreId === assignedTheatre.id && st.id === booking.showtimeId);
    });

    const totalRevenue = theatreBookings.reduce((acc, b) => acc + b.totalPrice, 0);
    const totalTicketsSold = theatreBookings.reduce((acc, b) => acc + b.bookedTickets.reduce((tAcc, t) => tAcc + (t.quantity || 1), 0), 0);

    if (managingMovie) {
        return <MovieListingManagement
            event={managingMovie}
            theatres={theatres}
            user={user}
            onSave={onSaveEvent}
            onBack={() => setManagingMovie(null)}
        />
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'boxoffice':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <BoxOffice events={events} theatres={theatres} bookings={bookings} onAddBooking={onAddBooking} user={user} globalSettings={globalSettings} />
                    </Suspense>
                );
            case 'showtimes':
            default:
                return (
                     <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Manage Movie Showtimes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3">Movie Title</th>
                                        <th className="px-4 py-3">Genre</th>
                                        <th className="px-4 py-3">Total Showtimes</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {theatreEvents.map(event => {
                                        const showtimeCount = event.showtimes?.filter(st => st.theatreId === assignedTheatre.id).length || 0;
                                        return (
                                        <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="px-4 py-3 font-medium text-white">{event.title}</td>
                                            <td className="px-4 py-3">{event.genre}</td>
                                            <td className="px-4 py-3">{showtimeCount}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => setManagingMovie(event)} className="font-medium text-red-500 hover:text-red-400">
                                                    Manage Showtimes
                                                </button>
                                            </td>
                                        </tr>
                                        )
                                    })}
                                    {theatreEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-slate-500">
                                                No movies are currently listed for your theatre by the admin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-4xl font-bold text-white tracking-tight">Manager Dashboard</h2>
                <p className="text-slate-400 mt-1">Welcome, you are managing: <span className="font-semibold text-red-500">{assignedTheatre.name}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Revenue (Your Theatre)" value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
                <StatCard title="Tickets Sold (Your Theatre)" value={totalTicketsSold.toLocaleString('en-IN')} />
                <StatCard title="Active Movie Screenings" value={theatreEvents.length} />
            </div>

            <div className="flex items-center gap-2 mb-6">
                <TabButton isActive={activeTab === 'showtimes'} onClick={() => setActiveTab('showtimes')}>
                    Showtime Management
                </TabButton>
                <TabButton isActive={activeTab === 'boxoffice'} onClick={() => setActiveTab('boxoffice')}>
                    Box Office POS
                </TabButton>
            </div>

            {renderContent()}

        </div>
    );
};

export default TheatreManagerDashboard;