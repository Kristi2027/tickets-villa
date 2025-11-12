import React, { useState } from 'react';
import { ConfirmationData, BookedTicket, Theatre } from '../types.ts';

declare global {
    interface Window {
        jspdf: any;
    }
}

// Helper to safely parse a 'YYYY-MM-DD' string to avoid timezone issues.
const parseDateString = (dateStr: string): Date => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr); // Fallback for other formats like ISO strings
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    // Month is 0-indexed in JavaScript Date constructor
    return new Date(year, month - 1, day);
};

const getQrCodeAsBase64 = (value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(value)}`;
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
        img.onerror = (error) => {
            reject(error);
        };
        img.src = qrCodeUrl;
    });
};


const QRCode: React.FC<{ value: string }> = ({ value }) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(value)}`;
    return (
        <div className="bg-white p-2 rounded-lg w-36 h-36 flex items-center justify-center">
            <img src={qrCodeUrl} alt={`QR Code for booking ${value}`} className="w-32 h-32" />
        </div>
    );
};


const BookingConfirmation: React.FC<{ confirmation: ConfirmationData; theatres: Theatre[]; onBack: () => void; }> = ({ confirmation, theatres, onBack }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                return resolve();
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Script load error for ${src}`));
            document.body.appendChild(script);
        });
    };
    
    // Helper to format 24-hour time to 12-hour AM/PM
    const formatTime12Hour = (time24: string) => {
        if (!time24) return '';
        try {
            const [hours, minutes] = time24.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return time24; // Fallback
        }
    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");

            const { jsPDF } = window.jspdf;
            const { type, data } = confirmation;
            // FIX: Use a discriminated union to safely access properties like userEmail or clientId.
            const { id: bookingId } = data;
            const userEmail = type === 'artist_booking' ? data.clientId : data.userEmail;
            
            // --- Common PDF Setup ---
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 90] });
            const docWidth = doc.internal.pageSize.getWidth();
            const docHeight = doc.internal.pageSize.getHeight();
            const mainMargin = 10;
            const stubX = docWidth - 65;
            
            const bgColor = [24, 24, 27]; // zinc-900
            const primaryColor = [220, 38, 38]; // red-600
            const textColor = [241, 245, 249]; // slate-100
            const mutedColor = [148, 163, 184]; // slate-400

            const drawTicketLayout = () => {
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.rect(0, 0, docWidth, docHeight, 'F');
                doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.rect(0, 0, docWidth, 2, 'F');
                doc.setDrawColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.setLineDash([1.5, 1.5], 0);
                doc.line(stubX, 5, stubX, docHeight - 5);
                doc.setLineDash([], 0);
            };

            const drawStub = (qrCodeUrl: string, id: string) => {
                const stubMargin = 5;
                const stubContentX = stubX + stubMargin;
                const stubWidth = docWidth - stubX - stubMargin * 2;

                doc.addImage(qrCodeUrl, 'PNG', stubContentX + (stubWidth - 45)/2, mainMargin, 45, 45);
                
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.text('SCAN FOR ENTRY', stubX + (docWidth - stubX) / 2, mainMargin + 45 + 7, { align: 'center' });

                doc.setFont('courier', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.text(id, stubX + (docWidth - stubX) / 2, mainMargin + 45 + 15, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.text('Issued to:', stubX + (docWidth - stubX) / 2, mainMargin + 45 + 21, { align: 'center' });
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.text(userEmail, stubX + (docWidth - stubX) / 2, mainMargin + 45 + 25, { align: 'center', maxWidth: stubWidth });
            };


            if (type === 'venue' || type === 'artist_booking') {
                const qrCodeDataUrl = await getQrCodeAsBase64(bookingId);
                drawTicketLayout();

                const isArtistBooking = type === 'artist_booking';
                const title = isArtistBooking ? data.artist.name : data.venue.name;
                const subTitle = isArtistBooking ? `Live Performance at ${data.eventVenue}` : data.venue.address;
                const dateLabel = isArtistBooking ? 'Performance Date' : 'Date Booked';
                const dateValue = isArtistBooking ? data.eventDate : data.bookedDate;
                const totalLabel = isArtistBooking ? 'Total Fee Paid' : 'Total Paid';
                const price = isArtistBooking ? data.proposedFee : data.totalPrice;

                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.text(title, mainMargin, mainMargin + 18, { maxWidth: stubX - mainMargin * 1.5 });
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.text(subTitle, mainMargin, mainMargin + 26);
                doc.setFontSize(12);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.text(`${dateLabel}: ${parseDateString(dateValue).toLocaleDateString('en-IN')}`, mainMargin, mainMargin + 40);
                doc.setFont('helvetica', 'bold');
                doc.text(`${totalLabel}: ₹${price.toLocaleString('en-IN')}`, mainMargin, mainMargin + 50);

                drawStub(qrCodeDataUrl, bookingId);
                doc.save(`TicketsVilla_${isArtistBooking ? 'Artist' : 'Venue'}Booking_${bookingId}.pdf`);
                setIsDownloading(false);
                return;
            }

            // --- EVENT & MOBILE THEATRE TICKET LOGIC ---
            const unrolledTickets: BookedTicket[] = [];
            data.bookedTickets.forEach(ticket => {
                if (ticket.quantity > 1 && !ticket.seat) {
                    for (let i = 0; i < ticket.quantity; i++) {
                        unrolledTickets.push({ ...ticket, quantity: 1 });
                    }
                } else {
                    unrolledTickets.push(ticket);
                }
            });

            // Get correct event details based on confirmation type
            let title: string, venueDisplay: string, dateDisplay: Date, timeDisplay: string, entryGate: string | undefined;

            if (type === 'mobile_theatre') {
                const { theatre, tourStop, showtimeId, showDate } = data;
                const showtime = tourStop.showtimes?.find(st => st.id === showtimeId);
                title = theatre.name;
                venueDisplay = `${tourStop.venueName}, ${tourStop.location}`;
                dateDisplay = parseDateString(showDate!);
                timeDisplay = formatTime12Hour(showtime?.time || '');
                entryGate = tourStop.entryGate;
            } else { // type === 'event'
                const { event, showtimeId, showDate } = data;
                title = event.title;
                venueDisplay = `${event.venue}, ${event.city}`;
                dateDisplay = new Date(event.date);
                timeDisplay = formatTime12Hour(event.startTime || '');

                if (event.category === 'Movies' && showtimeId && showDate) {
                    const showtime = event.showtimes?.find(st => st.id === showtimeId);
                    if (showtime) {
                        const theatre = theatres.find(t => t.id === showtime.theatreId);
                        const screen = theatre?.screens.find(s => s.id === showtime.screenId);
                        venueDisplay = `${theatre?.name || 'Unknown Theatre'}${screen ? `, ${screen.name}` : ''}`;
                        dateDisplay = parseDateString(showDate);
                        timeDisplay = formatTime12Hour(showtime.time);
                    }
                }
            }
            
            // Generate unique IDs and fetch all QR codes concurrently
            const ticketIds = unrolledTickets.map((_, index) => `${bookingId}-${index + 1}`);
            const qrCodeDataUrls = await Promise.all(ticketIds.map(id => getQrCodeAsBase64(id)));
            const totalGuests = data.bookedTickets.reduce((total, ticket) => total + ticket.quantity, 0);

            // Loop and draw each ticket page
            unrolledTickets.forEach((ticket, index) => {
                if (index > 0) doc.addPage([210, 90], 'l');
                drawTicketLayout();

                // --- MAIN TICKET AREA ---
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.text('Tickets Villa', mainMargin, mainMargin + 2);

                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                
                const titleMaxWidth = stubX - mainMargin * 1.5;
                const titleLines = doc.splitTextToSize(title, titleMaxWidth);
                doc.text(titleLines, mainMargin, mainMargin + 18);
                const titleDimensions = doc.getTextDimensions(titleLines);
                let currentY = mainMargin + 18 + titleDimensions.h;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                currentY += 2;
                doc.text(dateDisplay.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), mainMargin, currentY);
                currentY += 5;
                if (timeDisplay) {
                    doc.text(timeDisplay, mainMargin, currentY);
                    currentY += 5;
                }
                doc.text(venueDisplay, mainMargin, currentY);
                
                doc.setDrawColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.line(mainMargin, currentY + 7, stubX - 5, currentY + 7);

                let startY = currentY + 14;

                doc.setFontSize(10);
                doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.text('TICKET TYPE:', mainMargin, startY);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.text(ticket.name, mainMargin + 30, startY);

                if (ticket.seat || entryGate) {
                    startY += 8;
                    let seatText = '';
                    if (ticket.seat) seatText += `Seat: ${ticket.seat}`;
                    if (entryGate) seatText += (seatText ? ' | ' : '') + `Gate: ${entryGate}`;

                    doc.setFontSize(10);
                    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                    doc.text('ENTRY:', mainMargin, startY);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    doc.text(seatText, mainMargin + 30, startY);
                }
                
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                doc.text(`Ticket ${index + 1} of ${unrolledTickets.length} (Total Guests: ${totalGuests})`, mainMargin, docHeight - mainMargin + 5);


                // --- STUB AREA ---
                drawStub(qrCodeDataUrls[index], ticketIds[index]);
            });

            doc.save(`TicketsVilla_Tickets_${bookingId}.pdf`);

        } catch (error) {
            console.error("Failed to generate PDF ticket:", error);
            alert("Could not download ticket PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };


    const renderContent = () => {
        if (confirmation.type === 'event') {
            const { event, totalPrice, bookedTickets } = confirmation.data;
            const totalGuests = bookedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
            return (
                <>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                        {totalGuests > 0 && (
                            <p className="text-lg font-semibold text-red-500 mt-2">
                                Entry for {totalGuests} {totalGuests > 1 ? 'Guests' : 'Guest'}
                            </p>
                        )}
                        <p className="text-sm text-slate-400 mt-1">{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-slate-400">{event.venue}, {event.city}</p>
                    </div>
                    <div className="border-t border-b border-dashed border-slate-700 my-4 py-4 space-y-2">
                        {bookedTickets.map((ticket, index) => (
                            <div key={index} className="flex justify-between items-center text-slate-300">
                                <span>
                                    {ticket.seat ? `${ticket.name} - Seat ${ticket.seat}` : `${ticket.quantity} x ${ticket.name}`}
                                </span>
                                <span className="font-mono">₹{(ticket.quantity * ticket.price).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg mt-4">
                        <span className="text-white">TOTAL PAID</span>
                        <span className="text-red-500">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </>
            );
        }
        
        if (confirmation.type === 'artist_booking') {
            const { artist, proposedFee, eventDate, eventVenue } = confirmation.data;
            return (
                <>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-white">Artist Booking Confirmed!</h2>
                        <p className="text-2xl font-bold text-red-500 mt-1">{artist.name}</p>
                    </div>
                    <div className="border-t border-slate-800 my-4 py-4 space-y-2">
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Performance Date:</span>
                            <span>{parseDateString(eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Venue:</span>
                            <span className="text-right">{eventVenue}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-white">TOTAL FEE PAID</span>
                        <span className="text-red-500">₹{proposedFee.toLocaleString('en-IN')}</span>
                    </div>
                </>
            );
        }

        if (confirmation.type === 'venue') {
            const { venue, totalPrice, bookedDate, bookingType, hoursBooked } = confirmation.data;
            return (
                <>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-white">{venue.name}</h2>
                        <p className="text-sm text-slate-400">{venue.address}, {venue.city}</p>
                    </div>
                    <div className="border-t border-slate-800 my-4 py-4">
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Date Booked:</span>
                            <span>{parseDateString(bookedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Booking Type:</span>
                            <span>{bookingType === 'fullDay' ? 'Full Day' : `${hoursBooked} Hours`}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-white">TOTAL PAID</span>
                        <span className="text-red-500">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </>
            );
        }

         if (confirmation.type === 'mobile_theatre') {
            const { theatre, tourStop, totalPrice, bookedTickets, showDate } = confirmation.data;
            const totalGuests = bookedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
            return (
                <>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{theatre.name}</h2>
                         <p className="text-sm text-slate-400 mt-1">{tourStop.venueName}, {tourStop.location}</p>
                         <p className="text-sm text-slate-400">{parseDateString(showDate!).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="border-t border-b border-dashed border-slate-700 my-4 py-4 space-y-2">
                        {bookedTickets.map((ticket, index) => (
                            <div key={index} className="flex justify-between items-center text-slate-300">
                                <span>{ticket.name} - Seat {ticket.seat}</span>
                                <span className="font-mono">₹{(ticket.price).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg mt-4">
                        <span className="text-white">TOTAL PAID</span>
                        <span className="text-red-500">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </>
            );
        }
        return null;
    };
    
    // FIX: Use a discriminated union to safely access properties like userEmail or clientId.
    const userIdentifier = confirmation.type === 'artist_booking' ? confirmation.data.clientId : confirmation.data.userEmail;

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-8">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Payment Successful & Booking Confirmed!</h1>
                <p className="text-slate-400">A confirmation has been sent to <span className="font-semibold text-red-500">{userIdentifier}</span>.</p>
            </div>
            
            <div className="bg-zinc-900 border border-red-700/30 rounded-2xl shadow-2xl shadow-red-500/10 flex flex-col md:flex-row overflow-hidden">
                <div className="flex-grow p-8">
                    {renderContent()}
                </div>
                <div className="bg-black/20 md:w-56 flex-shrink-0 p-6 flex flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-800">
                    <QRCode value={confirmation.data.id} />
                     <button 
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-slate-600 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isDownloading ? (
                             <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                Download
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="text-center mt-8">
                <button 
                    onClick={onBack} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                >
                    Explore More
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;