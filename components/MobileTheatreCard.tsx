import React, { memo } from 'react';
import { MobileTheatre } from '../types';

interface MobileTheatreCardProps {
  theatre: MobileTheatre;
  onSelectMobileTheatre: (theatre: MobileTheatre) => void;
}

const MobileTheatreCard: React.FC<MobileTheatreCardProps> = ({ theatre, onSelectMobileTheatre }) => {

  const getCurrentOrNextLocation = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find current location
    for (const stop of theatre.tourPlan) {
        const start = new Date(stop.startDate);
        const end = new Date(stop.endDate);
        if (today >= start && today <= end) {
            return { label: 'Now at', location: stop.location };
        }
    }
    // Find next location
    for (const stop of theatre.tourPlan) {
        const start = new Date(stop.startDate);
        if (today < start) {
            return { label: `Next: ${start.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}`, location: stop.location };
        }
    }
    return null;
  };
  
  const currentLocation = getCurrentOrNextLocation();

  return (
    <div 
      className="bg-zinc-900 rounded-xl overflow-hidden group transition-all duration-300 cursor-pointer border border-slate-800 hover:border-red-600/30 hover:shadow-[0_0_35px_-10px_rgba(220,38,38,0.4)] hover:-translate-y-1 flex flex-col"
      onClick={() => onSelectMobileTheatre(theatre)}
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-zinc-800 flex items-center justify-center text-slate-500">
            <img 
                src={theatre.bannerImage} 
                alt={theatre.name} 
                loading="lazy" 
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-105" 
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-center leading-none text-white font-bold text-sm">
           Season {theatre.season}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-white mt-1 truncate group-hover:text-white">{theatre.name}</h3>
            <p className="text-slate-400 text-sm mt-1 truncate group-hover:text-slate-400">By {theatre.owner}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
            {currentLocation ? (
                <div>
                    <p className="text-xs text-slate-400">{currentLocation.label}</p>
                    <p className="text-lg text-red-600 font-bold">{currentLocation.location}</p>
                </div>
            ) : <div></div>}
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

export default memo(MobileTheatreCard);