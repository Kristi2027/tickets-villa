import React, { useMemo, memo } from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
  onQuickView: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onSelectEvent, onQuickView }) => {
  const isPast = event.status === 'past';

  const isSoldOut = useMemo(() => {
    if (isPast) return false;
    if (event.category === 'Movies') {
      // A movie is sold out if it has showtimes AND all of them are sold out.
      return event.showtimes && event.showtimes.length > 0 && event.showtimes.every(st => st.availability === 'sold_out');
    } else {
      // For other events, check ticket quantity.
      const totalTicketsAvailable = event.tickets.reduce((total, ticket) => total + ticket.quantityAvailable, 0);
      return totalTicketsAvailable === 0;
    }
  }, [event, isPast]);

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(event);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing

    const eventUrl = `${window.location.origin}${window.location.pathname}#event=${event.id}`;

    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title} in ${event.city}!`,
      url: eventUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error('Error sharing event:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Event link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link to clipboard:', error);
        alert('Could not copy link to clipboard.');
      }
    }
  };


  return (
    <div 
      className={`bg-zinc-900 rounded-xl overflow-hidden group transition-all duration-300 border border-slate-800 ${isPast || isSoldOut ? 'opacity-60' : 'cursor-pointer transform hover:scale-105 hover:border-red-600/30 hover:shadow-[0_0_25px_rgba(220,38,38,0.3)]'}`}
      onClick={() => (isPast || isSoldOut ? undefined : onSelectEvent(event))}
    >
      <div className="relative">
        <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-slate-500 overflow-hidden">
          <img src={event.bannerImage} alt={event.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent ${isPast || isSoldOut ? 'bg-black/40' : ''}`}></div>

        {isPast && (
            <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                Past Event
            </div>
        )}
        {isSoldOut && (
            <div className="absolute top-3 left-3 bg-red-800/80 backdrop-blur-sm text-red-200 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                Sold Out
            </div>
        )}
        
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-lg text-center leading-none flex items-center space-x-1 text-amber-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l.643 2.113a1 1 0 01-.85 1.302l-2.435.618a1 1 0 00-.638 1.833l.01.011a1 1 0 01-1.457 1.34-4.002 4.002 0 00-2.33 6.333C3.003 16.536 4.23 17 5.5 17h6c1.27 0 2.497-.464 3.364-1.292a4 4 0 00-2.33-6.333l.01-.01a1 1 0 01-1.457-1.341l-2.435-.617a1 1 0 00-.638-1.833l.644-2.113a1 1 0 01-.85-1.302c-.208-.376-.477-.704-.822-.934a1 1 0 00-1.45.385z" clipRule="evenodd" />
          </svg>
          <span className="font-bold text-sm text-slate-100">{event.hype}</span>
        </div>
      </div>
      <div className="p-5 relative">
        <p className="text-sm text-red-600 font-semibold">{event.category.toUpperCase()}</p>
        <h3 className="text-xl font-bold text-white mt-1 truncate group-hover:text-white">{event.title}</h3>
        <p className="text-slate-400 text-sm mt-1 truncate group-hover:text-slate-400">{event.venue}, {event.city}</p>
        
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={handleQuickViewClick}
              aria-label="Quick view event"
              className="bg-black/40 p-2 rounded-full text-slate-300 hover:text-white hover:bg-red-600/50 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleShare}
              aria-label="Share event"
              className="bg-black/40 p-2 rounded-full text-slate-300 hover:text-white hover:bg-red-600/50 transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default memo(EventCard);