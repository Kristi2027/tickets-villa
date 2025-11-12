import React from 'react';
import { PayoutRequest, Event, Theatre, EventBooking, Artist, GlobalSettings } from '../types.ts';

interface PayoutManagementProps {
    payoutRequests: PayoutRequest[];
    events: Event[];
    theatres: Theatre[];
    artists: Artist[];
    bookings: EventBooking[];
    onProcessPayout: (requestId: string) => void;
    globalSettings: GlobalSettings;
}

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-slate-400 uppercase">{title}</h4>
        <p className="text-3xl font-bold text-red-500 mt-2">{value}</p>
    </div>
);


const PayoutManagement: React.FC<PayoutManagementProps> = ({ payoutRequests, events, theatres, artists, bookings, onProcessPayout, globalSettings }) => {

    const pendingRequests = payoutRequests.filter(p => p.status === 'Pending');
    const processedRequests = payoutRequests.filter(p => p.status !== 'Pending');
    
    // Financial calculations
    const totalGrossRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const platformFee = totalGrossRevenue * (globalSettings.platformFeeRate / 100);
    const totalPaidOut = processedRequests
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0);


    const getRequesterName = (request: PayoutRequest) => {
        if (request.requesterType === 'event') {
            return events.find(e => e.id === request.requesterId)?.title || 'Unknown Event';
        }
        if (request.requesterType === 'theatre') {
            return theatres.find(t => t.id === request.requesterId)?.name || 'Unknown Theatre';
        }
        if (request.requesterType === 'artist') {
            return artists.find(a => a.id === request.requesterId)?.name || 'Unknown Artist';
        }
        return 'Unknown';
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-500/20 text-green-300';
            case 'Pending':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'Rejected':
                return 'bg-red-500/20 text-red-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-6">Financial Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Platform Revenue" value={`₹${totalGrossRevenue.toLocaleString('en-IN')}`} />
                    <StatCard title="Platform Fees Collected" value={`₹${platformFee.toLocaleString('en-IN')}`} />
                    <StatCard title="Total Paid Out to Partners" value={`₹${totalPaidOut.toLocaleString('en-IN')}`} />
                </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Pending Payout Requests</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Partner Name</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Request Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.length > 0 ? pendingRequests.map(request => (
                                <tr key={request.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{getRequesterName(request)}</td>
                                    <td className="px-4 py-3 font-semibold">₹{request.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3">{new Date(request.requestDate).toLocaleDateString('en-IN')}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => onProcessPayout(request.id)}
                                            className="font-semibold text-white bg-green-600 px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition-colors">
                                            Process Payment
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-400">No pending requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout History */}
             <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Payout History</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Partner Name</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Processed Date</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedRequests.length > 0 ? processedRequests.map(request => (
                                <tr key={request.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{getRequesterName(request)}</td>
                                    <td className="px-4 py-3 font-semibold">₹{request.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3">{request.processedDate ? new Date(request.processedDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusChip(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-400">No processed payouts yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayoutManagement;