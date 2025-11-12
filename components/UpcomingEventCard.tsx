import React, { memo } from 'react';
import { Event } from '../types.ts';

interface UpcomingEventCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
}

const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({ event, onSelectEvent }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="flex-shrink-0 w-48 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 transform hover:scale-105 border border-slate-800 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:border-red-600/30 bg-zinc-900"
      onClick={() => onSelectEvent(event)}
    >
      <div className="relative h-64">
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-slate-500 overflow-hidden">
          <img src={event.bannerImage} alt={event.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <h3 className="text-base font-bold text-white truncate group-hover:text-white">{event.title}</h3>
          <p className="text-slate-400 text-xs mt-1 group-hover:text-slate-400">{formattedDate} &bull; {event.city}</p>
        </div>
      </div>
    </div>
  );
};

export default memo(UpcomingEventCard);