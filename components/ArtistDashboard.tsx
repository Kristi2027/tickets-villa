import React, { useMemo } from 'react';
import { User, Artist, ArtistBooking, PayoutRequest, GlobalSettings } from '../types';

interface ArtistDashboardProps {
    user: User;
    artists: Artist[];
    artistBookings: ArtistBooking[];
    payoutRequests: PayoutRequest[];
    onBookingResponse: (bookingId: string, response: 'confirm' | 'reject') => void;
    onRequestPayout: (artistId: string, amount: number) => void;
    globalSettings: GlobalSettings;
}

const StatCard: React.FC<{ title: string; value: string | number; description?: string; }> = ({ title, value, description }) => (
    <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-slate-400 uppercase">{title}</h4>
        <p className="text-3xl font-bold text-red-500 mt-2">{value}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
);

const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ user, artists, artistBookings, payoutRequests, onBookingResponse, onRequestPayout, globalSettings }) => {
    
    const artistProfile = useMemo(() => {
        return artists.find(a => a.userEmail === user.email);
    }, [artists, user.email]);

    const bookingsForArtist = useMemo(() => {
        if (!artistProfile) return [];
        return artistBookings.filter(b => b.artistId === artistProfile.id)
            .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [artistBookings, artistProfile]);

    const { totalEarnings, netEarnings, availableForPayout } = useMemo(() => {
        if (!artistProfile) return { totalEarnings: 0, netEarnings: 0, availableForPayout: 0 };

        const totalEarnings = bookingsForArtist
            .filter(b => b.status === 'paid')
            .reduce((sum, b) => sum + b.proposedFee, 0);

        const platformFee = totalEarnings * (globalSettings.platformFeeRate / 100);
        const netEarnings = totalEarnings - platformFee;

        const totalPaidOut = payoutRequests
            .filter(p => p.requesterType === 'artist' && p.requesterId === artistProfile.id && p.status === 'Completed')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingPayouts = payoutRequests
            .filter(p => p.requesterType === 'artist' && p.requesterId === artistProfile.id && p.status === 'Pending')
            .reduce((sum, p) => sum + p.amount, 0);

        const availableForPayout = netEarnings - totalPaidOut - pendingPayouts;

        return { totalEarnings, netEarnings, availableForPayout };
    }, [bookingsForArtist, payoutRequests, artistProfile, globalSettings]);

    const { pending, confirmed, past } = useMemo(() => {
        return {
            pending: bookingsForArtist.filter(b => b.status === 'pending_artist_approval'),
            confirmed: bookingsForArtist.filter(b => b.status === 'confirmed_by_artist' || b.status === 'paid'),
            past: bookingsForArtist.filter(b => b.status === 'rejected_by_artist' || b.status === 'cancelled_by_client'),
        }
    }, [bookingsForArtist]);

    if (!artistProfile) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-white">Artist Profile Not Found</h2>
                <p className="text-slate-400 mt-2">Please contact an administrator to set up your artist profile.</p>
            </div>
        );
    }
    
    const getStatusChip = (status: ArtistBooking['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-500/20 text-green-300';
            case 'confirmed_by_artist': return 'bg-cyan-500/20 text-cyan-300';
            case 'pending_artist_approval': return 'bg-yellow-500/20 text-yellow-300';
            case 'rejected_by_artist': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };
    
    const statusText = {
        paid: 'Paid',
        confirmed_by_artist: 'Awaiting Payment',
        pending_artist_approval: 'Pending',
        rejected_by_artist: 'Rejected'
    }

    const BookingTable: React.FC<{
        title: string;
        bookings: ArtistBooking[];
        showActions?: boolean;
    }> = ({ title, bookings, showActions }) => (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-black/20">
                        <tr>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Event Date</th>
                            <th className="px-4 py-3">Venue</th>
                            <th className="px-4 py-3">Proposed Fee</th>
                            <th className="px-4 py-3">Status</th>
                            {showActions && <th className="px-4 py-3 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length > 0 ? bookings.map(booking => (
                            <tr key={booking.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium text-white">{booking.clientId}</td>
                                <td className="px-4 py-3">{new Date(booking.eventDate.replace(/-/g, '/')).toLocaleDateString('en-IN')}</td>
                                <td className="px-4 py-3">{booking.eventVenue}</td>
                                <td className="px-4 py-3 font-semibold">₹{booking.proposedFee.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusChip(booking.status)}`}>
                                        {statusText[booking.status as keyof typeof statusText] || booking.status}
                                    </span>
                                </td>
                                {showActions && (
                                     <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => onBookingResponse(booking.id, 'confirm')} className="font-semibold text-white bg-green-600 px-3 py-1.5 rounded-lg text-xs hover:bg-green-700">Approve</button>
                                        <button onClick={() => onBookingResponse(booking.id, 'reject')} className="font-semibold text-white bg-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-700">Reject</button>
                                    </td>
                                )}
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={showActions ? 6 : 5} className="text-center py-8 text-slate-500">No bookings in this category.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-white tracking-tight">Artist Dashboard</h2>
                <p className="text-slate-400 mt-1">Welcome, <span className="font-semibold text-red-500">{artistProfile.name}</span></p>
            </div>

            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                 <h3 className="text-2xl font-bold text-white mb-4">Financial Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} description="Gross income from all paid bookings." />
                    <StatCard title="Net Earnings" value={`₹${netEarnings.toLocaleString('en-IN')}`} description={`After ${globalSettings.platformFeeRate}% platform fee.`} />
                    <StatCard title="Available for Payout" value={`₹${Math.max(0, availableForPayout).toLocaleString('en-IN')}`} />
                     <div className="bg-zinc-900 border border-slate-700 rounded-xl p-6 flex flex-col justify-center items-center">
                        <button 
                            onClick={() => onRequestPayout(artistProfile.id, availableForPayout)}
                            disabled={availableForPayout <= 0}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                           Request Payout
                        </button>
                        <p className="text-xs text-slate-500 mt-2 text-center">Requests payout for the entire available balance.</p>
                    </div>
                </div>
            </div>

            <BookingTable title="New Booking Requests" bookings={pending} showActions />
            <BookingTable title="Confirmed & Upcoming Bookings" bookings={confirmed} />
            <BookingTable title="Booking History" bookings={past} />
        </div>
    );
};

export default ArtistDashboard;