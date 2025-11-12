import React, { useMemo, memo } from 'react';
import { Theatre, User, Event, EventBooking, PayoutRequest } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; }> = memo(({ title, value }) => (
    <div className="bg-zinc-900/50 border border-slate-700 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase">{title}</h4>
        <p className="text-2xl font-bold text-red-500 mt-1">{value}</p>
    </div>
));

const DetailItem: React.FC<{ label: string; value?: string; }> = memo(({ label, value }) => (
    <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-base text-white font-medium">{value || '-'}</p>
    </div>
));

interface AdminTheatreDetailProps {
    theatre: Theatre;
    users: User[];
    events: Event[];
    bookings: EventBooking[];
    payoutRequests: PayoutRequest[];
    onProcessPayout: (requestId: string) => void;
    onBack: () => void;
}

const AdminTheatreDetail: React.FC<AdminTheatreDetailProps> = ({ theatre, users, events, bookings, payoutRequests, onProcessPayout, onBack }) => {

    const manager = useMemo(() => users.find(u => u.role === 'theatre_manager' && u.theatreId === theatre.id), [users, theatre.id]);
    const payoutRequest = useMemo(() => payoutRequests.find(p => p.requesterId === theatre.id), [payoutRequests, theatre.id]);

    const { theatreBookings, theatreEvents } = useMemo(() => {
        const theatreEvents = events.filter(event => event.showtimes?.some(st => st.theatreId === theatre.id));
        const theatreEventIds = new Set(theatreEvents.map(e => e.id));
        
        const theatreBookings = bookings.filter(booking => 
            theatreEventIds.has(booking.eventId) &&
            events.find(e => e.id === booking.eventId)?.showtimes?.some(st => st.id === booking.showtimeId && st.theatreId === theatre.id)
        );

        return { theatreBookings, theatreEvents };
    }, [bookings, events, theatre.id]);
    
    const analytics = useMemo(() => {
        const totalRevenue = theatreBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const totalTicketsSold = theatreBookings.reduce((sum, b) => sum + b.bookedTickets.reduce((qty, t) => qty + (t.quantity || 1), 0), 0);
        return { totalRevenue, totalTicketsSold };
    }, [theatreBookings]);

    const getStatusChip = (status?: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-300';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'Rejected': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Theatre List
                    </button>
                    <h2 className="text-3xl font-bold text-white">{theatre.name}</h2>
                    <p className="text-slate-400">{theatre.city}</p>
                </div>
                 <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${getStatusChip(payoutRequest?.status)}`}>
                    Payout: {payoutRequest?.status || 'No Request'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-black/20 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-semibold text-white mb-4">Manager Details</h4>
                        {manager ? (
                            <div className="space-y-3">
                                <DetailItem label="Name" value={manager.organizerName} />
                                <DetailItem label="Email" value={manager.email} />
                                <DetailItem label="Phone" value={manager.phone} />
                            </div>
                        ) : <p className="text-sm text-slate-400">No manager assigned.</p>}
                    </div>
                     <div className="bg-black/20 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-semibold text-white mb-4">Banking Details</h4>
                        {manager ? (
                            <div className="space-y-3">
                                <DetailItem label="Bank Name" value={manager.bankName} />
                                <DetailItem label="Account Number" value={manager.accountNumber} />
                                <DetailItem label="IFSC Code" value={manager.ifscCode} />
                            </div>
                        ) : <p className="text-sm text-slate-400">No banking details.</p>}
                    </div>
                     <div className="bg-black/20 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-semibold text-white mb-4">Payout Information</h4>
                        {payoutRequest ? (
                             <div className="space-y-3">
                                <DetailItem label="Requested Amount" value={`₹${payoutRequest.amount.toLocaleString('en-IN')}`} />
                                {payoutRequest.status === 'Pending' && (
                                     <button onClick={() => onProcessPayout(payoutRequest.id)} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg">Process Payout</button>
                                )}
                             </div>
                        ) : <p className="text-sm text-slate-400">No payout requested.</p>}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                     <div>
                        <h4 className="font-semibold text-white mb-4">Key Metrics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard title="Total Revenue" value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`} />
                            <StatCard title="Tickets Sold" value={analytics.totalTicketsSold.toLocaleString('en-IN')} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Currently Showing</h4>
                         <div className="overflow-x-auto max-h-80 bg-black/20 rounded-lg border border-slate-700">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                    <tr><th className="px-4 py-2">Movie Title</th><th className="px-4 py-2">Director</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {theatreEvents.map(event => (<tr key={event.id}><td className="px-4 py-2">{event.title}</td><td className="px-4 py-2">{event.director}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminTheatreDetail;