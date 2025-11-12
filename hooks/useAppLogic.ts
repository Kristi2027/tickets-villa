import { useState, useEffect, useMemo } from 'react';
import { 
    User, Event, Theatre, EventBooking, VenueBooking, PayoutRequest, Venue, Offer, 
    AdminTab, MobileTheatre, Artist, ArtistBooking, ActiveFilters, DisplayMode, ConfirmationData, GuestDetails, Showtime, TourStop, MobileShowtime, AppView, GlobalSettings
} from '../types.ts';
import { 
    MOCK_USERS, MOCK_EVENTS, MOCK_THEATRES, MOCK_BOOKINGS, MOCK_PAYOUTS, MOCK_VENUES, 
    MOCK_VENUE_BOOKINGS, MOCK_OFFERS, MOCK_MOBILE_THEATRES, MOCK_ARTISTS, MOCK_ARTIST_BOOKINGS 
} from '../mockData';

export default function useAppLogic() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [theatres, setTheatres] = useState<Theatre[]>(MOCK_THEATRES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [mobileTheatres, setMobileTheatres] = useState<MobileTheatre[]>(MOCK_MOBILE_THEATRES);
  const [artists, setArtists] = useState<Artist[]>(MOCK_ARTISTS);
  const [bookings, setBookings] = useState<EventBooking[]>(MOCK_BOOKINGS);
  const [venueBookings, setVenueBookings] = useState<VenueBooking[]>(MOCK_VENUE_BOOKINGS);
  const [artistBookings, setArtistBookings] = useState<ArtistBooking[]>(MOCK_ARTIST_BOOKINGS);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(MOCK_PAYOUTS);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    gstRate: 18,
    platformFeeRate: 5,
    serviceChargeRate: 2,
    paymentGatewaySettings: {
        upiId: 'eventsphere@okhdfcbank',
        razorpayKeyId: '',
        stripePublicKey: '',
    }
  });

  const [activeView, setActiveView] = useState<AppView>('event_list');
  const [activeTab, setActiveTab] = useState<AdminTab>('approvals');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedMobileTheatre, setSelectedMobileTheatre] = useState<MobileTheatre | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [viewingArtistAsAdmin, setViewingArtistAsAdmin] = useState<User | null>(null);

  // Filtering and Search State
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ category: '', genre: '', actor: '', director: '', minCapacity: 0, amenities: [] });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('events');
  const [categoryVisibility, setCategoryVisibility] = useState({ events: true, movies: true, venues: true, mobileTheatres: true, artists: true });

    // --- NAVIGATION GUARD ---
  useEffect(() => {
    const validViews: (DisplayMode | AppView)[] = ['my_bookings', 'admin', 'theatre_manager', 'artist_dashboard'];
    if (categoryVisibility.events) validViews.push('events');
    if (categoryVisibility.movies) validViews.push('movies');
    if (categoryVisibility.venues) validViews.push('venues');
    if (categoryVisibility.mobileTheatres) validViews.push('mobileTheatres');
    if (categoryVisibility.artists) validViews.push('artists');

    const currentViewIsCategory = ['events', 'movies', 'venues', 'mobileTheatres', 'artists'].includes(displayMode);
    
    // If the current category view is now hidden, redirect
    if (activeView === 'event_list' && currentViewIsCategory && !validViews.includes(displayMode)) {
      const firstAvailable = (['events', 'movies', 'venues', 'mobileTheatres', 'artists'] as DisplayMode[]).find(mode => categoryVisibility[mode]);
      if (firstAvailable) {
        setDisplayMode(firstAvailable);
      } else {
        // No categories are visible, maybe default to user bookings if logged in
        if (user) handleNavigate('my_bookings');
      }
    }
  }, [categoryVisibility, displayMode, activeView, user]);

  // --- DERIVED STATE & FILTERS ---
  const { filteredEvents, filteredVenues, filteredMobileTheatres, filteredArtists } = useMemo(() => {
    let fEvents = events.filter(e => e.status === 'active');
    let fVenues = venues;
    let fMobileTheatres = mobileTheatres;
    let fArtists = artists;

    if (selectedCity) {
        fEvents = fEvents.filter(e => e.city === selectedCity);
        fVenues = fVenues.filter(v => v.city === selectedCity);
        fMobileTheatres = fMobileTheatres.filter(mt => mt.tourPlan.some(stop => stop.location === selectedCity));
    }

    if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        fEvents = fEvents.filter(e => e.title.toLowerCase().includes(sq) || e.category.toLowerCase().includes(sq) || e.city.toLowerCase().includes(sq));
        fVenues = fVenues.filter(v => v.name.toLowerCase().includes(sq) || v.city.toLowerCase().includes(sq));
        fMobileTheatres = fMobileTheatres.filter(mt => mt.name.toLowerCase().includes(sq) || mt.owner.toLowerCase().includes(sq));
        fArtists = fArtists.filter(a => a.name.toLowerCase().includes(sq) || a.genre.toLowerCase().includes(sq));
    }

    // Apply active filters
    if (displayMode === 'events' && activeFilters.category) {
        fEvents = fEvents.filter(e => e.category === activeFilters.category);
    }
    if (displayMode === 'movies') {
        if (activeFilters.genre) fEvents = fEvents.filter(e => e.genre === activeFilters.genre);
        if (activeFilters.actor) fEvents = fEvents.filter(e => e.actors?.some(a => a.toLowerCase().includes(activeFilters.actor.toLowerCase())));
        if (activeFilters.director) fEvents = fEvents.filter(e => e.director?.toLowerCase().includes(activeFilters.director.toLowerCase()));
    }
    if (displayMode === 'venues') {
        if (activeFilters.minCapacity > 0) fVenues = fVenues.filter(v => v.capacity >= activeFilters.minCapacity);
        if (activeFilters.amenities.length > 0) {
            fVenues = fVenues.filter(v => activeFilters.amenities.every(a => v.amenities.includes(a)));
        }
    }
    
    // Filter events by display mode
    if (displayMode === 'movies') {
        fEvents = fEvents.filter(e => e.category === 'Movies');
    } else if (displayMode === 'events') {
        fEvents = fEvents.filter(e => e.category !== 'Movies');
    }

    return { filteredEvents: fEvents, filteredVenues: fVenues, filteredMobileTheatres: fMobileTheatres, filteredArtists: fArtists };
  }, [events, venues, mobileTheatres, artists, selectedCity, searchQuery, activeFilters, displayMode]);

  // --- HANDLERS ---
  const handleLogin = (userToLogin: User) => setUser(userToLogin);
  const handleSelectEvent = (event: Event) => { setSelectedEvent(event); setActiveView('event_detail'); };
  const handleSelectVenue = (venue: Venue) => { setSelectedVenue(venue); setActiveView('venue_detail'); };
  const handleSelectMobileTheatre = (theatre: MobileTheatre) => { setSelectedMobileTheatre(theatre); setActiveView('mobile_theatre_detail'); };
  const handleSelectArtist = (artist: Artist) => { setSelectedArtist(artist); setActiveView('artist_profile'); };
  const handleBackToList = () => {
    setActiveView('event_list');
    setSelectedEvent(null);
    setSelectedVenue(null);
    setSelectedMobileTheatre(null);
    setSelectedArtist(null);
    setConfirmationData(null);
  };
  
  const handleNavigate = (view: string, tab?: string) => {
    handleBackToList(); // Reset selections
    
    // Handle display mode changes
    const categoryViews = ['events', 'movies', 'venues', 'mobileTheatres', 'artists'];
    if (categoryViews.includes(view)) {
        // Navigation Guard
        if (!categoryVisibility[view as keyof typeof categoryVisibility]) {
            // Find the first available category and navigate to it instead
            const firstAvailable = (categoryViews as DisplayMode[]).find(mode => categoryVisibility[mode]);
            if (firstAvailable) {
                setDisplayMode(firstAvailable);
                setActiveView('event_list');
            }
            return; // Block navigation if no categories are visible
        }
      setDisplayMode(view as DisplayMode);
      setActiveView('event_list');
    } else {
      setActiveView(view as AppView);
    }

    if (tab && (view === 'admin')) {
        setActiveTab(tab as AdminTab);
    }
  };

  const handleAddBooking = (bookingData: Omit<EventBooking, 'id' | 'paymentId'>, guestDetails?: GuestDetails): EventBooking => {
      const newBooking: EventBooking = {
          ...bookingData,
          id: `booking-${Date.now()}`,
          paymentId: `pi_${Date.now()}`,
          guestDetails: guestDetails,
      };
      setBookings(prev => [...prev, newBooking]);
      
      const event = events.find(e => e.id === newBooking.eventId);
      const mobileTheatre = mobileTheatres.find(mt => mt.id === newBooking.eventId);

      if (mobileTheatre) {
        const tourStop = mobileTheatre.tourPlan.find(ts => ts.showtimes?.some(st => st.id === newBooking.showtimeId));
        if (tourStop) {
            setConfirmationData({ type: 'mobile_theatre', data: { ...newBooking, theatre: mobileTheatre, tourStop }});
        }
      } else if (event) {
          setConfirmationData({ type: 'event', data: { ...newBooking, event } });
      }
      setActiveView('confirmation');
      return newBooking;
  };
  
  const handleAddVenueBooking = (bookingData: Omit<VenueBooking, 'id' | 'paymentId'>, guestDetails?: GuestDetails) => {
      const newBooking: VenueBooking = {
          ...bookingData,
          id: `vbooking-${Date.now()}`,
          paymentId: `pi_v_${Date.now()}`,
          guestDetails: guestDetails,
      };
      setVenueBookings(prev => [...prev, newBooking]);
      const venue = venues.find(v => v.id === newBooking.venueId);
      if(venue) {
          setConfirmationData({ type: 'venue', data: { ...newBooking, venue } });
          setActiveView('confirmation');
      }
  };
  
  const handleStartMobileTheatreBooking = (theatre: MobileTheatre, tourStop: TourStop, showtime: MobileShowtime) => {
    const syntheticEvent: Event = {
        ...theatre,
        id: theatre.id,
        title: theatre.name,
        date: showtime.date,
        category: 'Movies', // Treat as movie for seating logic
        venue: tourStop.venueName,
        city: tourStop.location,
        tickets: [],
        hype: 0,
        status: 'active',
        showtimes: tourStop.showtimes?.map(st => ({
            ...st,
            theatreId: theatre.id,
            screenId: 'main_screen',
            availability: 'available',
        })) as Showtime[],
    };
    const syntheticTheatre: Theatre = {
        id: theatre.id,
        name: theatre.name,
        city: tourStop.location,
        screens: [{
            id: 'main_screen',
            name: 'Main Stage',
            seatLayout: tourStop.seatLayout!,
        }],
    };
    const syntheticShowtime: Showtime = {
        ...showtime,
        theatreId: theatre.id,
        screenId: 'main_screen',
        availability: 'available',
    };
    setSelectedEvent(syntheticEvent);
    // In a real app, you'd navigate to a dedicated mobile theatre seat selection view.
    // For now, we reuse the existing one by creating synthetic data.
    // This is a simplified way to handle it without a major refactor.
    console.log("Starting booking for mobile theatre with synthetic data.");
  };

  const handleInitiateArtistBooking = (artist: Artist, bookingDetails: Omit<ArtistBooking, 'id' | 'artistId' | 'clientId' | 'status'>) => {
      if (!user) { alert("You must be logged in to book an artist."); return; }
      const newRequest: ArtistBooking = {
          ...bookingDetails,
          id: `art-book-${Date.now()}`,
          artistId: artist.id,
          clientId: user.email,
          status: 'pending_artist_approval',
      };
      setArtistBookings(prev => [...prev, newRequest]);
      alert(`Request to book ${artist.name} has been sent!`);
      handleNavigate('my_bookings');
  };

  const handleViewBookingDetails = (bookingId: string, type: 'event' | 'venue' | 'mobile_theatre' | 'artist_booking') => {
      if (type === 'venue') {
          const booking = venueBookings.find(b => b.id === bookingId);
          const venue = venues.find(v => v.id === booking?.venueId);
          if (booking && venue) {
              setConfirmationData({ type: 'venue', data: { ...booking, venue } });
              setActiveView('confirmation');
          }
      } else if (type === 'artist_booking') {
          const booking = artistBookings.find(b => b.id === bookingId);
          const artist = artists.find(a => a.id === booking?.artistId);
          if (booking && artist) {
              setConfirmationData({ type: 'artist_booking', data: { ...booking, artist } });
              setActiveView('confirmation');
          }
      } else { // 'event' or 'mobile_theatre'
          const booking = bookings.find(b => b.id === bookingId);
          if (!booking) return;

          if (type === 'mobile_theatre') {
            const mobileTheatre = mobileTheatres.find(mt => mt.id === booking.eventId);
            const tourStop = mobileTheatre?.tourPlan.find(ts => ts.showtimes?.some(st => st.id === booking.showtimeId));
            if (mobileTheatre && tourStop) {
                setConfirmationData({ type: 'mobile_theatre', data: { ...booking, theatre: mobileTheatre, tourStop }});
                setActiveView('confirmation');
                return;
            }
          }
          
          const event = events.find(e => e.id === booking.eventId);
          if (event) {
              setConfirmationData({ type: 'event', data: { ...booking, event } });
              setActiveView('confirmation');
          }
      }
  };

  const handlePayForArtistBooking = (bookingId: string) => {
      const booking = artistBookings.find(b => b.id === bookingId);
      const artist = artists.find(a => a.id === booking?.artistId);
      if (!booking || !artist) return;

      setArtistBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'paid', paymentId: `pi_art_${Date.now()}` } : b));
      setConfirmationData({ type: 'artist_booking', data: { ...booking, status: 'paid', artist } });
      setActiveView('confirmation');
  };

  // Filter/Search Handlers
  const handleSelectCity = (city: string | null) => setSelectedCity(city);
  const handleSearchQueryChange = (query: string) => setSearchQuery(query);
  const handleActiveFiltersChange = (filters: ActiveFilters) => setActiveFilters(filters);
  const handleToggleCategoryVisibility = (category: 'events' | 'movies' | 'venues' | 'mobileTheatres' | 'artists') => {
    setCategoryVisibility(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Admin/Manager Handlers
  const handleEventApproval = (eventId: string, status: 'active' | 'rejected') => setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status } : e));
  const handleSaveEvent = (event: Event) => {
    setEvents(prev => {
        if (event.id) { // Existing event
            return prev.map(e => e.id === event.id ? event : e);
        } else { // New event
            return [...prev, { ...event, id: `evt-${Date.now()}`, createdBy: user?.email, status: 'active', hype: Math.floor(Math.random() * 100) }];
        }
    });
  };
  const handleDeleteEvent = (eventId: string) => setEvents(prev => prev.filter(e => e.id !== eventId));
  const handleSaveTheatres = (updatedTheatres: Theatre[]) => setTheatres(updatedTheatres);
  const handleSaveUser = (userToSave: User) => {
    setUsers(prev => {
        if (userToSave.id) { // Existing user
            return prev.map(u => u.id === userToSave.id ? { ...u, ...userToSave, password: u.password } : u);
        } else { // New user
            return [...prev, { ...userToSave, id: `user-${Date.now()}` }];
        }
    });
  };
  const handleDeleteUser = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));
  const handleProcessPayout = (requestId: string) => {
      setPayoutRequests(prev => prev.map(p => p.id === requestId ? { ...p, status: 'Completed', processedDate: new Date().toISOString() } : p));
  };
  const handleSaveVenue = (venue: Venue) => {
    setVenues(prev => {
        if (venue.id) { return prev.map(v => v.id === venue.id ? venue : v); }
        return [...prev, { ...venue, id: `venue-${Date.now()}` }];
    });
  };
  const handleDeleteVenue = (venueId: string) => setVenues(prev => prev.filter(v => v.id !== venueId));
  const handleSaveMobileTheatre = (theatre: MobileTheatre) => {
    setMobileTheatres(prev => {
        if (theatre.id) { return prev.map(t => t.id === theatre.id ? theatre : t); }
        return [...prev, { ...theatre, id: `mt-${Date.now()}` }];
    });
  };
  const handleDeleteMobileTheatre = (theatreId: string) => setMobileTheatres(prev => prev.filter(t => t.id !== theatreId));
  const handleSaveOffer = (offer: Offer) => {
    setOffers(prev => {
        if (offer.id) { return prev.map(o => o.id === offer.id ? offer : o); }
        return [...prev, { ...offer, id: `offer-${Date.now()}` }];
    });
  };
  const handleDeleteOffer = (offerId: string) => setOffers(prev => prev.filter(o => o.id !== offerId));
  const handleSaveArtist = (artist: Artist) => {
    setArtists(prev => {
        if (artist.id) { return prev.map(a => a.id === artist.id ? artist : a); }
        return [...prev, { ...artist, id: `artist-${Date.now()}` }];
    });
  };
  const handleDeleteArtist = (artistId: string) => setArtists(prev => prev.filter(a => a.id !== artistId));

  // Artist Handlers
  const handleArtistBookingResponse = (bookingId: string, response: 'confirm' | 'reject') => {
      const newStatus = response === 'confirm' ? 'confirmed_by_artist' : 'rejected_by_artist';
      setArtistBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };
  const handleRequestPayout = (requesterId: string, amount: number) => {
      if (amount <= 0) {
          alert("No balance available for payout.");
          return;
      }
      const newRequest: PayoutRequest = {
          id: `payout-${Date.now()}`,
          requesterId,
          requesterType: 'artist',
          amount,
          status: 'Pending',
          requestDate: new Date().toISOString(),
      };
      setPayoutRequests(prev => [...prev, newRequest]);
      alert(`Payout of ₹${amount.toLocaleString('en-IN')} requested successfully.`);
  };

  const handleSaveSettings = (newSettings: GlobalSettings) => {
    setGlobalSettings(newSettings);
    alert('Settings saved successfully!');
  };

  // Impersonation
  const handleViewArtistDashboard = (artist: Artist) => {
      const artistUser = users.find(u => u.email === artist.userEmail);
      if (artistUser) {
          setViewingArtistAsAdmin(artistUser);
          setActiveView('artist_dashboard');
      } else {
          alert("Could not find the user account associated with this artist.");
      }
  };
  const handleExitArtistDashboardView = () => {
      setViewingArtistAsAdmin(null);
      setActiveView('admin');
      setActiveTab('artists');
  };

  return {
    // State
    user,
    events,
    theatres,
    users,
    venues,
    mobileTheatres,
    artists,
    bookings,
    venueBookings,
    artistBookings,
    payoutRequests,
    offers,
    globalSettings,
    activeView,
    activeTab,
    selectedEvent,
    selectedVenue,
    selectedMobileTheatre,
    selectedArtist,
    confirmationData,
    viewingArtistAsAdmin,
    selectedCity,
    searchQuery,
    activeFilters,
    displayMode,
    categoryVisibility,
    // Derived state
    filteredEvents,
    filteredVenues,
    filteredMobileTheatres,
    filteredArtists,
    // Handlers
    handleLogin,
    handleNavigate,
    handleBackToList,
    handleSelectCity,
    handleSearchQueryChange,
    handleActiveFiltersChange,
    // Event/Item selection
    handleSelectEvent,
    handleSelectVenue,
    handleSelectMobileTheatre,
    handleSelectArtist,
    // Booking Handlers
    handleAddBooking,
    handleAddVenueBooking,
    handleStartMobileTheatreBooking,
    handleInitiateArtistBooking,
    handleViewBookingDetails,
    handlePayForArtistBooking,
    // Admin/Manager Handlers - aliased for components
    onSaveEvent: handleSaveEvent,
    onDeleteEvent: handleDeleteEvent,
    onSaveTheatres: handleSaveTheatres,
    onSaveUser: handleSaveUser,
    onDeleteUser: handleDeleteUser,
    onEventApproval: handleEventApproval,
    onProcessPayout: handleProcessPayout,
    onSaveVenue: handleSaveVenue,
    onDeleteVenue: handleDeleteVenue,
    onSaveMobileTheatre: handleSaveMobileTheatre,
    onDeleteMobileTheatre: handleDeleteMobileTheatre,
    onSaveOffer: handleSaveOffer,
    onDeleteOffer: handleDeleteOffer,
    onSaveArtist: handleSaveArtist,
    onDeleteArtist: handleDeleteArtist,
    onToggleCategoryVisibility: handleToggleCategoryVisibility,
    onAddBooking: handleAddBooking,
    onTabChange: setActiveTab,
    onViewArtistDashboard: handleViewArtistDashboard,
    onSaveSettings: handleSaveSettings,
    // Artist Handlers
    handleArtistBookingResponse,
    handleRequestPayout,
    // Impersonation
    handleExitArtistDashboardView,
  };
}