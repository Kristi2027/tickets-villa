import React, { useState } from 'react';
// FIX: Import EventBooking and GuestDetails to use in prop types.
import { Event, Showtime, Theatre, User, Offer, EventBooking, GuestDetails, GlobalSettings } from '../types.ts';
import MovieShowtimeSelector from './MovieShowtimeSelector.tsx';
import SeatSelection from './SeatSelection.tsx';
import TrailerModal from './TrailerModal.tsx';
import TopReviews from './TopReviews.tsx';
import CastAndCrew from './CastAndCrew.tsx';
import MovieMeta from './MovieMeta.tsx';
import { MOCK_CAST, MOCK_CREW } from '../mockData.ts';

interface EventDetailProps {
  event: Event;
  user: User | null;
  theatres: Theatre[];
  onBack: () => void;
  // FIX: Update onBookingSuccess prop to correctly type its arguments.
  onBookingSuccess: (bookingData: Omit<EventBooking, 'id' | 'paymentId'>, guestDetails?: GuestDetails) => void;
  offers?: Offer[];
  globalSettings: GlobalSettings;
}

const OfferIcon: React.FC<{ type: 'tag' | 'card' }> = ({ type }) => {
    if (type === 'card') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v5a2 2 0 002 2h.5" /></svg>;
};

const EventDetail: React.FC<EventDetailProps> = ({ event, user, theatres, onBack, onBookingSuccess, offers, globalSettings }) => {
    const [bookingState, setBookingState] = useState<{ showtime: Showtime; theatre: Theatre; date: string } | null>(null);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    const handleSelectShowtime = (showtime: Showtime, theatre: Theatre, date: string) => {
        setBookingState({ showtime, theatre, date });
    };

    const handleBackFromSeatSelection = () => {
        setBookingState(null);
    };

    if (bookingState) {
        return (
            <SeatSelection
                event={event}
                showtime={bookingState.showtime}
                theatre={bookingState.theatre}
                date={bookingState.date}
                user={user}
                onBack={handleBackFromSeatSelection}
                onBookingSuccess={onBookingSuccess}
                globalSettings={globalSettings}
            />
        );
    }
    
    const minPrice = event.tickets.length > 0 ? Math.min(...event.tickets.map(t => t.price)) : 0;
    const trailerEmbedUrl = event.trailerVideoId ? `https://www.youtube.com/embed/${event.trailerVideoId}?autoplay=1` : '';

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to List
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Banner & Trailer */}
                <div className="md:col-span-4 lg:col-span-3">
                     <div className="relative rounded-lg overflow-hidden shadow-lg border border-slate-800">
                        <img src={event.bannerImage} alt={event.title} className="w-full h-auto" />
                        {event.trailerVideoId && (
                             <button 
                                onClick={() => setIsTrailerOpen(true)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-8 lg:col-span-9">
                    <p className="text-sm text-red-500 font-semibold">{event.category.toUpperCase()}</p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-1">{event.title}</h1>
                    {event.category === 'Movies' ? (
                        <MovieMeta event={event} />
                    ) : (
                        <div className="mt-4 text-slate-300 space-y-2">
                             <p>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                             <p>{event.venue}, {event.city}</p>
                             <p>Tickets from <span className="font-bold text-red-500">₹{minPrice}</span></p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 space-y-12">
                 <div>
                    <h3 className="text-2xl font-bold text-white mb-4">About</h3>
                    <p className="text-slate-300 leading-relaxed">{event.description}</p>
                </div>

                {event.category === 'Movies' && <CastAndCrew cast={MOCK_CAST} crew={MOCK_CREW} />}

                {event.category === 'Movies' && <TopReviews />}
                
                {event.category === 'Movies' && (
                    <MovieShowtimeSelector event={event} theatres={theatres} onSelectShowtime={handleSelectShowtime} />
                )}

                {offers && offers.length > 0 && event.category === 'Movies' && (
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Top offers for you</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                            {offers.map(offer => (
                                <div key={offer.id} className="flex-shrink-0 w-64 bg-zinc-900 rounded-lg p-4 border-2 border-dashed border-yellow-500/50">
                                    <div className="flex items-start gap-3">
                                        <div className="text-yellow-400 mt-1">
                                            <OfferIcon type={offer.type} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white leading-tight">{offer.title}</p>
                                            <p className="text-xs text-slate-400 mt-1 cursor-pointer">Tap to view details</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isTrailerOpen && trailerEmbedUrl && (
                <TrailerModal trailerUrl={trailerEmbedUrl} onClose={() => setIsTrailerOpen(false)} />
            )}
        </div>
    );
};

export default EventDetail;