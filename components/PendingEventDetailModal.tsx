import React, { useMemo } from 'react';
import { Event } from '../types';

interface PendingEventDetailModalProps {
    event: Event;
    onApprove: (eventId: string) => void;
    onReject: (eventId: string) => void;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-base text-white font-medium">{value || '-'}</p>
    </div>
);

const PendingEventDetailModal: React.FC<PendingEventDetailModalProps> = ({ event, onApprove, onReject, onClose }) => {
    
    const seatInfo = useMemo(() => {
        if (!event.seatStatus) {
            return null;
        }

        let totalSeats = 0;
        let availableSeats = 0;

        for (const row of event.seatStatus) {
            for (const seat of row) {
                if (seat !== 'locked') {
                    totalSeats++;
                    if (seat === 'available') {
                        availableSeats++;
                    }
                }
            }
        }

        return { totalSeats, availableSeats };
    }, [event.seatStatus]);

    const handleApprove = () => {
        if (window.confirm("Are you sure you want to approve this event? It will become publicly visible.")) {
            onApprove(event.id);
        }
    };

    const handleReject = () => {
         if (window.confirm("Are you sure you want to reject this event? This action cannot be undone.")) {
            onReject(event.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div
                className="bg-zinc-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl shadow-red-500/10 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative flex-shrink-0">
                    <img src={event.bannerImage} alt={event.title} loading="lazy" className="w-full h-64 object-cover rounded-t-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-all z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div>
                        <p className="text-sm text-red-500 font-semibold">{event.category.toUpperCase()}</p>
                        <h2 className="text-3xl font-bold text-white mt-1">{event.title}</h2>
                        <p className="text-slate-300 mt-4">{event.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-slate-800 py-4">
                        <DetailItem label="Date" value={new Date(event.date).toLocaleDateString('en-IN')} />
                        <DetailItem label="Time" value={`${event.startTime || 'N/A'} - ${event.endTime || 'N/A'}`} />
                        <DetailItem label="City" value={event.city} />
                        <DetailItem label="Venue" value={event.venue} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Ticket Tiers</h3>
                        {event.tickets.length > 0 ? (
                            <div className="space-y-2">
                                {event.tickets.map((ticket, index) => (
                                    <div key={index} className="flex justify-between items-center bg-black/20 p-3 rounded-md">
                                        <span className="font-medium text-slate-300">{ticket.name}</span>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">₹{ticket.price.toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-slate-400">{ticket.quantityAvailable} available</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : seatInfo ? (
                             <div className="flex justify-between items-center bg-black/20 p-3 rounded-md">
                                <span className="font-medium text-slate-300">Seating Capacity</span>
                                <div className="text-right">
                                    <p className="font-semibold text-white">{seatInfo.availableSeats} / {seatInfo.totalSeats}</p>
                                    <p className="text-xs text-slate-400">Seats Available</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400">This is a seated event or has no ticket types defined yet.</p>
                        )}
                    </div>
                     <DetailItem label="Submitted By" value={event.createdBy} />
                </div>
                 
                <div className="flex-shrink-0 mt-auto p-6 border-t border-slate-800 flex justify-end items-center gap-4 bg-zinc-900 rounded-b-2xl">
                    <button onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">
                        Close
                    </button>
                    <button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
                        Reject
                    </button>
                    <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingEventDetailModal;