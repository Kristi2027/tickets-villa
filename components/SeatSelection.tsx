import React, { useState, useMemo, memo } from 'react';
// FIX: Add GuestDetails to the import from types.
import { Event, Showtime, SeatType, SeatCategory, SeatSaleStatus, EventBooking, BookedTicket, Theatre, User, GuestDetails, GlobalSettings } from '../types.ts';
import { initiateGooglePayCheckout } from '../services/paymentService';
import PaymentModal from './PaymentModal';

interface SeatSelectionProps {
    event: Event;
    showtime: Showtime;
    theatre: Theatre;
    date: string;
    user: User | null;
    onBack: () => void;
    onConfirmBoxOfficeSale?: (booking: EventBooking, showDate: string) => void;
    // FIX: The onBookingSuccess prop should accept an optional guestDetails parameter.
    onBookingSuccess: (bookingData: Omit<EventBooking, 'id' | 'paymentId'>, guestDetails?: GuestDetails) => void;
    globalSettings: GlobalSettings;
}

const Seat: React.FC<{
    seatType: SeatType;
    category?: SeatCategory;
    status: SeatSaleStatus;
    seatNumberLabel: string;
    isSelected: boolean;
    onClick: () => void;
}> = memo(({ seatType, category, status, seatNumberLabel, isSelected, onClick }) => {
    const getSeatStyles = () => {
        if (status !== 'available') return 'bg-slate-700 border-slate-600 cursor-not-allowed';
        if (isSelected) return `bg-red-600 border-red-500 ring-2 ring-offset-2 ring-offset-zinc-950 ring-red-500`;
        return `${category?.color.replace('bg-', 'bg-green-900/50 border-')} cursor-pointer hover:bg-green-500`;
    };

    const isNonInteractive = !['standard', 'premium', 'recliner', 'wheelchair'].includes(seatType);
    if (isNonInteractive || !category) return <div className={`w-full aspect-square rounded-md ${category?.color || ''}`} />;


    return (
        <button
            onClick={onClick}
            disabled={status !== 'available'}
            className={`w-full aspect-square rounded-md transition-all duration-200 flex items-center justify-center ${getSeatStyles()}`}
            title={`Seat ${seatNumberLabel} - ${category.name} (₹${category.price})`}
        >
            <span className="font-bold text-white/90 text-[8px] sm:text-[9px] lg:text-[10px]" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                {seatNumberLabel.replace(/^[A-Z]+/, '')}
            </span>
        </button>
    );
});

