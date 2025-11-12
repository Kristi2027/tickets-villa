import React from 'react';
import { Event } from '../types';

interface EventQuickViewModalProps {
    event: Event | null;
    onClose: () => void;
    onBookNow: (event: Event) => void;
}

const EventQuickViewModal: React.FC<EventQuickViewModalProps> = ({ event, onClose, onBookNow }) => {
    if (!event) return null;

    const handleBookNowClick = () => {
        onBookNow(event);
        onClose(); // Close the modal after clicking
    };
    
    const minPrice = event.tickets.length > 0 ? Math.min(...event.tickets.map(t => t.price)) : 0;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-slate-800 rounded-2xl w-full sm:max-w-2xl shadow-2xl shadow-red-500/10 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative flex-shrink-0">
                    <img src={event.bannerImage} alt={event.title} loading="lazy" className="w-full h-48 sm:h-64 object-cover rounded-t-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-all z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                    <p className="text-sm text-red-500 font-semibold">{event.category.toUpperCase()}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">{event.title}</h2>
                    <div className="text-slate-400 text-sm mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>{event.venue}, {event.city}</span>
                    </div>
                    <p className="text-slate-300 mt-4 text-base leading-relaxed">{event.description}</p>
                </div>
                 <div className="flex-shrink-0 mt-auto p-4 sm:p-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-zinc-900 rounded-b-2xl">
                    <div className="text-center sm:text-left w-full sm:w-auto">
                         <p className="text-sm text-slate-400">Tickets starting from</p>
                         <p className="text-2xl font-bold text-white">₹{minPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                        onClick={handleBookNowClick}
                        className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:bg-red-700"
                    >
                        View Details & Book
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventQuickViewModal;