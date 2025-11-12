// FIX: Add VenueBooking to the import list to resolve type error.
import { User, Event, Theatre, SeatLayout, EventBooking, PayoutRequest, Venue, Offer, MobileTheatre, Artist, ArtistBooking, SEAT_CATEGORIES_DEFAULT, VenueBooking } from './types.ts';

export const MOCK_CAST = [
    { name: 'Actor One', role: 'Lead Role', image: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Actor Two', role: 'Supporting Role', image: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Actor Three', role: 'Cameo', image: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Actor Four', role: 'Villain', image: 'https://i.pravatar.cc/150?img=4' },
];
export const MOCK_CREW = [
    { name: 'Director One', role: 'Director', image: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Musician One', role: 'Music', image: 'https://i.pravatar.cc/150?img=6' },
];

export const MOCK_USERS: User[] = [
    { id: 'user-1', email: 'admin@ticketsvilla.com', role: 'admin', permissions: ['create_event', 'manage_events', 'manage_theatres', 'box_office', 'manage_payouts'] },
    { id: 'user-2', email: 'manager@ticketsvilla.com', role: 'theatre_manager', theatreId: 'thr-1' },
    { id: 'user-3', email: 'organizer@ticketsvilla.com', role: 'organizer', permissions: ['create_event'] },
    { id: 'user-4', email: 'customer@ticketsvilla.com', role: 'customer' },
    { id: 'user-5', email: 'artist@ticketsvilla.com', role: 'artist' },
];

const screen1Layout: SeatLayout = {
    rows: 10, cols: 15,
    grid: Array(10).fill(null).map(() => Array(15).fill('standard')),
    categories: SEAT_CATEGORIES_DEFAULT
};
const screen2Layout: SeatLayout = {
    rows: 12, cols: 20,
    grid: Array(12).fill(null).map(() => Array(20).fill('premium')),
    categories: SEAT_CATEGORIES_DEFAULT
};

export const MOCK_THEATRES: Theatre[] = [
    {
        id: 'thr-1', name: 'PVR Cinemas', city: 'Mumbai',
        screens: [
            { id: 'scr-1', name: 'Screen 1', seatLayout: screen1Layout, defaultShowtimes: ['10:00', '13:00', '16:00', '19:00', '22:00'] },
            { id: 'scr-2', name: 'Screen 2 (IMAX)', seatLayout: screen2Layout, defaultShowtimes: ['11:00', '14:30', '18:00', '21:30'] }
        ]
    },
    {
        id: 'thr-2', name: 'INOX', city: 'Delhi',
        screens: [
            { id: 'scr-3', name: 'Audi 1', seatLayout: screen1Layout, defaultShowtimes: ['09:30', '12:30', '15:30', '18:30', '21:30'] }
        ]
    }
];

export const MOCK_EVENTS: Event[] = [
    {
        id: 'evt-1', title: 'Cosmic Grooves ft. DJ Astro', description: 'An electrifying night of techno and house music.', date: '2024-09-15', city: 'Bangalore', venue: 'The Starlight Club', category: 'Music',
        bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500', tickets: [{ name: 'General Admission', price: 1200, quantityAvailable: 200 }],
        status: 'active', hype: 450, isFeatured: true, createdBy: 'organizer@ticketsvilla.com'
    },
    {
        id: 'evt-2', title: 'Future of AI Conference', description: 'Leading minds in AI discuss the future of technology.', date: '2024-10-20', city: 'Mumbai', venue: 'Grand Expo Center', category: 'Tech',
        bannerImage: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=500', tickets: [{ name: 'Standard Pass', price: 2500, quantityAvailable: 500 }, { name: 'VIP Pass', price: 8000, quantityAvailable: 50 }],
        status: 'active', hype: 380, createdBy: 'admin@ticketsvilla.com'
    },
    {
        id: 'evt-3', title: 'Mumbai International Film Festival', description: 'A showcase of groundbreaking cinema from around the world.', date: '2024-11-05', city: 'Multiple Cities', venue: 'Multiple Theatres', category: 'Movies', genre: 'Drama', director: 'Various',
        bannerImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500', tickets: [], status: 'active', hype: 480, screenListings: {'thr-1': ['scr-1', 'scr-2'], 'thr-2': ['scr-3']},
        showtimes: [
            { id: 'st-1', theatreId: 'thr-1', screenId: 'scr-1', time: '10:00', availability: 'available', seatStatus: [] },
            { id: 'st-2', theatreId: 'thr-1', screenId: 'scr-1', time: '13:00', availability: 'fast_filling', seatStatus: [] },
            { id: 'st-3', theatreId: 'thr-1', screenId: 'scr-2', time: '11:00', availability: 'available', seatStatus: [] },
            { id: 'st-4', theatreId: 'thr-2', screenId: 'scr-3', time: '12:30', availability: 'sold_out', seatStatus: [] },
        ]
    },
     {
        id: 'evt-4', title: 'Sunburn Festival Mumbai', description: 'Asia\'s largest music festival is back in Mumbai.', date: '2024-12-28', city: 'Mumbai', venue: 'Jio World Garden', category: 'Music',
        bannerImage: 'https://images.unsplash.com/photo-1582711012103-58bd6b1928b1?w=500', tickets: [{ name: 'Phase 1 GA', price: 3500, quantityAvailable: 1000 }],
        status: 'active', hype: 495, isFeatured: true
    },
    {
        id: 'evt-5', title: 'Gourmet Food Gala', description: 'A paradise for food lovers with stalls from the best chefs.', date: '2024-09-22', city: 'Delhi', venue: 'NSIC Exhibition Ground', category: 'Food & Drink',
        bannerImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', tickets: [{ name: 'Entry Ticket', price: 500, quantityAvailable: 800 }],
        status: 'pending', hype: 250, createdBy: 'organizer@ticketsvilla.com'
    }
];

export const MOCK_BOOKINGS: EventBooking[] = [
    { id: 'booking-1', eventId: 'evt-1', paymentId: 'pi-1', bookingDate: '2024-07-20T10:00:00Z', userEmail: 'customer@ticketsvilla.com', bookedTickets: [{ name: 'General Admission', price: 1200, quantity: 2 }], totalPrice: 2400 },
    { id: 'booking-2', eventId: 'evt-3', showtimeId: 'st-2', showDate: '2024-11-06', paymentId: 'pi-2', bookingDate: '2024-07-21T11:30:00Z', userEmail: 'customer@ticketsvilla.com', bookedTickets: [{ name: 'Premium', price: 400, quantity: 1, seat: 'C5' }], totalPrice: 400, seats: ['2-4'] },
];

export const MOCK_PAYOUTS: PayoutRequest[] = [
    { id: 'payout-1', requesterId: 'evt-1', requesterType: 'event', amount: 200000, status: 'Completed', requestDate: '2024-07-15', processedDate: '2024-07-16' },
    { id: 'payout-2', requesterId: 'thr-2', requesterType: 'theatre', amount: 500000, status: 'Pending', requestDate: '2024-07-20' },
];

export const MOCK_VENUES: Venue[] = [
    {
        id: 'venue-1', name: 'Jio World Centre', address: 'G Block, Bandra Kurla Complex', city: 'Mumbai', capacity: 2000, amenities: ['Parking', 'Air Conditioning', 'Wi-Fi', 'Restrooms', 'Wheelchair Accessible'],
        bannerImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b6?w=500', description: 'A world-class convention and exhibition centre in the heart of Mumbai.',
        pricing: { perHour: 25000, fullDay: 200000 }, refundPolicy: 'Standard refund policy applies. 50% refund up to 30 days before the event.'
    },
    {
        id: 'venue-2', name: 'Manpho Convention Centre', address: 'Nagavara, Bengaluru', city: 'Bangalore', capacity: 5000, amenities: ['Parking', 'Stage', 'Sound System', 'Catering'],
        bannerImage: 'https://images.unsplash.com/photo-1511578194003-0624216d516a?w=500', description: 'A large, versatile venue suitable for concerts, exhibitions, and corporate events.',
        pricing: { perHour: 40000, fullDay: 350000 }, refundPolicy: 'Full refund if cancelled 60 days prior.'
    }
];

export const MOCK_VENUE_BOOKINGS: VenueBooking[] = [
    { id: 'vbooking-1', venueId: 'venue-1', paymentId: 'pi-v1', bookingDate: '2024-07-18T14:00:00Z', userEmail: 'organizer@ticketsvilla.com', bookedDate: '2024-10-20', bookingType: 'fullDay', totalPrice: 200000 }
];

export const MOCK_OFFERS: Offer[] = [
    { id: 'offer-1', title: 'Flat INR500 Off on Axis Bank Cards', details: 'Use your Axis Bank credit or debit card and get a flat INR500 discount on a minimum booking of 2 tickets.', type: 'card' },
    { id: 'offer-2', title: 'Student Discount: 15% Off', details: 'Verify your student ID to get a special 15% discount on your booking.', type: 'tag' },
];

export const MOCK_MOBILE_THEATRES: MobileTheatre[] = [
    {
        id: 'mt-1', name: 'Kohinoor Theatre', owner: 'Tapan Lahkar', season: '2024-2025', bannerImage: 'https://images.unsplash.com/photo-1594903328362-23e5a3296068?q=80&w=1974&auto=format&fit=crop&ixlib-rb-4.0.3&id=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: 'One of the oldest and most prestigious mobile theatre groups in Assam, known for its grand productions and star-studded cast.',
        tourPlan: [
            { location: 'Guwahati', venueName: 'Maligaon Field', startDate: '2024-08-15', endDate: '2024-09-15', showtimes: [{id: 'mts-1', date: '2024-08-20', time: '18:30', seatStatus:[]}] },
            { location: 'Jorhat', venueName: 'Jorhat Stadium', startDate: '2024-09-20', endDate: '2024-10-20', showtimes: [] },
        ]
    }
];

export const MOCK_ARTISTS: Artist[] = [
    {
        id: 'artist-1', name: 'Arijit Singh', userEmail: 'artist@ticketsvilla.com', genre: 'Singer', bookingFee: 5000000,
        photo: 'https://images.unsplash.com/photo-1620173834246-35e2a22a3047?w=500',
        description: 'Arijit Singh is an Indian singer and music composer. He is the recipient of several accolades including a National Film Award and seven Filmfare Awards.',
        showreelUrl: 'https://www.youtube.com/watch?v=609_tA0oAD0',
        gallery: [
            'https://images.unsplash.com/photo-1594995843021-750534062a6d?w=500',
            'https://images.unsplash.com/photo-1613130138945-0138596434d3?w=500',
            'https://images.unsplash.com/photo-1597230289128-a3375811634b?w=500',
            'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=500'
        ]
    },
     {
        id: 'artist-2', name: 'Sunidhi Chauhan', userEmail: 'sunidhi@email.com', genre: 'Singer', bookingFee: 4000000,
        photo: 'https://images.unsplash.com/photo-1588093413593-376a63584d85?w=500',
        description: 'Sunidhi Chauhan is an Indian playback singer. She is noted for her versatility and has been praised for her powerful voice.',
        showreelUrl: 'https://www.youtube.com/watch?v=609_tA0oAD0',
        gallery: []
    }
];

export const MOCK_ARTIST_BOOKINGS: ArtistBooking[] = [
    { id: 'art-book-1', artistId: 'artist-1', clientId: 'customer@ticketsvilla.com', requestDate: '2024-07-20', eventDate: '2024-12-31', eventVenue: 'Grand Palace, Mumbai', proposedFee: 5500000, status: 'pending_artist_approval'},
    { id: 'art-book-2', artistId: 'artist-1', clientId: 'organizer@ticketsvilla.com', requestDate: '2024-07-18', eventDate: '2025-01-15', eventVenue: 'Bangalore Open Air', proposedFee: 5000000, status: 'confirmed_by_artist'},
];