const SeatSelection: React.FC<SeatSelectionProps> = ({ event, showtime, theatre, date, user, onBack, onConfirmBoxOfficeSale, onBookingSuccess, globalSettings }) => {
    const [currentShowtime, setCurrentShowtime] = useState<Showtime>(showtime);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // "r-c" format, e.g., "0-1"
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pendingBookingData, setPendingBookingData] = useState<any>(null);
    
    const screen = useMemo(() => theatre.screens.find(s => s.id === currentShowtime.screenId), [theatre, currentShowtime]);

    const handleShowtimeChange = (newShowtime: Showtime) => {
        setCurrentShowtime(newShowtime);
        setSelectedSeats([]);
    };

    const todaysShowtimes = useMemo(() => {
        const screenIdForThisView = showtime.screenId;
        return event.showtimes?.filter(st => st.theatreId === theatre.id && st.screenId === screenIdForThisView).sort((a,b) => a.time.localeCompare(b.time)) || [];
    }, [event.showtimes, theatre.id, showtime.screenId]);
    
    if (!screen || !screen.seatLayout) return <div>Error: Screen or seat layout not found for this showtime.</div>;

    const { seatLayout } = screen;
    const categoryMap = useMemo(() => new Map(seatLayout.categories.map(cat => [cat.id, cat])), [seatLayout.categories]);
    const rowStartIndex = seatLayout.rowStartIndex ?? 0;
    const colStartIndex = seatLayout.colStartIndex ?? 1;

    const handleSeatClick = (r: number, c: number) => {
        const seatKey = `${r}-${c}`;
        setSelectedSeats(prev => prev.includes(seatKey) ? prev.filter(s => s !== seatKey) : [...prev, seatKey]);
    };

    const { totalAmount, bookedTickets } = useMemo(() => {
        const tickets: BookedTicket[] = [];
        selectedSeats.forEach(seatKey => {
            const [r, c] = seatKey.split('-').map(Number);
            const seatType = seatLayout.grid[r][c];
            const category = categoryMap.get(seatType);
            if (!category || category.price <= 0) return;
            
            let seatCounter = 0;
            for(let i=0; i<=c; i++){
                const type = seatLayout.grid[r][i];
                if (!['aisle', 'empty', 'stage-left', 'stage-right', 'ramp'].includes(type)) {
                    seatCounter++;
                }
            }
            const seatLabel = `${String.fromCharCode(65 + r + rowStartIndex)}${seatCounter + (seatLayout.colStartIndex ?? 1) - 1}`;
            
            tickets.push({ name: category.name, price: category.price, quantity: 1, seat: seatLabel });
        });
        const total = tickets.reduce((acc, ticket) => acc + ticket.price, 0);
        return { totalAmount: total, bookedTickets: tickets };
    }, [selectedSeats, seatLayout, categoryMap, rowStartIndex]);

    const handleConfirmBooking = () => {
        if (totalAmount <= 0) return;
        if (!user) { alert("Authentication error. Please log in again."); return; }
        
        const seatKeys = selectedSeats; // "r-c" format keys

        if (onConfirmBoxOfficeSale) { // Box Office flow
            const bookingForPOS: EventBooking = { id: '', paymentId: '', eventId: event.id, bookingDate: new Date().toISOString(), userEmail: user.email, bookedTickets, totalPrice: totalAmount, showtimeId: currentShowtime.id, seats: seatKeys, buyerCity: theatre.city };
            onConfirmBoxOfficeSale(bookingForPOS, date);
            return;
        }

        const bookingData = {
            eventId: event.id,
            bookingDate: new Date().toISOString(),
            userEmail: user.email,
            bookedTickets,
            totalPrice: totalAmount,
            showtimeId: currentShowtime.id,
            showDate: date, // Add showDate for online bookings
            seats: seatKeys,
            saleType: 'online' as const,
            paymentMethod: 'online' as const,
            syncStatus: 'synced' as const,
            buyerCity: theatre.city,
        };
        
        const pendingBooking = {
            totalAmount: totalAmount,
            transactionLabel: `Tickets for ${event.title}`,
            bookingData,
        };
        
        setPendingBookingData(pendingBooking);
        setIsPaymentModalOpen(true);
    };

    const handleGooglePaySelect = () => {
        if (pendingBookingData) {
            initiateGooglePayCheckout(pendingBookingData, onBookingSuccess);
            setIsPaymentModalOpen(false);
        }
    };

    const handleUpiSelect = () => {
        if (pendingBookingData) {
            // FIX: Pass guestDetails (which will be undefined here, but matches the prop signature).
            onBookingSuccess(pendingBookingData.bookingData, pendingBookingData.guestDetails);
            setIsPaymentModalOpen(false);
        }
    };
    
    return (
        <div className="max-w-screen-lg mx-auto bg-zinc-950 flex flex-col h-full">
             <div className="bg-zinc-900 p-4 sticky top-[65px] z-20 shadow-lg border-b border-slate-800">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-slate-300 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-white">{event.title}</h1>
                            <p className="text-xs text-slate-400">{theatre.name} | {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>
                    {selectedSeats.length > 0 && (
                        <div className="bg-red-600/10 border border-red-600 text-red-400 text-sm font-bold px-3 py-1.5 rounded-md">
                            {selectedSeats.length} Tickets
                        </div>
                    )}
                </div>
                {event.category === 'Movies' && (
                     <div className="flex gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800 -mx-4 px-4">
                        {todaysShowtimes.map(st => (
                             <button key={st.id} onClick={() => handleShowtimeChange(st)} disabled={st.availability === 'sold_out'}
                                className={`px-4 py-1.5 text-sm font-semibold rounded border transition-colors whitespace-nowrap ${st.id === currentShowtime.id ? 'bg-red-600 text-white border-red-500' : 'text-slate-300 border-slate-700/50 hover:bg-slate-700'}`}
                             >
                                {st.time}
                            </button>
                        ))}
                     </div>
                )}
            </div>

            <div className="flex-grow p-4 overflow-auto pb-28">
                <div className="flex flex-col items-center gap-y-4 min-w-[600px] my-8">
                    <div className="w-4/5 h-8 mb-8 flex items-center justify-center">
                       <p className="text-white font-bold text-sm tracking-widest">All eyes this way</p>
                    </div>

                    <div className="flex justify-center">
                        <div className="inline-grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: `auto repeat(${seatLayout.cols}, min-content) auto` }}>
                             {/* Column headers */}
                            <div /> {/* Top-left spacer */}
                            {Array.from({ length: seatLayout.cols }).map((_, c) => (
                                <div key={`col-${c}`} className="w-6 h-6 sm:w-7 lg:w-8 flex items-center justify-center text-xs font-mono text-slate-500">
                                    {c + colStartIndex}
                                </div>
                            ))}
                            <div /> {/* Top-right spacer */}

                            {/* Rows and Seats */}
                            {seatLayout.grid.map((row, r) => {
                                let seatCounter = 0;
                                return (
                                <React.Fragment key={`row-${r}`}>
                                    <div className="h-6 sm:h-7 lg:h-8 flex items-center justify-end text-xs font-mono text-slate-500 pr-2">
                                        {String.fromCharCode(65 + r + rowStartIndex)}
                                    </div>
                                    {row.map((seatType, c) => {
                                        const isBookable = !['aisle', 'empty', 'stage-left', 'stage-right', 'ramp'].includes(seatType);
                                        let seatNumberLabel: string = '';
                                        if (isBookable) {
                                            seatCounter++;
                                            seatNumberLabel = `${String.fromCharCode(65 + r + rowStartIndex)}${seatCounter + colStartIndex - 1}`;
                                        } else {
                                             seatNumberLabel = `${String.fromCharCode(65 + r + rowStartIndex)}${c + colStartIndex}`;
                                        }

                                        return (
                                        <div key={`${r}-${c}`} className="w-6 h-6 sm:w-7 lg:w-8">
                                            <Seat
                                                seatType={seatType}
                                                category={categoryMap.get(seatType)}
                                                status={currentShowtime.seatStatus[r][c]}
                                                seatNumberLabel={seatNumberLabel}
                                                isSelected={selectedSeats.includes(`${r}-${c}`)}
                                                onClick={() => handleSeatClick(r, c)}
                                            />
                                        </div>
                                    )})}
                                    <div className="h-6 sm:h-7 lg:h-8 flex items-center justify-start text-xs font-mono text-slate-500 pl-2">
                                        {String.fromCharCode(65 + r + rowStartIndex)}
                                    </div>
                                </React.Fragment>
                            )})}
                        </div>
                    </div>
                </div>
            </div>

            {selectedSeats.length > 0 && (
                 <div className="sticky bottom-0 bg-zinc-900 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-slate-800 mt-auto">
                     <div className="max-w-screen-lg mx-auto flex justify-between items-center">
                         <div>
                            <span className="text-2xl font-bold text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                            <p className="text-xs text-slate-400">Total Amount</p>
                         </div>
                         <button 
                            onClick={handleConfirmBooking}
                            className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:bg-red-700"
                        >
                            Book Tickets
                        </button>
                     </div>
                 </div>
            )}
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onGooglePaySelect={handleGooglePaySelect} onUpiSelect={handleUpiSelect} totalAmount={pendingBookingData?.totalAmount || 0} settings={globalSettings} />
        </div>
    );
};

export default SeatSelection;