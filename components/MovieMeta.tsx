import React from 'react';
import { Event } from '../types.ts';

interface MovieMetaProps {
    event: Event;
}

const MovieMeta: React.FC<MovieMetaProps> = ({ event }) => {
    // Placeholders for data not available in the Event type
    const duration = '2h 26m';
    const certification = 'U';

    return (
        <div className="mt-6 text-slate-300 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="bg-zinc-700 text-white text-sm font-medium px-3 py-1 rounded">2D</span>
                {event.genre && <span className="bg-zinc-700 text-white text-sm font-medium px-3 py-1 rounded">{event.genre}</span>}
            </div>
            <p className="text-sm">
                {duration} &bull; {certification} &bull; {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {event.director && (
                <p className="text-sm">
                    <span className="font-semibold text-slate-400">Director:</span> {event.director}
                </p>
            )}
             {event.actors && event.actors.length > 0 && (
                <p className="text-sm">
                    <span className="font-semibold text-slate-400">Actors:</span> {event.actors.join(', ')}
                </p>
            )}
        </div>
    );
};

export default MovieMeta;