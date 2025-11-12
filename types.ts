// types.ts

export type Role = 'admin' | 'theatre_manager' | 'organizer' | 'customer' | 'artist';
export type Permission = 'create_event' | 'manage_events' | 'manage_theatres' | 'box_office' | 'manage_payouts';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: Role;
  permissions?: Permission[];
  theatreId?: string;
  organizerName?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface Ticket {
    name: string;
    price: number;
    quantityAvailable: number;
}

export interface DiscountCode {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
}

export interface EarlyBird {
    isActive: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    endDate: string;
}

export interface Showtime {
    id: string;
    theatreId: string;
    screenId: string;
    time: string;
    availability: 'available' | 'fast_filling' | 'sold_out';
    seatStatus: SeatSaleStatus[][];
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    city: string;
    venue: string;
    category: string;
    bannerImage: string;
    tickets: Ticket[];
    status: 'active' | 'pending' | 'rejected' | 'past';
    hype: number;
    isFeatured?: boolean;
    createdBy?: string;
    // Movie specific
    genre?: string;
    actors?: string[];
    director?: string;
    rating?: number;
    screenListings?: Record<string, string[]>; // theatreId -> screenId[]
    showtimes?: Showtime[];
    trailerVideoId?: string;
    // Seated event specific
    theatreId?: string;
    screenId?: string;
    seatStatus?: SeatSaleStatus[][]; // For non-movie seated events
    startTime?: string;
    endTime?: string;
    discountCodes?: DiscountCode[];
    earlyBird?: EarlyBird;
}

export type SeatType = 'standard' | 'premium' | 'recliner' | 'wheelchair' | 'aisle' | 'empty' | 'stage-left' | 'stage-right' | 'ramp';

export interface SeatCategory {
    id: SeatType;
    name: string;
    price: number;
    color: string;
}

export interface SeatLayout {
    rows: number;
    cols: number;
    grid: SeatType[][];
    categories: SeatCategory[];
    rowStartIndex?: number;
    colStartIndex?: number;
}

export interface Screen {
    id: string;
    name: string;
    seatLayout: SeatLayout;
    defaultShowtimes?: string[];
}

export interface Theatre {
    id: string;
    name: string;
    city: string;
    screens: Screen[];
}

export interface BookedTicket {
    name: string;
    price: number;
    quantity: number;
    seat?: string;
}

export interface GuestDetails {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
}

export interface EventBooking {
    id: string;
    eventId: string;
    paymentId: string;
    bookingDate: string;
    userEmail: string;
    bookedTickets: BookedTicket[];
    totalPrice: number;
    showtimeId?: string;
    showDate?: string;
    seats?: string[]; // "r-c" format
    guestDetails?: GuestDetails;
    saleType?: 'online' | 'offline';
    paymentMethod?: 'online' | 'cash' | 'card';
    syncStatus?: 'synced' | 'pending';
    buyerCity?: string;
    discountApplied?: { code: string; amount: number; };
}

export interface PayoutRequest {
    id: string;
    requesterId: string;
    requesterType: 'event' | 'theatre' | 'artist';
    amount: number;
    status: 'Pending' | 'Completed' | 'Rejected';
    requestDate: string;
    processedDate?: string;
}

export interface Venue {
    id: string;
    name: string;
    address: string;
    city: string;
    capacity: number;
    amenities: string[];
    bannerImage: string;
    description: string;
    pricing: {
        perHour: number;
        fullDay: number;
    };
    refundPolicy: string;
}

export interface VenueBooking {
    id: string;
    venueId: string;
    paymentId: string;
    bookingDate: string;
    userEmail: string;
    bookedDate: string;
    bookingType: 'fullDay' | 'perHour';
    hoursBooked?: number;
    startTime?: string;
    totalPrice: number;
    guestDetails?: GuestDetails;
}

export interface Offer {
    id: string;
    title: string;
    details: string;
    type: 'tag' | 'card';
}

