import React, { memo } from 'react';
import { Venue } from '../types.ts';

interface VenueCardProps {
  venue: Venue;
  onSelectVenue: (venue: Venue) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onSelectVenue }) => {
  return (
    <div 
      className="bg-zinc-900 rounded-xl overflow-hidden group transition-all duration-300 cursor-pointer border border-slate-800 hover:border-red-600/30 hover:shadow-[0_0_35px_-10px_rgba(220,38,38,0.4)] hover:-translate-y-1 flex flex-col"
      onClick={() => onSelectVenue(venue)}
    >
      <div className="relative">
        {/* Using aspect-ratio for consistent image sizing */}
        <div className="aspect-[4/3] overflow-hidden bg-zinc-800 flex items-center justify-center text-slate-500">
            <img 
                src={venue.bannerImage} 
                alt={venue.name} 
                loading="lazy" 
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-105" 
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-lg text-center leading-none flex items-center space-x-2 text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          <span className="font-bold text-sm">{venue.capacity}</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-white mt-1 truncate group-hover:text-white">{venue.name}</h3>
            <p className="text-slate-400 text-sm mt-1 truncate group-hover:text-slate-400">{venue.address}, {venue.city}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
            <div>
                <p className="text-xs text-slate-400">Starts from</p>
                <p className="text-lg text-red-600 font-bold">₹{Math.min(venue.pricing.perHour, venue.pricing.fullDay).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-white bg-slate-700 group-hover:bg-red-600/20 group-hover:text-red-400 rounded-full p-2 transition-all duration-300 transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
      </div>
    </div>
  );
};

export default memo(VenueCard);