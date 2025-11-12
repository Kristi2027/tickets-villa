import React, { useState, useMemo } from 'react';
// NOTE: Artist and ArtistBooking are imported for artist booking features
import { User, EventBooking, VenueBooking, Event, Venue, MobileTheatre, Artist, ArtistBooking } from '../types.ts';

interface MyBookingsProps {
    user: User;
    bookings: EventBooking[];
    venueBookings: VenueBooking[];
    // FIX: Add artistBookings to props
    artistBookings: ArtistBooking[];
    events: Event[];
    venues: Venue[];
    mobileTheatres: MobileTheatre[];
    // FIX: Add artists to props
    artists: Artist[];
    // FIX: Update onViewDetails to accept 'artist_booking'
    onViewDetails: (bookingId: string, type: 'event' | 'venue' | 'mobile_theatre' | 'artist_booking') => void;
    // FIX: Add onPayForArtistBooking to props
    onPayForArtistBooking: (bookingId: string) => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ user, bookings, venueBookings, artistBookings, events, venues, mobileTheatres, artists, onViewDetails, onPayForArtistBooking }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const allUserBookings = useMemo(() => {
        const userEventBookings = bookings.filter(b => b.userEmail === user.email);
        const userVenueBookings = venueBookings.filter(b => b.userEmail === user.email);
        // FIX: Add user's artist bookings to the list
        const userArtistBookings = artistBookings.filter(b => b.clientId === user.email);

        const combined = [
            ...userEventBookings.map(b => {
                const event = events.find(e => e.id === b.eventId);
                const mobileTheatre = mobileTheatres.find(mt => mt.id === b.eventId);
                const bookingDateStr = b.showDate || event?.date;
                const bookingDate = bookingDateStr ? new Date(bookingDateStr.replace(/-/g, '/')) : new Date();
                const type: 'event' | 'mobile_theatre' = mobileTheatre ? 'mobile_theatre' : 'event';
                return { ...b, bookingDate, type };
            }),
            ...userVenueBookings.map(b => {
                const bookingDate = new Date(b.bookedDate.replace(/-/g, '/'));
                return { ...b, bookingDate, type: 'venue' as const };
            }),
            // FIX: Map artist bookings to the combined list
            ...userArtistBookings.map(b => {
                const bookingDate = new Date(b.eventDate.replace(/-/g, '/'));
                return { ...b, bookingDate, type: 'artist_booking' as const };
            })
        ].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

        return combined;
    }, [user.email, bookings, venueBookings, artistBookings, events, mobileTheatres, artists]);

    const { upcoming, past } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            upcoming: allUserBookings.filter(b => new Date(b.bookingDate) >= today),
            past: allUserBookings.filter(b => new Date(b.bookingDate) < today)
        };
    }, [allUserBookings]);

    const bookingsToShow = activeTab === 'upcoming' ? upcoming : past;

    const TabButton = ({ tab, label }: { tab: 'upcoming' | 'past', label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-lg font-semibold rounded-lg transition-colors ${
                activeTab === tab ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
        >
            {label}
        </button>
    );

    const BookingCard: React.FC<{ booking: typeof allUserBookings[0] }> = ({ booking }) => {
        let title, image, dateDisplay, location;

        if (booking.type === 'venue') {
            const venue = venues.find(v => v.id === booking.venueId);
            title = venue?.name;
            image = venue?.bannerImage;
            dateDisplay = new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            location = `${venue?.address}, ${venue?.city}`;
        } else if (booking.type === 'artist_booking') {
            const artist = artists.find(a => a.id === booking.artistId);
            title = artist?.name;
            image = artist?.photo;
            dateDisplay = new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            location = booking.eventVenue;
        }
        else { // event or mobile_theatre
            const event = events.find(e => e.id === booking.eventId);
            const mobileTheatre = mobileTheatres.find(mt => mt.id === booking.eventId);

            title = mobileTheatre?.name || event?.title;
            image = mobileTheatre?.bannerImage || event?.bannerImage;
            dateDisplay = new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            
            if ('showtimeId' in booking && booking.showtimeId) {
                const showtime = mobileTheatre?.tourPlan.flatMap(ts => ts.showtimes || []).find(st => st.id === booking.showtimeId) 
                                || event?.showtimes?.find(st => st.id === booking.showtimeId);
                if (showtime?.time) {
                     const time = new Date();
                     const [h, m] = showtime.time.split(':');
                     time.setHours(parseInt(h), parseInt(m));
                     dateDisplay += ` at ${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                }
            }
            location = mobileTheatre ? mobileTheatre.tourPlan.find(ts => ts.showtimes?.some(st => st.id === booking.showtimeId))?.venueName : `${event?.venue}, ${event?.city}`;
        }

        if (!title) return null;

        const getStatusText = (status: ArtistBooking['status']) => {
             const statusMap = {
                pending_artist_approval: 'Pending Approval',
                confirmed_by_artist: 'Awaiting Payment',
                paid: 'Paid',
                rejected_by_artist: 'Rejected',
                cancelled_by_client: 'Cancelled'
             };
             return statusMap[status] || status;
        }

        return (
            <div className="bg-zinc-900 rounded-xl overflow-hidden group transition-all duration-300 border border-slate-800 flex flex-col md:flex-row">
                <img src={image} alt={title} className="w-full md:w-48 h-48 md:h-auto object-cover flex-shrink-0" />
                <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white truncate">{title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{dateDisplay}</p>
                        <p className="text-slate-400 text-sm">{location}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-400">{booking.type === 'artist_booking' ? 'Proposed Fee' : 'Total Paid'}</p>
                            <p className="text-lg text-red-600 font-bold">₹{'totalPrice' in booking ? booking.totalPrice.toLocaleString('en-IN') : booking.proposedFee.toLocaleString('en-IN')}</p>
                        </div>
                        {booking.type === 'artist_booking' ? (
                            <>
                                {booking.status === 'confirmed_by_artist' && (
                                     <button
                                        onClick={() => onPayForArtistBooking(booking.id)}
                                        className="font-semibold text-white bg-green-600 px-5 py-2 rounded-lg text-sm transition-colors hover:bg-green-700 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                    >
                                        Pay Now
                                    </button>
                                )}
                                {booking.status === 'paid' && (
                                    <button
                                        onClick={() => onViewDetails(booking.id, booking.type)}
                                        className="font-semibold text-white bg-red-600 px-5 py-2 rounded-lg text-sm transition-colors hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                    >
                                        View Confirmation
                                    </button>
                                )}
                                {booking.status !== 'confirmed_by_artist' && booking.status !== 'paid' && (
                                    <span className="text-sm font-semibold text-slate-400">{getStatusText(booking.status)}</span>
                                )}
                            </>
                        ) : (
                             <button
                                onClick={() => onViewDetails(booking.id, booking.type)}
                                className="font-semibold text-white bg-red-600 px-5 py-2 rounded-lg text-sm transition-colors hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            >
                                View Ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-8">My Bookings</h2>
            <div className="flex items-center gap-2 mb-8">
                <TabButton tab="upcoming" label="Upcoming" />
                <TabButton tab="past" label="Past Bookings" />
            </div>

            {bookingsToShow.length > 0 ? (
                <div className="space-y-6">
                    {bookingsToShow.map(booking => <BookingCard key={booking.id} booking={booking} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-zinc-900 border border-dashed border-slate-700 rounded-2xl">
                    <h3 className="text-xl font-semibold text-slate-300">No {activeTab} bookings found.</h3>
                    <p className="text-slate-500 mt-2">Time to make some new memories!</p>
                </div>
            )}
        </div>
    );
};

export default MyBookings;