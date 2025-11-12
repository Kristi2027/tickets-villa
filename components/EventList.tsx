import React, { useState } from 'react';
import { Event, ActiveFilters, Venue, MobileTheatre, Artist } from '../types.ts';
import { DisplayMode } from '../types.ts';
import EventCard from './EventCard.tsx';
import VenueCard from './VenueCard.tsx';
import MobileTheatreCard from './MobileTheatreCard.tsx';
import ArtistCard from './ArtistCard.tsx';
import Banner from './Banner.tsx';
import HorizontalEventScroller from './HorizontalEventScroller.tsx';
import SearchAndFilter from './SearchAndFilter.tsx';
import EventQuickViewModal from './EventQuickViewModal.tsx';

interface EventListProps {
  events: Event[];
  venues: Venue[];
  mobileTheatres: MobileTheatre[];
  artists: Artist[];
  unfilteredEvents: Event[];
  onSelectEvent: (event: Event) => void;
  onSelectVenue: (venue: Venue) => void;
  onSelectMobileTheatre: (theatre: MobileTheatre) => void;
  onSelectArtist: (artist: Artist) => void;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  activeFilters: ActiveFilters;
  onActiveFiltersChange: (filters: ActiveFilters) => void;
  displayMode: DisplayMode;
  categoryVisibility: { events: boolean; movies: boolean; venues: boolean; mobileTheatres: boolean; artists: boolean; };
}

const EventList: React.FC<EventListProps> = ({ 
  events,
  venues, 
  mobileTheatres,
  artists,
  unfilteredEvents, 
  onSelectEvent,
  onSelectVenue,
  onSelectMobileTheatre,
  onSelectArtist,
  selectedCity, 
  onSelectCity,
  searchQuery,
  onSearchQueryChange,
  activeFilters,
  onActiveFiltersChange,
  displayMode,
  categoryVisibility,
}) => {
  const [quickViewEvent, setQuickViewEvent] = useState<Event | null>(null);
  const now = new Date();
  
  const movieEvents = unfilteredEvents.filter(e => e.category === 'Movies');
  const nowShowingMovies = movieEvents.filter(e => new Date(e.date) <= now).sort((a,b) => b.hype - a.hype);
  const upcomingMovies = movieEvents.filter(e => new Date(e.date) > now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nonMovieEvents = unfilteredEvents.filter(e => e.category !== 'Movies');
  const recommendedEvents = nonMovieEvents.sort((a, b) => b.hype - a.hype).slice(0, 10);
  const topMusicEvents = nonMovieEvents.filter(e => e.category === 'Music').sort((a,b) => b.hype - a.hype).slice(0,10);

  const isFiltered = searchQuery || selectedCity || activeFilters.category || activeFilters.genre || activeFilters.actor || activeFilters.director || activeFilters.minCapacity > 0 || activeFilters.amenities.length > 0;

  const getTitle = () => {
    if (isFiltered) return 'Search Results';
    if (displayMode === 'movies' && categoryVisibility.movies) return 'Browse Movies';
    if (displayMode === 'venues' && categoryVisibility.venues) return 'Browse Venues';
    if (displayMode === 'mobileTheatres' && categoryVisibility.mobileTheatres) return 'Browse Mobile Theatres';
    if (displayMode === 'artists' && categoryVisibility.artists) return 'Browse Artists';
    if (displayMode === 'events' && categoryVisibility.events) return 'Browse Events';
    return 'Browse';
  };

  const selectBannerEvents = (eventList: Event[]) => {
    const featured = eventList.filter(e => e.isFeatured);
    const nonFeatured = eventList.filter(e => !e.isFeatured).sort((a, b) => b.hype - a.hype);
    return [...featured, ...nonFeatured].slice(0, 2);
  };

  const featuredBannerEvents = displayMode === 'events' 
    ? selectBannerEvents(nonMovieEvents)
    : selectBannerEvents(movieEvents);

  const handleQuickView = (event: Event) => {
    setQuickViewEvent(event);
  };

  const handleCloseQuickView = () => {
    setQuickViewEvent(null);
  };
  
  const renderGridItems = () => {
      if (displayMode === 'venues' && categoryVisibility.venues) {
          return venues.map(venue => <VenueCard key={venue.id} venue={venue} onSelectVenue={onSelectVenue} />);
      }
      if (displayMode === 'mobileTheatres' && categoryVisibility.mobileTheatres) {
          return mobileTheatres.map(theatre => <MobileTheatreCard key={theatre.id} theatre={theatre} onSelectMobileTheatre={onSelectMobileTheatre} />);
      }
      if (displayMode === 'artists' && categoryVisibility.artists) {
          return artists.map(artist => <ArtistCard key={artist.id} artist={artist} onSelectArtist={onSelectArtist} />);
      }
      return events.map(event => <EventCard key={event.id} event={event} onSelectEvent={onSelectEvent} onQuickView={handleQuickView} />);
  };
  
  const hasResults = events.length > 0 || venues.length > 0 || mobileTheatres.length > 0 || artists.length > 0;

  return (
    <div>
      {displayMode !== 'venues' && displayMode !== 'mobileTheatres' && displayMode !== 'artists' && <Banner events={featuredBannerEvents} onSelectEvent={onSelectEvent} />}
      
      <div className="my-12 space-y-8 relative z-30">
        <SearchAndFilter 
            allEvents={unfilteredEvents}
            allVenues={venues}
            selectedCity={selectedCity}
            onSelectCity={onSelectCity}
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            activeFilters={activeFilters}
            onActiveFiltersChange={onActiveFiltersChange}
            displayMode={displayMode}
        />
      </div>

      {displayMode === 'movies' && categoryVisibility.movies ? (
        <>
            <HorizontalEventScroller title="Now Showing" events={nowShowingMovies} onSelectEvent={onSelectEvent} />
            <HorizontalEventScroller title="Upcoming Movies" events={upcomingMovies} onSelectEvent={onSelectEvent} />
        </>
      ) : displayMode === 'events' && categoryVisibility.events ? (
         <>
            <HorizontalEventScroller title="Top Music Events" events={topMusicEvents} onSelectEvent={onSelectEvent} />
            <HorizontalEventScroller title="Recommended For You" events={recommendedEvents} onSelectEvent={onSelectEvent} />
        </>
      ) : null}
      
      
      {hasResults ? (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-6">
            {getTitle()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {renderGridItems()}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-white">No Results Found</h2>
          <p className="text-gray-400 mt-2">Your filter criteria did not match any items. Try adjusting your search.</p>
        </div>
      )}
      
      {quickViewEvent && (
        <EventQuickViewModal
          event={quickViewEvent}
          onClose={handleCloseQuickView}
          onBookNow={onSelectEvent}
        />
      )}
    </div>
  );
};

export default EventList;