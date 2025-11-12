

import React, { useState, useEffect, useRef } from 'react';
import { Event, Showtime, Theatre, Screen } from '../types.ts';

interface MovieShowtimeSelectorProps {
  event: Event;
  theatres: Theatre[];
  onSelectShowtime: (showtime: Showtime, theatre: Theatre, date: string) => void;
  hideUnavailable?: boolean;
}

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

const MovieShowtimeSelector: React.FC<MovieShowtimeSelectorProps> = ({ event, theatres, onSelectShowtime, hideUnavailable }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedElement = dateScrollerRef.current?.querySelector('.bg-red-600');
    if (selectedElement && dateScrollerRef.current) {
        const parent = dateScrollerRef.current;
        const scrollLeft = (selectedElement as HTMLElement).offsetLeft - parent.offsetLeft - (parent.offsetWidth / 2) + (selectedElement.clientWidth / 2);
        parent.scrollLeft = scrollLeft;
    }
  }, []);

  const getAvailabilityIndicator = (availability: Showtime['availability']) => {
    switch (availability) {
        case 'available':
            return { text: 'Available', color: 'text-green-400' };
        case 'fast_filling':
            return { text: 'Fast Filling', color: 'text-orange-400' };
        case 'sold_out':
            return { text: 'Sold Out', color: 'text-red-500' };
        default:
            return { text: '', color: '' };
    }
  };

  const dates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  const showtimesByTheatre = (event.showtimes || []).reduce((acc, showtime) => {
    const theatre = theatres.find(t => t.id === showtime.theatreId);
    if (!theatre || (event.screenListings && !event.screenListings[theatre.id]?.includes(showtime.screenId))) {
      return acc;
    }
    if (!acc[showtime.theatreId]) {
      acc[showtime.theatreId] = [];
    }
    acc[showtime.theatreId].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);


  if (!showtimesByTheatre || Object.keys(showtimesByTheatre).length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-300">No showtimes available for this movie yet.</h3>
        <p className="text-sm text-slate-500 mt-2">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-4">Tickets & Showtimes</h3>
      
      <div>
        {/* Date Scroller */}
        <div ref={dateScrollerRef} className="flex gap-2.5 overflow-x-auto pb-3">
          {dates.map((date, i) => {
            const isSelected = date.toISOString().split('T')[0] === selectedDateString;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 text-center px-4 py-2 rounded-lg transition-colors w-[68px] ${
                  isSelected ? 'bg-red-600 text-white font-bold' : 'bg-black/20 hover:bg-slate-700'
                }`}
              >
                <p className="text-sm font-semibold">{date.toLocaleDateString('en-IN', { day: '2-digit' })}</p>
                <p className="text-xs">{date.toLocaleDateString('en-IN', { month: 'short' })}</p>
              </button>
            );
          })}
        </div>
        {/* Active Date Indicator Bar */}
        <div className="h-1 bg-red-600 rounded-full w-full max-w-[68px]"></div>
      </div>
      
      <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
        {Object.keys(showtimesByTheatre).map((theatreId, index) => {
          const showtimes = showtimesByTheatre[theatreId];
          const theatre = theatres.find(t => t.id === theatreId);
          if (!theatre) return null;

          // Group showtimes by screen to handle multiplexes correctly.
          const showtimesByScreen = showtimes.reduce((acc, showtime) => {
              if (!acc[showtime.screenId]) {
                  acc[showtime.screenId] = [];
              }
              acc[showtime.screenId].push(showtime);
              return acc;
          }, {} as Record<string, Showtime[]>);

          return (
            <div key={theatreId} className={`pt-4 ${index > 0 ? 'border-t border-slate-800' : ''}`}>
              <h4 className="text-lg font-bold text-white">{theatre.name}</h4>
              <p className="text-sm text-slate-400 mb-3">{theatre.city}</p>
              
              {Object.keys(showtimesByScreen).map(screenId => {
                  const screenShowtimes = showtimesByScreen[screenId];
                  const screen = theatre.screens.find(s => s.id === screenId);
                  
                  const uniqueShowtimesForScreen: Showtime[] = [];
                  const seenTimes = new Set<string>();
                  for (const showtime of screenShowtimes) {
                      if (!seenTimes.has(showtime.time)) {
                          uniqueShowtimesForScreen.push(showtime);
                          seenTimes.add(showtime.time);
                      }
                  }
                  uniqueShowtimesForScreen.sort((a, b) => a.time.localeCompare(b.time));

                  const showtimesToRender = uniqueShowtimesForScreen.filter(showtime => {
                      if (!hideUnavailable) return true;
                      const isPast = (() => {
                          if (selectedDateString !== new Date().toISOString().split('T')[0]) return false;
                          try {
                              const now = new Date();
                              const [hours, minutes] = showtime.time.split(':').map(Number);
                              const showtimeDateTime = new Date(selectedDate);
                              showtimeDateTime.setHours(hours, minutes, 0, 0);
                              return now > showtimeDateTime;
                          } catch { return false; }
                      })();
                      return !isPast && showtime.availability !== 'sold_out';
                  });
                  
                  if (showtimesToRender.length === 0) return null;

                  return (
                      <div key={screenId} className="mt-3 pt-3 border-t border-slate-800/50 first:mt-0 first:pt-0 first:border-none">
                          {screen && <h5 className="text-sm font-semibold text-red-400 mb-2">{screen.name}</h5>}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {showtimesToRender.map(showtime => {
                                  const isDisabled = showtime.availability === 'sold_out';
                                  const indicator = getAvailabilityIndicator(showtime.availability);
                                  return (
                                      <button
                                          key={showtime.id}
                                          onClick={() => onSelectShowtime(showtime, theatre, selectedDateString)}
                                          disabled={isDisabled}
                                          className={`border rounded-lg p-2 sm:p-2.5 text-center transition-colors ${
                                              isDisabled
                                              ? 'bg-zinc-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                                              : 'border-slate-700 hover:border-red-500 hover:bg-red-500/10'
                                          }`}
                                      >
                                          <p className={`font-semibold text-base ${isDisabled ? '' : 'text-white'}`}>{formatTime12Hour(showtime.time)}</p>
                                          <p className={`text-xs ${indicator.color}`}>{indicator.text}</p>
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  )
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MovieShowtimeSelector;