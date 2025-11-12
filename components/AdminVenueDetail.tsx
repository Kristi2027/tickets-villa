import React, { useMemo, memo } from 'react';
import { Venue, VenueBooking } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; }> = memo(({ title, value }) => (
    <div className="bg-zinc-900/50 border border-slate-700 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase">{title}</h4>
        <p className="text-2xl font-bold text-red-500 mt-1">{value}</p>
    </div>
));

interface AdminVenueDetailProps {
    venue: Venue;
    bookings: VenueBooking[];
    onBack: () => void;
}

const AdminVenueDetail: React.FC<AdminVenueDetailProps> = ({ venue, bookings, onBack }) => {

    const venueBookings = useMemo(() => bookings.filter(b => b.venueId === venue.id), [bookings, venue.id]);

    const analytics = useMemo(() => {
        const totalRevenue = venueBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const totalBookings = venueBookings.length;
        return { totalRevenue, totalBookings };
    }, [venueBookings]);


    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Venue List
                    </button>
                    <h2 className="text-3xl font-bold text-white">{venue.name}</h2>
                    <p className="text-slate-400">{venue.address}, {venue.city}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-white mb-4">Key Metrics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard title="Total Revenue" value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`} />
                        <StatCard title="Total Bookings" value={analytics.totalBookings.toLocaleString('en-IN')} />
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-4">Recent Bookings</h4>
                     <div className="overflow-x-auto max-h-80 bg-black/20 rounded-lg border border-slate-700">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Booking ID</th>
                                    <th className="px-4 py-2">Booked For</th>
                                    <th className="px-4 py-2">User Email</th>
                                    <th className="px-4 py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {venueBookings.slice(0, 20).map(booking => (
                                    <tr key={booking.id}>
                                        <td className="px-4 py-2 font-mono text-xs">{booking.id.split('-')[1]}</td>
                                        <td className="px-4 py-2">{new Date(booking.bookedDate).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 py-2">{booking.userEmail}</td>
                                        <td className="px-4 py-2 font-semibold">₹{booking.totalPrice.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                                {venueBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-slate-500">No bookings found for this venue.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVenueDetail;