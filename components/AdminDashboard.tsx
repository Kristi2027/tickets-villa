import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User, Event, Theatre, EventBooking, PayoutRequest, Venue, Offer, AdminTab, MobileTheatre, Artist, GlobalSettings } from '../types.ts';
import EventManagement from './EventManagement.tsx';
import MovieManagement from './Dashboard.tsx';
import UserManagement from './UserManagement.tsx';
import TheatreManagement from './TheatreManagement.tsx';
import MobileTheatreManagement from './MobileTheatreManagement.tsx';
import ArtistManagement from './ArtistManagement.tsx';
import PayoutManagement from './PayoutManagement.tsx';
import EventApproval from './EventApproval.tsx';
import VenueManagement from './VenueManagement.tsx';
import OfferManagement from './OfferManagement.tsx';
import AccessControlSettings from './AccessControlSettings.tsx';
import AdminEventDetail from './AdminEventDetail.tsx';
import AdminTheatreDetail from './AdminTheatreDetail.tsx';
import AdminVenueDetail from './AdminVenueDetail.tsx';
import PendingEventDetailModal from './PendingEventDetailModal.tsx';
import EventForm from './EventForm.tsx';

const BoxOffice = lazy(() => import('./BoxOffice.tsx'));

interface AdminDashboardProps {
    user: User | null;
    events: Event[];
    theatres: Theatre[];
    users: User[];
    venues: Venue[];
    mobileTheatres: MobileTheatre[];
    artists: Artist[];
    bookings: EventBooking[];
    payoutRequests: PayoutRequest[];
    offers: Offer[];
    categoryVisibility: { events: boolean; movies: boolean; venues: boolean; mobileTheatres: boolean; artists: boolean; };
    globalSettings: GlobalSettings;
    onSaveEvent: (event: Event) => void;
    onDeleteEvent: (eventId: string) => void;
    onSaveTheatres: (theatres: Theatre[]) => void;
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onEventApproval: (eventId: string, status: 'active' | 'rejected') => void;
    onProcessPayout: (requestId: string) => void;
    onSaveVenue: (venue: Venue) => void;
    onDeleteVenue: (venueId: string) => void;
    onSaveMobileTheatre: (theatre: MobileTheatre) => void;
    onDeleteMobileTheatre: (theatreId: string) => void;
    onSaveOffer: (offer: Offer) => void;
    onDeleteOffer: (offerId: string) => void;
    onSaveArtist: (artist: Artist) => void;
    onDeleteArtist: (artistId: string) => void;
    onToggleCategoryVisibility: (category: 'events' | 'movies' | 'venues' | 'mobileTheatres' | 'artists') => void;
    onSaveSettings: (settings: GlobalSettings) => void;
    onAddBooking: (booking: Omit<EventBooking, 'id' | 'paymentId'>) => EventBooking;
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    onViewArtistDashboard: (artist: Artist) => void;
}

type AdminView = 'dashboard' | 'event_detail' | 'theatre_detail' | 'venue_detail' | 'pending_event_detail' | 'event_form';

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


const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [view, setView] = useState<AdminView>('dashboard');
    const { activeTab, onTabChange } = props;
    const [selectedItem, setSelectedItem] = useState<Event | Theatre | Venue | null>(null);

    const handleSelectEvent = (event: Event) => {
        setSelectedItem(event);
        setView('event_detail');
    };
    
    const handleViewPendingEvent = (event: Event) => {
        setSelectedItem(event);
        setView('pending_event_detail');
    };

    const handleEditPendingEvent = (event: Event) => {
        setSelectedItem(event);
        setView('event_form');
    };
    
    const handleSelectTheatre = (theatre: Theatre) => {
        setSelectedItem(theatre);
        setView('theatre_detail');
    };
    
    const handleSelectVenue = (venue: Venue) => {
        setSelectedItem(venue);
        setView('venue_detail');
    };

    const handleBackToDashboard = () => {
        setSelectedItem(null);
        setView('dashboard');
    };

    const renderContent = () => {
        switch(view) {
            case 'event_detail':
                return <AdminEventDetail event={selectedItem as Event} users={props.users} bookings={props.bookings} payoutRequests={props.payoutRequests} onProcessPayout={props.onProcessPayout} onBack={handleBackToDashboard} />
            case 'theatre_detail':
                return <AdminTheatreDetail theatre={selectedItem as Theatre} users={props.users} events={props.events} bookings={props.bookings} payoutRequests={props.payoutRequests} onProcessPayout={props.onProcessPayout} onBack={handleBackToDashboard} />
            case 'venue_detail':
                return <AdminVenueDetail venue={selectedItem as Venue} bookings={[]} onBack={handleBackToDashboard} />;
            case 'pending_event_detail':
                 return <PendingEventDetailModal
                    event={selectedItem as Event}
                    onApprove={(id) => { props.onEventApproval(id, 'active'); handleBackToDashboard(); }}
                    onReject={(id) => { props.onEventApproval(id, 'rejected'); handleBackToDashboard(); }}
                    onClose={handleBackToDashboard}
                 />
             case 'event_form':
                const eventToEdit = selectedItem as Event | null;
                return <EventForm
                    event={eventToEdit}
                    theatres={props.theatres}
                    onSave={(event) => {
                        props.onSaveEvent(event);
                        handleBackToDashboard();
                    }}
                    onCancel={handleBackToDashboard}
                    initialCategory={eventToEdit?.category === 'Movies' ? 'Movies' : 'Events'}
                />;
            case 'dashboard':
            default:
                switch(activeTab) {
                    case 'events': return <EventManagement events={props.events} theatres={props.theatres} onSelectEvent={handleSelectEvent} onSaveEvent={props.onSaveEvent} onDeleteEvent={props.onDeleteEvent} />;
                    case 'movies': return <MovieManagement events={props.events} theatres={props.theatres} onSelectEvent={handleSelectEvent} onSaveEvent={props.onSaveEvent} onDeleteEvent={props.onDeleteEvent} />;
                    case 'venues': return <VenueManagement venues={props.venues} onSelectVenue={handleSelectVenue} onSaveVenue={props.onSaveVenue} onDeleteVenue={props.onDeleteVenue} />;
                    case 'theatres': return <TheatreManagement initialTheatres={props.theatres} onSaveTheatres={props.onSaveTheatres} />;
                    case 'mobileTheatres': return <MobileTheatreManagement mobileTheatres={props.mobileTheatres} onSaveMobileTheatre={props.onSaveMobileTheatre} onDeleteMobileTheatre={props.onDeleteMobileTheatre} />;
                    case 'artists': return <ArtistManagement artists={props.artists} onSaveArtist={props.onSaveArtist} onDeleteArtist={props.onDeleteArtist} onViewArtistDashboard={props.onViewArtistDashboard} />;
                    case 'users': return <UserManagement users={props.users} theatres={props.theatres} onSaveUser={props.onSaveUser} onDeleteUser={props.onDeleteUser} />;
                    case 'payouts': return <PayoutManagement payoutRequests={props.payoutRequests} events={props.events} theatres={props.theatres} artists={props.artists} bookings={props.bookings} onProcessPayout={props.onProcessPayout} globalSettings={props.globalSettings} />;
                    case 'offers': return <OfferManagement offers={props.offers} onSaveOffer={props.onSaveOffer} onDeleteOffer={props.onDeleteOffer} />;
                    case 'settings': return <AccessControlSettings categoryVisibility={props.categoryVisibility} onToggleCategoryVisibility={props.onToggleCategoryVisibility} globalSettings={props.globalSettings} onSaveSettings={props.onSaveSettings} />;
                    case 'boxoffice':
                        return (
                            <Suspense fallback={<div>Loading Box Office...</div>}>
                                <BoxOffice
                                    events={props.events}
                                    theatres={props.theatres}
                                    bookings={props.bookings}
                                    onAddBooking={props.onAddBooking}
                                    user={props.user}
// FIX: Pass globalSettings to BoxOffice
                                    globalSettings={props.globalSettings}
                                />
                            </Suspense>
                        );
                    case 'approvals':
                    default:
                        return <EventApproval 
                            pendingEvents={props.events.filter(e => e.status === 'pending')} 
                            onEventApproval={props.onEventApproval} 
                            onViewEvent={handleViewPendingEvent}
                            onEditEvent={handleEditPendingEvent}
                        />;
                }
        }
    };

    return (
        <div>
            {view === 'dashboard' && (
                <>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Admin Dashboard</h2>
                    <p className="text-slate-400 mt-1">Manage all aspects of the Tickets Villa platform.</p>
                    <div className="flex flex-wrap gap-2 my-8 border-b border-slate-800 pb-4">
                        <TabButton isActive={activeTab === 'approvals'} onClick={() => onTabChange('approvals')}>Approvals</TabButton>
                        <TabButton isActive={activeTab === 'events'} onClick={() => onTabChange('events')}>Events</TabButton>
                        <TabButton isActive={activeTab === 'movies'} onClick={() => onTabChange('movies')}>Movies</TabButton>
                        <TabButton isActive={activeTab === 'venues'} onClick={() => onTabChange('venues')}>Venues</TabButton>
                        <TabButton isActive={activeTab === 'theatres'} onClick={() => onTabChange('theatres')}>Theatres</TabButton>
                        <TabButton isActive={activeTab === 'mobileTheatres'} onClick={() => onTabChange('mobileTheatres')}>Mobile Theatres</TabButton>
                        <TabButton isActive={activeTab === 'artists'} onClick={() => onTabChange('artists')}>Artists</TabButton>
                        <TabButton isActive={activeTab === 'users'} onClick={() => onTabChange('users')}>Users</TabButton>
                        <TabButton isActive={activeTab === 'payouts'} onClick={() => onTabChange('payouts')}>Payouts</TabButton>
                        <TabButton isActive={activeTab === 'offers'} onClick={() => onTabChange('offers')}>Offers</TabButton>
                        <TabButton isActive={activeTab === 'boxoffice'} onClick={() => onTabChange('boxoffice')}>Box Office</TabButton>
                        <TabButton isActive={activeTab === 'settings'} onClick={() => onTabChange('settings')}>Settings</TabButton>
                    </div>
                </>
            )}
            {renderContent()}
        </div>
    );
};

export default AdminDashboard;