import React from 'react';
import { Event } from '../types.ts';
import UpcomingEventCard from './UpcomingEventCard.tsx';

interface HorizontalEventScrollerProps {
  title: string;
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

const HorizontalEventScroller: React.FC<HorizontalEventScrollerProps> = ({ title, events, onSelectEvent }) => {
  if (events.length === 0) return null;

  return (
    <div className="my-12">
      <h2 className="text-3xl font-bold text-white tracking-tight mb-6">{title}</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'thin' }}>
        {events.map(event => (
          <UpcomingEventCard key={event.id} event={event} onSelectEvent={onSelectEvent} />
        ))}
        {/* Added for scroll spacing at the end */}
        <div className="flex-shrink-0 w-1"></div>
      </div>
    </div>
  );
};

export default HorizontalEventScroller;