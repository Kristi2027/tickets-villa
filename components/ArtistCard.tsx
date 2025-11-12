import React, { memo } from 'react';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  onSelectArtist: (artist: Artist) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onSelectArtist }) => {
  return (
    <div 
      className="bg-zinc-900 rounded-xl overflow-hidden group transition-all duration-300 cursor-pointer border border-slate-800 hover:border-red-600/30 hover:shadow-[0_0_35px_-10px_rgba(220,38,38,0.4)] hover:-translate-y-1 flex flex-col"
      onClick={() => onSelectArtist(artist)}
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-zinc-800 flex items-center justify-center text-slate-500">
            <img 
                src={artist.photo} 
                alt={artist.name} 
                loading="lazy" 
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110" 
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-white mt-1 truncate">{artist.name}</h3>
            <p className="text-red-500 text-sm mt-1 font-semibold">{artist.genre}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
            <div>
                <p className="text-xs text-slate-400">Booking from</p>
                <p className="text-lg text-white font-bold">₹{artist.bookingFee.toLocaleString('en-IN')}</p>
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

export default memo(ArtistCard);