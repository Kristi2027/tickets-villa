import React from 'react';
import { Event } from '../types.ts';

interface BannerProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

const Banner: React.FC<BannerProps> = ({ events, onSelectEvent }) => {
  const featuredEvents = [...events].sort((a, b) => b.hype - a.hype).slice(0, 2);

  return (
    <div className="mb-12">
        <div className="text-center mb-10">
             <h2 className="text-3xl font-bold text-white tracking-tight">Featured Events</h2>
             <p className="text-slate-400 mt-2">Don't miss out on the most hyped events happening near you!</p>
        </div>
        {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {featuredEvents.map(event => (
                <div 
                    key={event.id}
                    className="relative rounded-xl overflow-hidden cursor-pointer group h-80 transition-all duration-300 transform border-2 border-slate-800 hover:border-red-600/50 hover:shadow-[0_0_35px_rgba(220,38,38,0.3)]"
                    onClick={() => onSelectEvent(event)}
                >
                    <img src={event.bannerImage} alt={event.title} loading="eager" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{event.title}</h3>
                        <p className="text-slate-300 mt-1">{event.city}, {event.venue}</p>
                        <div className="mt-4">
                           <button className="font-semibold text-white bg-red-600 px-5 py-2 rounded-lg text-sm transform transition-transform duration-300 group-hover:scale-105 hover:bg-red-700">
                                View Details
                           </button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        ) : (
             <div className="text-center py-16 md:py-24">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                    Discover India's Most
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Exciting Events</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-400">
                    From electrifying music festivals to insightful tech conferences, find your next unforgettable experience right here.
                </p>
            </div>
        )}
    </div>
  );
};

export default Banner;