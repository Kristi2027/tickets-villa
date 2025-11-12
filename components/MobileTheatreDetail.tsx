import React, { useState, useMemo } from 'react';
import { MobileTheatre, TourStop, MobileShowtime } from '../types';

interface MobileTheatreDetailProps {
  theatre: MobileTheatre;
  onBack: () => void;
  onStartBooking: (theatre: MobileTheatre, tourStop: TourStop, showtime: MobileShowtime) => void;
}

const MobileTheatreDetail: React.FC<MobileTheatreDetailProps> = ({ theatre, onBack, onStartBooking }) => {

    const initialStopIndex = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the index of the currently active stop
        const currentStopIndex = theatre.tourPlan.findIndex(stop => {
            const start = new Date(stop.startDate);
            const end = new Date(stop.endDate);
            return today >= start && today <= end;
        });

        if (currentStopIndex !== -1) {
            return currentStopIndex;
        }

        // If no current stop, find the index of the next upcoming stop
        const upcomingStops = theatre.tourPlan
            .map((stop, index) => ({ ...stop, index }))
            .filter(stop => new Date(stop.startDate) > today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        // Return the index of the first upcoming stop, or default to 0 if none
        return upcomingStops.length > 0 ? upcomingStops[0].index : 0;
    }, [theatre.tourPlan]);
    
    const [expandedStopIndex, setExpandedStopIndex] = useState<number | null>(initialStopIndex);
    
    const formatTime12Hour = (time24: string) => {
        if (!time24) return '';
        try {
            const [hours, minutes] = time24.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return time24; // Fallback
        }
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const startFormatted = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const endFormatted = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${startFormatted} - ${endFormatted}`;
    };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to List
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="aspect-video bg-black rounded-lg border border-slate-700">
                        <img src={theatre.bannerImage} alt={theatre.name} loading="lazy" className="w-full h-full object-cover rounded-lg" />
                    </div>
                </div>

                <div className="lg:col-span-1">
                     <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 lg:sticky top-24">
                        <p className="text-sm text-red-500 font-semibold uppercase tracking-wider">Mobile Theatre</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">{theatre.name}</h1>
                        <p className="text-lg text-slate-300 mt-2">By {theatre.owner}</p>
                        <p className="mt-4 font-semibold text-white bg-red-600/20 border border-red-500/50 inline-block px-3 py-1 rounded-full text-sm">
                            Season {theatre.season}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-4">About {theatre.name}</h3>
                <p className="text-slate-300 leading-relaxed max-w-4xl">{theatre.description}</p>
            </div>
            
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-6">Tour Plan & Showtimes</h3>
                {theatre.tourPlan && theatre.tourPlan.length > 0 ? (
                    <div className="space-y-4">
                        {theatre.tourPlan.map((stop, index) => {
                            const isExpanded = expandedStopIndex === index;
                            return (
                                <div key={index} className={`bg-zinc-900 border ${isExpanded ? 'border-red-600/30' : 'border-slate-800'} rounded-2xl overflow-hidden transition-all`}>
                                    <button 
                                        className="w-full flex justify-between items-center p-6 text-left hover:bg-zinc-800/50"
                                        onClick={() => setExpandedStopIndex(isExpanded ? null : index)}
                                        aria-expanded={isExpanded}
                                    >
                                        <div>
                                            <h4 className="text-xl font-bold text-white">{stop.location}</h4>
                                            <p className="text-sm text-slate-400">{formatDateRange(stop.startDate, stop.endDate)}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 pb-6">
                                            <div className="border-t border-slate-700 pt-4">
                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-400">Venue</p>
                                                    <p className="font-semibold text-lg text-red-400">{stop.venueName}</p>
                                                </div>
                                                
                                                <h5 className="font-semibold text-white mb-3">Available Shows</h5>
                                                {stop.showtimes && stop.showtimes.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {stop.showtimes.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)).map(show => (
                                                            <div key={show.id} className="flex flex-col sm:flex-row justify-between items-center bg-black/20 p-4 rounded-lg">
                                                                <div>
                                                                    <p className="font-bold text-lg text-white">{new Date(show.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                                    <p className="text-slate-300">{formatTime12Hour(show.time)}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => onStartBooking(theatre, stop, show)}
                                                                    className="w-full sm:w-auto mt-4 sm:mt-0 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                                                >
                                                                    Book Tickets
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-black/20 rounded-lg">
                                                        <p className="text-slate-400">Showtimes for this location will be announced soon.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                     <div className="text-center py-16 bg-zinc-900/50 border border-dashed border-slate-700 rounded-2xl">
                        <h4 className="text-xl font-semibold text-slate-300">Tour plan has not been announced.</h4>
                        <p className="text-slate-500 mt-2">Please check back later for locations and ticket bookings.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default MobileTheatreDetail;