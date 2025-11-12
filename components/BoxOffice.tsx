import React, { useState, useEffect, useMemo } from 'react';
import { Event, Theatre, EventBooking, Showtime, BookedTicket, User, GuestDetails, DiscountCode, GlobalSettings } from '../types.ts';
import MovieShowtimeSelector from './MovieShowtimeSelector';
import SeatSelection from './SeatSelection';
import Modal from './Modal';

interface BoxOfficeProps {
    events: Event[];
    theatres: Theatre[];
    bookings: EventBooking[];
    onAddBooking: (booking: Omit<EventBooking, 'id' | 'paymentId'>) => EventBooking;
    user: User | null;
    globalSettings: GlobalSettings;
}

type SaleStep = 'select_event' | 'select_showtime' | 'select_seats_or_tickets' | 'payment';

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isActive ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'
        }`}
    >
        {children}
    </button>
);

// Helper to generate QR code for tickets
const getQrCodeAsBase64 = (value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(value)}`;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = (error) => reject(error);
        img.src = qrCodeUrl;
    });
};


const BoxOffice: React.FC<BoxOfficeProps> = ({ events, theatres, bookings, onAddBooking, user, globalSettings }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingBookings, setPendingBookings] = useState<Omit<EventBooking, 'id' | 'paymentId'>[]>([]);
    const [view, setView] = useState<'dashboard' | 'sale'>('dashboard');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const allowedModes = useMemo<('events' | 'movies')[]>(() => {
        if (!user) return [];
        switch (user.role) {
            case 'admin':
                return ['events', 'movies'];
            case 'theatre_manager':
                return ['movies'];
            case 'organizer':
                return ['events'];
            default:
                return [];
        }
    }, [user]);

    const [saleMode, setSaleMode] = useState<'events' | 'movies'>(allowedModes[0] || 'events');
    
    // State for the sales flow
    const [saleStep, setSaleStep] = useState<SaleStep>('select_event');
    const [cart, setCart] = useState<BookedTicket[]>([]);
    const [seatSelectionData, setSeatSelectionData] = useState<{event: Event, showtime: Showtime, theatre: Theatre, date: string} | null>(null);
    const [seatedBookingDetails, setSeatedBookingDetails] = useState<{ showtimeId?: string; seats?: string[], showDate?: string; } | null>(null);
    const [saleCustomerDetails, setSaleCustomerDetails] = useState<GuestDetails | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; type: 'percentage' | 'fixed', value: number } | null>(null);
    const [saleSuccessData, setSaleSuccessData] = useState<EventBooking | null>(null);
    // FIX: Moved state to the component's top level to prevent it from resetting on re-renders.
    const [showCustomerForm, setShowCustomerForm] = useState(false);

    useEffect(() => {
        // Ensure saleMode is always valid for the current user
        if (allowedModes.length > 0 && !allowedModes.includes(saleMode)) {
            setSaleMode(allowedModes[0]);
        }
    }, [allowedModes, saleMode]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        const storedPending = localStorage.getItem('pendingBoxOfficeBookings');
        if (storedPending) {
            setPendingBookings(JSON.parse(storedPending));
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    const cartTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [cart]);

    const handleSync = () => {
        if (!isOnline) {
            alert("You are offline. Please connect to the internet to sync.");
            return;
        }
        pendingBookings.forEach(booking => onAddBooking({ ...booking, syncStatus: 'synced' }));
        setPendingBookings([]);
        localStorage.removeItem('pendingBoxOfficeBookings');
        alert(`${pendingBookings.length} pending sales have been synced successfully!`);
    };
    
    const handleStartSale = (event: Event) => {
        // Clean up previous state first
        setCart([]);
        setSeatSelectionData(null);
        setSeatedBookingDetails(null);
        setSaleCustomerDetails(null);
        setDiscountCode('');
        setAppliedDiscount(null);
        setSaleSuccessData(null);
        setShowCustomerForm(false);

        setSelectedEvent(event);
        setView('sale');
        if (event.category === 'Movies') {
            setSaleStep('select_showtime');
        } else if (event.theatreId && event.screenId && event.seatStatus) {
            const theatre = theatres.find(t => t.id === event.theatreId);
            if (theatre) {
                const syntheticShowtime: Showtime = {
                    id: `evt-showtime-${event.id}`,
                    theatreId: event.theatreId,
                    screenId: event.screenId,
                    time: event.startTime || new Date(event.date).toLocaleTimeString(),
                    availability: 'available',
                    seatStatus: event.seatStatus,
                };
                setSeatSelectionData({ event, showtime: syntheticShowtime, theatre, date: event.date });
                setSaleStep('select_seats_or_tickets');
            } else {
                alert("Error: Theatre data for this event is missing.");
                handleResetSale();
            }
        } else {
            setSaleStep('select_seats_or_tickets');
        }
    };
    
    const handleResetSale = () => {
        setView('dashboard');
        setSelectedEvent(null);
        setSaleStep('select_event');
        setCart([]);
        setSeatSelectionData(null);
        setSeatedBookingDetails(null);
        setSaleCustomerDetails(null);
        setDiscountCode('');
        setAppliedDiscount(null);
        setSaleSuccessData(null);
        setShowCustomerForm(false);
    };
    
    const handleConfirmSale = (paymentMethod: 'cash' | 'card') => {
        if (!selectedEvent || cart.length === 0) return;
        // FIX: Ensure the final total does not result in a negative number.
        const finalTotal = Math.max(0, cartTotal - (appliedDiscount?.amount || 0));
        
        const newBooking: Omit<EventBooking, 'id' | 'paymentId'> = {
            eventId: selectedEvent.id,
            bookingDate: new Date().toISOString(),
            userEmail: saleCustomerDetails?.email || `boxoffice-sale-${Date.now()}`,
            bookedTickets: cart,
            totalPrice: finalTotal,
            buyerCity: selectedEvent.city,
            saleType: 'offline',
            paymentMethod: paymentMethod,
            syncStatus: isOnline ? 'synced' : 'pending',
            showtimeId: seatedBookingDetails?.showtimeId,
            showDate: seatedBookingDetails?.showDate,
            seats: seatedBookingDetails?.seats,
            guestDetails: saleCustomerDetails || undefined,
            discountApplied: appliedDiscount ? { code: appliedDiscount.code, amount: appliedDiscount.amount } : undefined,
        };

        if (isOnline) {
            const syncedBooking = onAddBooking(newBooking);
            setSaleSuccessData(syncedBooking);
        } else {
            const updatedPending = [...pendingBookings, newBooking];
            setPendingBookings(updatedPending);
            localStorage.setItem('pendingBoxOfficeBookings', JSON.stringify(updatedPending));
            const offlineBooking: EventBooking = { ...newBooking, id: `offline-${Date.now()}`, paymentId: 'N/A' };
            setSaleSuccessData(offlineBooking);
        }
    };

    const handleSeatSelectionBooking = (booking: EventBooking, showDate: string) => {
        setCart(booking.bookedTickets);
        setSeatedBookingDetails({ 
            showtimeId: booking.showtimeId, 
            seats: booking.seats,
            showDate: showDate,
        });
        setSaleStep('payment');
    };

    const handleTicketQuantityChange = (ticketName: string, quantity: number, price: number) => {
        setCart(prevCart => {
            const newCart = prevCart.filter(t => t.name !== ticketName);
            if (quantity > 0) {
                 newCart.push({ name: ticketName, price, quantity });
            }
            return newCart;
        });
    };
    
    const handleApplyDiscount = () => {
        if (!selectedEvent || !discountCode) return;
        const code = selectedEvent.discountCodes?.find(c => c.code.toLowerCase() === discountCode.toLowerCase());
        if (code) {
            let discountAmount = 0;
            if (code.type === 'fixed') {
                discountAmount = code.value;
            } else { // percentage
                discountAmount = (cartTotal * code.value) / 100;
            }
            setAppliedDiscount({ code: code.code, amount: discountAmount, type: code.type, value: code.value });
            alert(`Discount "${code.code}" applied!`);
        } else {
            alert('Invalid or expired discount code.');
            setAppliedDiscount(null);
        }
    };
    
    const printTicket = async (booking: EventBooking) => {
        const event = events.find(e => e.id === booking.eventId);
        if (!event) return;

        const unrolledTickets: BookedTicket[] = [];
        booking.bookedTickets.forEach(ticket => {
            if (ticket.quantity > 1 && !ticket.seat) {
                for (let i = 0; i < ticket.quantity; i++) unrolledTickets.push({ ...ticket, quantity: 1 });
            } else {
                unrolledTickets.push(ticket);
            }
        });
        
        const ticketIds = unrolledTickets.map((_, index) => `${booking.id}-${index + 1}`);
        const qrCodeDataUrls = await Promise.all(ticketIds.map(id => getQrCodeAsBase64(id)));

        const formatTime12Hour = (time24: string) => {
            if (!time24) return '';
            try {
                const [h, m] = time24.split(':').map(Number);
                const d = new Date(); d.setHours(h, m);
                return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            } catch { return time24; }
        };

        let venueDisplay = `${event.venue}, ${event.city}`;
        let dateDisplay = new Date(event.date);
        let timeDisplay = formatTime12Hour(event.startTime || '');

        if (event.category === 'Movies' && booking.showtimeId && booking.showDate) {
            const showtime = event.showtimes?.find(st => st.id === booking.showtimeId);
            if (showtime) {
                const theatre = theatres.find(t => t.id === showtime.theatreId);
                const screen = theatre?.screens.find(s => s.id === showtime.screenId);
                venueDisplay = `${theatre?.name || ''}, ${screen?.name || ''}`;
                dateDisplay = new Date(booking.showDate);
                timeDisplay = formatTime12Hour(showtime.time);
            }
        }

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const generateTicketHtml = (ticket: BookedTicket, index: number) => `
                <div class="ticket">
                    <div class="main">
                        <div class="logo">
                            <span class="logo-tickets">Tickets</span><span class="logo-villa">Villa</span>
                        </div>
                        <div class="movie-title">${event.title}</div>
                        <div class="details-grid">
                            <div class="detail-item"><span>Theatre</span><strong>${venueDisplay}</strong></div>
                            <div class="detail-item"><span>Date</span><strong>${dateDisplay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                            <div class="detail-item"><span>Time</span><strong>${timeDisplay}</strong></div>
                            <div class="detail-item"><span>Seat</span><strong>${ticket.seat || 'GA'}</strong></div>
                            <div class="detail-item"><span>Price</span><strong>₹${ticket.price.toLocaleString('en-IN')}</strong></div>
                            <div class="detail-item"><span>Type</span><strong>${ticket.name}</strong></div>
                        </div>
                        <div class="footer-text">ADMIT ONE</div>
                    </div>
                    <div class="stub">
                        <div class="movie-title-stub">${event.title}</div>
                        <img src="${qrCodeDataUrls[index]}" alt="QR Code" class="qr-code">
                        <p class="booking-id">${ticketIds[index]}</p>
                    </div>
                </div>`;
            
            let ticketsHtml = '';
            for (let i = 0; i < unrolledTickets.length; i += 2) {
                const ticket1Html = generateTicketHtml(unrolledTickets[i], i);
                const ticket2Html = (i + 1 < unrolledTickets.length)
                    ? generateTicketHtml(unrolledTickets[i + 1], i + 1)
                    : '<div class="ticket" style="border: none;"></div>'; // Spacer for odd numbers
                ticketsHtml += `<div class="ticket-container">${ticket1Html}${ticket2Html}</div>`;
            }

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Tickets</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
                            @page {
                                size: 10.16cm 13.97cm; /* 4in x 5.5in - fits two 2x5.5 tickets */
                                margin: 0;
                            }
                            body { font-family: sans-serif; margin: 0; background: #fff; color: #000; font-size: 8pt; }
                            .ticket-container { display: flex; page-break-after: always; }
                            .ticket { width: 5.08cm; height: 13.97cm; box-sizing: border-box; display: flex; flex-direction: column; background: #fff; }
                            .main { flex-grow: 1; padding: 0.3cm; display: flex; flex-direction: column; }
                            .stub { height: 4.5cm; flex-shrink: 0; border-top: 1.5px dashed #000; padding: 0.3cm; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                            .logo { display: flex; align-items: center; gap: 0.5ch; margin-bottom: 0.2cm; justify-content: center; }
                            .logo-tickets, .logo-villa { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 10pt; }
                            .logo-villa { color: #dc2626; }
                            .movie-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 12pt; line-height: 1.1; text-align: center; margin-bottom: 0.2cm; }
                            .details-grid { margin-top: 0.2cm; display: flex; flex-direction: column; gap: 0.15cm; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 0.2cm 0; }
                            .detail-item { display: flex; justify-content: space-between; align-items: baseline; }
                            .detail-item span { font-size: 7pt; font-weight: bold; color: #555; text-transform: uppercase; }
                            .detail-item strong { font-size: 8pt; font-weight: bold; line-height: 1.2; text-align: right; }
                            .footer-text { margin-top: auto; text-align: center; font-weight: bold; font-size: 8pt; color: #555; padding-top: 0.3cm; }
                            .stub .movie-title-stub { font-family: 'Rajdhani', sans-serif; font-size: 8pt; font-weight: 700; margin-bottom: 0.1cm; }
                            .qr-code { width: 3cm; height: 3cm; }
                            .booking-id { font-family: monospace; font-size: 7pt; margin-top: 0.1cm; word-break: break-all; }
                            @media print { .no-print { display: none; } }
                        </style>
                    </head>
                    <body>
                        <button class="no-print" onclick="window.print()">Print Tickets</button>
                        ${ticketsHtml}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
        }
    };
    
    const handleSetSaleMode = (mode: 'events' | 'movies') => {
        if (mode !== saleMode) {
            setView('dashboard');
            setSelectedEvent(null);
            setSearchQuery('');
            setSaleMode(mode);
        }
    }


    const renderSaleFlow = () => {
        if (!selectedEvent) {
            return <div className="text-center text-slate-400 h-full flex items-center justify-center">Select an item from the left to begin a sale.</div>;
        }
        
        const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

        if (saleStep === 'select_showtime' && selectedEvent.category === 'Movies') {
            return (
                 <MovieShowtimeSelector 
                    event={selectedEvent} 
                    theatres={theatres} 
                    onSelectShowtime={(showtime, theatre, date) => {
                        setSeatSelectionData({event: selectedEvent, showtime, theatre, date});
                        setSaleStep('select_seats_or_tickets');
                    }}
                    hideUnavailable={true}
                />
            );
        }

        if (saleStep === 'select_seats_or_tickets') {
             if (seatSelectionData) {
                const boxOfficeUser: User = { id: 'box-office', email: 'boxoffice@eventsphere.ai', password: '', role: 'admin' };
                return <SeatSelection 
                    {...seatSelectionData}
                    user={boxOfficeUser}
                    onBack={() => setSaleStep(selectedEvent.category === 'Movies' ? 'select_showtime' : 'select_event')}
                    onConfirmBoxOfficeSale={handleSeatSelectionBooking}
                    onBookingSuccess={() => { /* Handled by onConfirmBoxOfficeSale for POS */ }}
                    globalSettings={globalSettings}
                />
            } else if (selectedEvent.tickets.length > 0) {
                 return (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Select Tickets</h3>
                        <div className="space-y-4">
                            {selectedEvent.tickets.map(ticket => (
                                <div key={ticket.name} className="flex justify-between items-center bg-black/20 p-4 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-white">{ticket.name}</p>
                                        <p className="text-sm text-slate-400">₹{ticket.price.toLocaleString('en-IN')}</p>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max={ticket.quantityAvailable}
                                        placeholder="0"
                                        onChange={e => handleTicketQuantityChange(ticket.name, parseInt(e.target.value) || 0, ticket.price)}
                                        className="w-24 bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-center"
                                    />
                                </div>
                            ))}
                        </div>
                        {cart.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-red-500">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <button onClick={() => setSaleStep('payment')} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                                    Proceed to Payment
                                </button>
                            </div>
                        )}
                    </div>
                );
            }
        }

        if (saleStep === 'payment') {
            const finalTotal = Math.max(0, cartTotal - (appliedDiscount?.amount || 0));
            
            const handleCustomerDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target;
                setSaleCustomerDetails(prev => ({ ...(prev || { name: '', email: '', phone: '', city: '', state: '' }), [name]: value }));
            };

            return (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Confirm Sale</h3>
                    <div className="bg-black/20 p-4 rounded-lg space-y-2 mb-6 border border-slate-700">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-slate-300">{item.quantity} x {item.name} {item.seat ? `(${item.seat})` : ''}</span>
                                <span className="font-mono text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                        <div className="border-t border-slate-700 pt-2 mt-2 !-mx-4 px-4"></div>
                        {appliedDiscount && (
                            <>
                                <div className="flex justify-between text-sm"><span className="text-slate-300">Subtotal</span><span className="font-mono text-white">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-green-400">Discount ({appliedDiscount.code})</span><span className="font-mono text-green-400">- ₹{appliedDiscount.amount.toLocaleString('en-IN')}</span></div>
                            </>
                        )}
                        <div className="flex justify-between font-bold text-lg"><span className="text-white">Total</span><span className="text-red-500">₹{finalTotal.toLocaleString('en-IN')}</span></div>
                    </div>
                     <div className="flex items-end gap-2 mb-6">
                        <div className="flex-grow"><label className="text-xs text-slate-400">Discount Code</label><input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} className={formInputStyles}/></div>
                        <button onClick={handleApplyDiscount} className="bg-slate-700 text-white font-semibold h-10 px-4 rounded-lg hover:bg-slate-600">Apply</button>
                    </div>

                    <div className="mb-6">
                        {!showCustomerForm ? (
                             <button onClick={() => setShowCustomerForm(true)} className="text-sm text-cyan-400 hover:text-cyan-300">+ Add Customer Details (Optional)</button>
                        ) : (
                            <div className="bg-black/20 p-4 rounded-lg border border-slate-700 space-y-4"><h4 className="font-semibold text-white">Customer Details</h4><div className="grid grid-cols-2 gap-4"><input name="name" placeholder="Full Name" onChange={handleCustomerDetailsChange} value={saleCustomerDetails?.name || ''} className={formInputStyles}/> <input name="phone" placeholder="Phone Number" onChange={handleCustomerDetailsChange} value={saleCustomerDetails?.phone || ''} className={formInputStyles}/></div><input name="email" placeholder="Email Address" onChange={handleCustomerDetailsChange} value={saleCustomerDetails?.email || ''} className={`w-full ${formInputStyles}`}/><button onClick={() => setShowCustomerForm(false)} className="text-xs text-slate-400">Cancel</button></div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => handleConfirmSale('cash')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">Pay with Cash</button>
                         <button onClick={() => handleConfirmSale('card')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Pay with Card</button>
                    </div>
                     <button onClick={() => setSaleStep('select_seats_or_tickets')} className="w-full text-center text-slate-400 text-sm mt-4 hover:text-white">← Back to Selection</button>
                </div>
            );
        }

        return <div>Sale flow step not implemented.</div>;
    };


    const DashboardView: React.FC<{ events: Event[], bookings: EventBooking[], saleMode: 'events' | 'movies' }> = ({ events, bookings, saleMode }) => {
        
        const boxOfficeBookings = useMemo(() => {
            const scopedEventIds = new Set(events.map(e => e.id));
            const offlineSales = bookings
                .filter(b => b.saleType === 'offline' && scopedEventIds.has(b.eventId))
                .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

            return offlineSales;
        }, [bookings, events]);

        const totalRevenue = useMemo(() => boxOfficeBookings.reduce((acc, b) => acc + b.totalPrice, 0), [boxOfficeBookings]);
        const totalTickets = useMemo(() => boxOfficeBookings.reduce((acc, b) => acc + b.bookedTickets.reduce((tAcc, t) => tAcc + t.quantity, 0), 0), [boxOfficeBookings]);
        
        return (
            <div>
                 <h3 className="text-2xl font-bold text-white tracking-tight mb-6">{saleMode === 'events' ? 'Event' : 'Movie'} Sales Dashboard</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6"><h4 className="text-sm font-medium text-slate-400 uppercase">Total Revenue</h4><p className="text-3xl font-bold text-red-500 mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p></div>
                     <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6"><h4 className="text-sm font-medium text-slate-400 uppercase">Tickets Sold</h4><p className="text-3xl font-bold text-red-500 mt-2">{totalTickets.toLocaleString('en-IN')}</p></div>
                     <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6"><h4 className="text-sm font-medium text-slate-400 uppercase">Total Sales</h4><p className="text-3xl font-bold text-red-500 mt-2">{boxOfficeBookings.length.toLocaleString('en-IN')}</p></div>
                 </div>
                 <div className="bg-zinc-900 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Sales</h4>
                    {boxOfficeBookings.length > 0 ? (
                        <div className="overflow-x-auto max-h-96"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-400 uppercase bg-black/20 sticky top-0"><tr><th className="px-4 py-2">Event/Movie</th><th className="px-4 py-2">Tickets</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Time</th><th className="px-4 py-2 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{boxOfficeBookings.slice(0, 10).map(b => {const e=events.find(ev=>ev.id===b.eventId);const t=b.bookedTickets.reduce((a,tk)=>a+tk.quantity,0);return(<tr key={b.id || `offline-${b.bookingDate}`}><td className="px-4 py-2 text-white font-medium">{e?.title||'N/A'}</td><td className="px-4 py-2">{t}</td><td className="px-4 py-2 font-mono">₹{b.totalPrice.toLocaleString('en-IN')}</td><td className="px-4 py-2 text-slate-400">{new Date(b.bookingDate).toLocaleTimeString()}</td><td className="px-4 py-2 text-right"><button onClick={() => printTicket(b)} className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs">Download</button></td></tr>)})}</tbody></table></div>
                    ) : <p className="text-slate-500 text-center py-4">No sales have been recorded for this category yet.</p>}
                </div>
            </div>
        );
    }
    
    const scopedEvents = useMemo(() => {
        if (!user) return [];
        const now = new Date();
        now.setHours(0,0,0,0);
        
        return events.filter(event => {
            if (new Date(event.date) < now && event.category !== 'Movies') return false; // Filter past non-movie events

            switch (user.role) {
                case 'admin':
                    return true;
                case 'theatre_manager':
                    if (event.category !== 'Movies' || !user.theatreId) return false;
                    return event.screenListings && Object.keys(event.screenListings).includes(user.theatreId);
                case 'organizer':
                    return event.createdBy === user.email;
                default:
                    return false;
            }
        });
    }, [events, user]);

    const activeItems = useMemo(() => {
        let items = scopedEvents;
        if (saleMode === 'events') {
            items = items.filter(e => e.category !== 'Movies');
        } else { // movies
            items = items.filter(e => e.category === 'Movies');
        }
        return items;
    }, [scopedEvents, saleMode]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return activeItems;
        return activeItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [activeItems, searchQuery]);

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <div className="max-w-screen-xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div><h2 className="text-4xl font-bold text-white tracking-tight">Box Office POS</h2><p className="text-slate-400">Sell tickets in-person for events and movies.</p></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}><div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>{isOnline ? 'Online' : 'Offline Mode'}</div>
                    {pendingBookings.length > 0 && (<button onClick={handleSync} disabled={!isOnline} className="bg-yellow-500/20 text-yellow-300 font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed">Sync {pendingBookings.length} Pending Sale(s)</button>)}
                </div>
            </div>
            
            {allowedModes.length > 1 && (
                <div className="flex items-center gap-2 mb-8">
                    <TabButton isActive={saleMode === 'events'} onClick={() => handleSetSaleMode('events')}>
                        Sell Event Tickets
                    </TabButton>
                    <TabButton isActive={saleMode === 'movies'} onClick={() => handleSetSaleMode('movies')}>
                        Sell Movie Tickets
                    </TabButton>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-lg text-white">{saleMode === 'events' ? 'Select Event' : 'Select Movie'}</h3>{view === 'sale' && (<button onClick={handleResetSale} className="text-xs text-red-400 hover:text-red-300 font-semibold">Reset</button>)}</div>
                    <div className="relative mb-4"><input type="text" placeholder={`Search ${saleMode}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`${formInputStyles} pl-9`}/> <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div></div>
                    <div className="space-y-2 h-[40vh] lg:h-[60vh] overflow-y-auto pr-2">{filteredItems.map(item => (<div key={item.id} onClick={() => handleStartSale(item)} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedEvent?.id === item.id ? 'bg-red-500/20 border-red-500/50' : 'bg-zinc-900 border-slate-800 hover:bg-red-500/10 hover:border-red-500/50'}`}><p className="font-semibold text-white">{item.title}</p><p className="text-xs text-slate-400">{item.category} | {new Date(item.date).toLocaleDateString('en-IN')}</p></div>))}</div>
                </div>

                <div className="lg:col-span-9 bg-zinc-900/50 border border-slate-800 rounded-2xl p-6">
                    {view === 'dashboard' ? <DashboardView events={activeItems} bookings={bookings} saleMode={saleMode} /> : renderSaleFlow()}
                </div>
            </div>
            {saleSuccessData && (
                <Modal isOpen={true} onClose={() => { setSaleSuccessData(null); handleResetSale(); }}>
                    <div className="text-center">
                        <svg className="h-12 w-12 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h2 className="text-2xl font-bold text-white mt-4">Sale Successful!</h2>
                        <p className="text-slate-400 mt-2">Booking ID: <span className="font-mono text-red-400">{saleSuccessData.id}</span></p>
                        <div className="bg-black/20 p-4 rounded-lg my-6 text-left text-sm space-y-2"><p className="flex justify-between"><span>Event:</span> <strong className="text-right text-white">{events.find(e=>e.id===saleSuccessData.eventId)?.title}</strong></p><p className="flex justify-between"><span>Tickets:</span> <strong className="text-white">{saleSuccessData.bookedTickets.reduce((a, t)=>a+t.quantity,0)}</strong></p><p className="flex justify-between"><span>Total Paid:</span> <strong className="text-white">₹{saleSuccessData.totalPrice.toLocaleString('en-IN')}</strong></p></div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => { setSaleSuccessData(null); handleResetSale(); }} className="w-full bg-slate-700 text-white font-bold py-3 rounded-lg hover:bg-slate-600 transition-colors">New Sale</button>
                            <button onClick={() => printTicket(saleSuccessData)} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">Print Tickets</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default BoxOffice;