export type SeatSaleStatus = 'available' | 'booked' | 'locked' | 'selected';

export interface MobileShowtime {
    id: string;
    date: string;
    time: string;
    seatStatus: SeatSaleStatus[][];
}

export interface TourStop {
    location: string;
    venueName: string;
    startDate: string;
    endDate: string;
    seatLayout?: SeatLayout;
    showtimes?: MobileShowtime[];
    entryGate?: string;
}

export interface MobileTheatre {
    id: string;
    name: string;
    owner: string;
    season: string;
    bannerImage: string;
    description: string;
    tourPlan: TourStop[];
}

export interface Artist {
    id: string;
    name: string;
    userEmail: string;
    genre: string;
    photo: string;
    description: string;
    bookingFee: number;
    showreelUrl?: string;
    gallery?: string[];
}

export interface ArtistBooking {
    id: string;
    artistId: string;
    clientId: string;
    requestDate: string;
    eventDate: string;
    eventVenue: string;
    proposedFee: number;
    status: 'pending_artist_approval' | 'confirmed_by_artist' | 'paid' | 'rejected_by_artist' | 'cancelled_by_client';
    paymentId?: string;
}

export interface ActiveFilters {
    category: string;
    genre: string;
    actor: string;
    director: string;
    minCapacity: number;
    amenities: string[];
}

export type DisplayMode = 'events' | 'movies' | 'venues' | 'mobileTheatres' | 'artists';

export type ConfirmationData = 
    | { type: 'event', data: EventBooking & { event: Event } }
    | { type: 'venue', data: VenueBooking & { venue: Venue } }
    | { type: 'mobile_theatre', data: EventBooking & { theatre: MobileTheatre, tourStop: TourStop } }
    | { type: 'artist_booking', data: ArtistBooking & { artist: Artist } };

export type AppView = 'event_list' | 'event_detail' | 'venue_detail' | 'mobile_theatre_detail' | 'artist_profile' | 'confirmation' | 'login' | 'my_bookings' | 'admin' | 'theatre_manager' | 'artist_dashboard';

export type AdminTab = 'events' | 'movies' | 'users' | 'theatres' | 'mobile_theatres' | 'artists' | 'payouts' | 'pending_events' | 'venues' | 'offers' | 'access_control' | 'boxoffice';


export interface PaymentGatewaySettings {
    upiId: string;
    razorpayKeyId: string;
    stripePublicKey: string;
}

export interface GlobalSettings {
    gstRate: number;
    platformFeeRate: number;
    serviceChargeRate: number;
    paymentGatewaySettings: PaymentGatewaySettings;
}

export const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'
];

export const AVAILABLE_AMENITIES = [
    'Parking', 'Air Conditioning', 'Wi-Fi', 'Restrooms', 'Wheelchair Accessible', 'Stage', 'Sound System', 'Catering'
];

export const SEAT_CATEGORIES_DEFAULT: SeatCategory[] = [
    { id: 'standard', name: 'Standard', price: 250, color: 'bg-blue-600 border-blue-500' },
    { id: 'premium', name: 'Premium', price: 400, color: 'bg-yellow-500 border-yellow-400' },
    { id: 'recliner', name: 'Recliner', price: 600, color: 'bg-purple-600 border-purple-500' },
    { id: 'wheelchair', name: 'Wheelchair', price: 250, color: 'bg-cyan-500 border-cyan-400' },
    { id: 'aisle', name: 'Aisle', price: 0, color: '' },
    { id: 'empty', name: 'Empty', price: 0, color: '' },
    { id: 'stage-left', name: 'Stage Left', price: 0, color: 'bg-gray-700 border-gray-600' },
    { id: 'stage-right', name: 'Stage Right', price: 0, color: 'bg-gray-700 border-gray-600' },
    { id: 'ramp', name: 'Ramp', price: 0, color: 'bg-gray-600 border-gray-500' },
];
