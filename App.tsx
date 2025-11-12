import React, { Suspense } from 'react';
import useAppLogic from './hooks/useAppLogic';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import EventList from './components/EventList.tsx';
// Lazy-load heavier views to reduce initial bundle size
const EventDetail = React.lazy(() => import('./components/EventDetail'));
import Login from './components/Login.tsx';
import MyBookings from './components/MyBookings.tsx';
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const TheatreManagerDashboard = React.lazy(() => import('./components/TheatreManagerDashboard'));
const ArtistDashboard = React.lazy(() => import('./components/ArtistDashboard'));
const ArtistProfile = React.lazy(() => import('./components/ArtistProfile'));
const VenueDetail = React.lazy(() => import('./components/VenueDetail'));
const MobileTheatreDetail = React.lazy(() => import('./components/MobileTheatreDetail'));
const BookingConfirmation = React.lazy(() => import('./components/BookingConfirmation'));

const App: React.FC = () => {
    const appState = useAppLogic();
    const { user, viewingArtistAsAdmin } = appState;

    const renderContent = () => {
        if (!appState.user) {
            return <Login onLogin={appState.handleLogin} />;
        }
        
        if (appState.confirmationData) {
            return <BookingConfirmation confirmation={appState.confirmationData} theatres={appState.theatres} onBack={appState.handleBackToList} />;
        }

        switch (appState.activeView) {
            case 'event_detail':
                return appState.selectedEvent && <EventDetail event={appState.selectedEvent} user={appState.user} theatres={appState.theatres} onBack={appState.handleBackToList} onBookingSuccess={appState.handleAddBooking} offers={appState.offers} globalSettings={appState.globalSettings} />;
            case 'venue_detail':
                return appState.selectedVenue && <VenueDetail venue={appState.selectedVenue} user={appState.user} venueBookings={appState.venueBookings} onBack={appState.handleBackToList} onBookingSuccess={appState.handleAddVenueBooking} globalSettings={appState.globalSettings} />;
            case 'mobile_theatre_detail':
                return appState.selectedMobileTheatre && <MobileTheatreDetail theatre={appState.selectedMobileTheatre} onBack={appState.handleBackToList} onStartBooking={appState.handleStartMobileTheatreBooking} />;
            case 'artist_profile':
                return appState.selectedArtist && <ArtistProfile artist={appState.selectedArtist} user={appState.user} onBack={appState.handleBackToList} onInitiateBooking={appState.handleInitiateArtistBooking} />;
            case 'my_bookings':
                return <MyBookings user={appState.user} bookings={appState.bookings} venueBookings={appState.venueBookings} artistBookings={appState.artistBookings} events={appState.events} venues={appState.venues} mobileTheatres={appState.mobileTheatres} artists={appState.artists} onViewDetails={appState.handleViewBookingDetails} onPayForArtistBooking={appState.handlePayForArtistBooking} />;
            case 'admin':
                return <AdminDashboard {...appState} />;
            case 'theatre_manager':
// FIX: Pass globalSettings to TheatreManagerDashboard
                return <TheatreManagerDashboard user={appState.user} theatres={appState.theatres} events={appState.events} bookings={appState.bookings} onSaveEvent={appState.onSaveEvent} onAddBooking={appState.handleAddBooking} globalSettings={appState.globalSettings} />;
            case 'artist_dashboard':
                 const artistUser = viewingArtistAsAdmin || user;
                 return <ArtistDashboard user={artistUser!} artists={appState.artists} artistBookings={appState.artistBookings} payoutRequests={appState.payoutRequests} onBookingResponse={appState.handleArtistBookingResponse} onRequestPayout={appState.handleRequestPayout} globalSettings={appState.globalSettings} />;
            case 'event_list':
            default:
                return <EventList events={appState.filteredEvents} venues={appState.filteredVenues} mobileTheatres={appState.filteredMobileTheatres} artists={appState.filteredArtists} unfilteredEvents={appState.events} onSelectEvent={appState.handleSelectEvent} onSelectVenue={appState.handleSelectVenue} onSelectMobileTheatre={appState.handleSelectMobileTheatre} onSelectArtist={appState.handleSelectArtist} selectedCity={appState.selectedCity} onSelectCity={appState.handleSelectCity} searchQuery={appState.searchQuery} onSearchQueryChange={appState.handleSearchQueryChange} activeFilters={appState.activeFilters} onActiveFiltersChange={appState.handleActiveFiltersChange} displayMode={appState.displayMode} categoryVisibility={appState.categoryVisibility} />;
        }
    };

    return (
        <div className="bg-zinc-950 text-white min-h-screen">
            <Header user={appState.user} onNavigate={appState.handleNavigate} onCreateEvent={() => {}} categoryVisibility={appState.categoryVisibility} activeView={appState.activeView} displayMode={appState.displayMode} viewingArtistAsAdmin={appState.viewingArtistAsAdmin} onExitArtistDashboardView={appState.handleExitArtistDashboardView}/>
            <main className="container mx-auto px-4 py-8">
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    {renderContent()}
                </Suspense>
            </main>
            <Footer user={appState.user} onNavigate={appState.handleNavigate} onCreateEvent={() => {}} />
        </div>
    );
};

export default App;