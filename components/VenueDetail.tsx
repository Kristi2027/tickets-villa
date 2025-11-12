import React, { useState, useMemo } from 'react';
import { Venue, VenueBooking, User, GuestDetails, GlobalSettings } from '../types.ts';
import { initiateGooglePayCheckout } from '../services/paymentService';
import DatePicker from './DatePicker';
import PaymentModal from './PaymentModal';
import GuestInfoModal from './GuestInfoModal';

interface VenueDetailProps {
  venue: Venue;
  user: User | null;
  venueBookings: VenueBooking[];
  onBack: () => void;
  onBookingSuccess: (bookingData: Omit<VenueBooking, 'id' | 'paymentId'>, guestDetails?: GuestDetails) => void;
  globalSettings: GlobalSettings;
}

// Generate time slots for the day
const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8; // From 8 AM to 10 PM
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return {
        label: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        value: hour.toString().padStart(2, '0') + ':00',
    };
});


const VenueDetail: React.FC<VenueDetailProps> = ({ venue, user, venueBookings, onBack, onBookingSuccess, globalSettings }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [bookingType, setBookingType] = useState<'fullDay' | 'perHour'>('fullDay');
    const [hours, setHours] = useState(1);
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [pendingBookingData, setPendingBookingData] = useState<any>(null);

    const allBookingsForVenue = useMemo(() => venueBookings.filter(b => b.venueId === venue.id), [venueBookings, venue.id]);

    const { bookedDatesForPicker, isDayFullyBooked, bookedSlotsForSelectedDate } = useMemo(() => {
        const bookingsOnSelectedDate = selectedDate ? allBookingsForVenue.filter(b => b.bookedDate === selectedDate) : [];
        
        const isFullDay = bookingsOnSelectedDate.some(b => b.bookingType === 'fullDay');
        
        const hourlySlots = new Set<string>();
        if (!isFullDay) {
            bookingsOnSelectedDate.forEach(b => {
                if (b.bookingType === 'perHour' && b.startTime && b.hoursBooked) {
                    const startHour = parseInt(b.startTime.split(':')[0], 10);
                    for (let i = 0; i < b.hoursBooked; i++) {
                        const currentHour = (startHour + i).toString().padStart(2, '0') + ':00';
                        hourlySlots.add(currentHour);
                    }
                }
            });
        }
        
        const fullDayBookedDates = allBookingsForVenue
            .filter(b => b.bookingType === 'fullDay')
            .map(b => b.bookedDate);

        return {
            bookedDatesForPicker: fullDayBookedDates,
            isDayFullyBooked: isFullDay,
            bookedSlotsForSelectedDate: Array.from(hourlySlots),
        };
    }, [selectedDate, allBookingsForVenue]);
    
    const { selectedRange, isRangeConflict } = useMemo(() => {
        if (!selectedStartTime || hours <= 0) return { selectedRange: [], isRangeConflict: false };

        const range = new Set<string>();
        let conflict = false;
        const startHour = parseInt(selectedStartTime.split(':')[0], 10);

        for (let i = 0; i < hours; i++) {
            const currentHourValue = (startHour + i).toString().padStart(2, '0') + ':00';
            range.add(currentHourValue);
            if (bookedSlotsForSelectedDate.includes(currentHourValue)) {
                conflict = true;
            }
        }
        return { selectedRange: Array.from(range), isRangeConflict: conflict };
    }, [selectedStartTime, hours, bookedSlotsForSelectedDate]);

    const totalAmount = useMemo(() => {
        if (!selectedDate) return 0;
        if (bookingType === 'fullDay') return venue.pricing.fullDay;
        if (bookingType === 'perHour' && selectedStartTime && !isRangeConflict) {
             return venue.pricing.perHour * Math.max(1, hours);
        }
        return 0;
    }, [selectedDate, bookingType, hours, venue.pricing, selectedStartTime, isRangeConflict]);

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setSelectedStartTime(null); // Reset time when date changes
    };

    const handleConfirmBooking = () => {
        if (totalAmount <= 0 || isRangeConflict) {
            alert("Please select a valid date and time slot.");
            return;
        }

        const bookingPayload = {
            totalAmount: totalAmount,
            transactionLabel: `Venue Booking: ${venue.name}`,
            bookingData: {
                venueId: venue.id,
                bookingDate: new Date().toISOString(),
                userEmail: user ? user.email : '',
                bookedDate: selectedDate!,
                bookingType: bookingType,
                hoursBooked: bookingType === 'perHour' ? hours : undefined,
                startTime: bookingType === 'perHour' ? selectedStartTime : undefined,
                totalPrice: totalAmount,
            }
        };
        
        setPendingBookingData(bookingPayload);
        
        if (!user) {
            setIsGuestModalOpen(true);
        } else {
            setIsPaymentModalOpen(true);
        }
    };

    const handleGuestInfoSubmit = (guestDetails: GuestDetails) => {
        setPendingBookingData((prev: any) => ({
            ...prev,
            bookingData: { ...prev.bookingData, userEmail: guestDetails.email },
            guestDetails,
        }));
        setIsGuestModalOpen(false);
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
            onBookingSuccess(pendingBookingData.bookingData, pendingBookingData.guestDetails);
            setIsPaymentModalOpen(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to Venues
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="aspect-video bg-black rounded-lg border border-slate-700 flex items-center justify-center">
                        <img src={venue.bannerImage} alt={venue.name} loading="lazy" className="w-full h-full object-cover rounded-lg" />
                    </div>
                </div>

                <div className="lg:col-span-1">
                     <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 space-y-5 lg:sticky top-24">
                        <div>
                            <h2 className="text-xl font-bold text-white">Book This Venue</h2>
                            <p className="text-sm text-slate-400 mt-1">Select a date and pricing option.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Select Date</label>
                                 <DatePicker 
                                    selectedDate={selectedDate}
                                    onDateChange={handleDateChange}
                                    minDate={new Date().toISOString().split('T')[0]}
                                    disabledDates={bookedDatesForPicker}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Booking Type</label>
                                <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-lg">
                                    <button onClick={() => setBookingType('fullDay')} className={`py-3 px-2 text-sm rounded-md transition-colors text-center ${bookingType === 'fullDay' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`}>
                                        Full Day <span className="block text-xs font-normal">₹{venue.pricing.fullDay.toLocaleString('en-IN')}</span>
                                    </button>
                                     <button onClick={() => setBookingType('perHour')} className={`py-3 px-2 text-sm rounded-md transition-colors text-center ${bookingType === 'perHour' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`}>
                                        Per Hour <span className="block text-xs font-normal">₹{venue.pricing.perHour.toLocaleString('en-IN')}/hr</span>
                                    </button>
                                </div>
                            </div>
                            {bookingType === 'perHour' && (
                                <div>
                                    <label htmlFor="hours" className="block text-sm font-medium text-slate-300 mb-2">Number of Hours</label>
                                    <input type="number" id="hours" min="1" max="12" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full bg-black/20 border border-slate-700 rounded-lg py-2 px-3 text-white" />
                                </div>
                            )}

                             {bookingType === 'perHour' && selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Select Start Time</label>
                                    {isDayFullyBooked ? (
                                        <div className="text-center p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">This day is fully booked.</div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2 text-xs">
                                            {timeSlots.map(slot => {
                                                const isBooked = bookedSlotsForSelectedDate.includes(slot.value);
                                                const isSelected = selectedStartTime === slot.value;
                                                const isInRange = selectedRange.includes(slot.value);
                                                
                                                let buttonClass = "p-2 rounded-md transition-colors ";
                                                if (isBooked) buttonClass += "bg-slate-700 text-slate-500 cursor-not-allowed line-through";
                                                else if (isSelected) buttonClass += "bg-red-600 text-white font-bold ring-2 ring-red-400";
                                                else if (isInRange && isRangeConflict) buttonClass += "bg-red-900/80 text-red-300 font-bold border border-red-600";
                                                else if (isInRange) buttonClass += "bg-red-600/50 text-white";
                                                else buttonClass += "bg-slate-800/60 hover:bg-slate-700 text-slate-300";

                                                return <button key={slot.value} disabled={isBooked} onClick={() => setSelectedStartTime(slot.value)} className={buttonClass}>{slot.label}</button>;
                                            })}
                                        </div>
                                    )}
                                     {isRangeConflict && <p className="text-red-400 text-sm mt-2">The selected time range overlaps with another booking.</p>}
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold text-white">Total</span>
                                <span className="text-2xl font-bold text-red-500">₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <button 
                                onClick={handleConfirmBooking}
                                disabled={totalAmount <= 0}
                                className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Book Now
                            </button>
                        </div>
                        <div className="mt-2 pt-4 border-t border-slate-800">
                             <h4 className="font-semibold text-white mb-2">Refund Policy</h4>
                             <p className="text-xs text-slate-400">{venue.refundPolicy}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{venue.name}</h1>
                <p className="mt-4 text-lg text-slate-300 max-w-4xl">{venue.description}</p>
                 <div className="mt-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-3">
                        {venue.amenities.map(amenity => (
                            <span key={amenity} className="bg-slate-800 text-slate-300 text-sm font-medium px-4 py-2 rounded-full">{amenity}</span>
                        ))}
                    </div>
                </div>
            </div>

            {isGuestModalOpen && (
                <GuestInfoModal 
                    onClose={() => setIsGuestModalOpen(false)}
                    onSubmit={handleGuestInfoSubmit}
                />
            )}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onGooglePaySelect={handleGooglePaySelect}
                onUpiSelect={handleUpiSelect}
                totalAmount={pendingBookingData?.totalAmount || 0}
                settings={globalSettings}
            />
        </div>
    );
};

export default VenueDetail;