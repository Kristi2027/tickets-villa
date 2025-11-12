import React, { useState } from 'react';
import { Artist, User, ArtistBooking } from '../types';
import DatePicker from './DatePicker';
import Modal from './Modal';
import ImageLightbox from './ImageLightbox';

interface ArtistProfileProps {
    artist: Artist;
    user: User | null;
    onBack: () => void;
    onInitiateBooking: (artist: Artist, bookingDetails: Omit<ArtistBooking, 'id' | 'artistId' | 'clientId' | 'status'>) => void;
}

const ArtistProfile: React.FC<ArtistProfileProps> = ({ artist, user, onBack, onInitiateBooking }) => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
        eventDate: new Date().toISOString().split('T')[0],
        eventVenue: '',
        proposedFee: artist.bookingFee,
    });
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const handleBookingDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBookingDetails(prev => ({...prev, [name]: name === 'proposedFee' ? Number(value) : value }));
    };

    const handleDateChange = (date: string) => {
        setBookingDetails(prev => ({...prev, eventDate: date}));
    };

    const handleSubmitBooking = (e: React.FormEvent) => {
        e.preventDefault();
        const finalDetails = {
            ...bookingDetails,
            requestDate: new Date().toISOString(),
        };
        onInitiateBooking(artist, finalDetails);
        setIsBookingModalOpen(false);
    };

    const handleScrollToBook = () => {
        document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const getYouTubeEmbedUrl = (url?: string) => {
        if (!url) return '';
        try {
            const videoUrl = new URL(url);
            const videoId = videoUrl.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
        } catch {
            return '';
        }
    };
    
    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";
    const showreelEmbedUrl = getYouTubeEmbedUrl(artist.showreelUrl);


    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l-4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to Artists
            </button>
            
            {/* Hero Section */}
            <div className="relative h-[60vh] rounded-2xl overflow-hidden border border-slate-800 flex items-end p-8 text-white bg-zinc-900">
                <img src={artist.photo} alt={artist.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="relative z-10">
                    <p className="text-sm text-red-500 font-semibold uppercase tracking-wider">{artist.genre}</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mt-1">{artist.name}</h1>
                    <button onClick={handleScrollToBook} className="mt-6 bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:bg-red-700">
                        Book Now
                    </button>
                </div>
            </div>

            <div className="mt-12 space-y-16">
                {/* About Section */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-4">About {artist.name}</h2>
                    <p className="text-slate-300 leading-relaxed max-w-4xl">{artist.description}</p>
                </div>

                {/* Showreel Section */}
                {showreelEmbedUrl && (
                    <div>
                         <h2 className="text-3xl font-bold text-white mb-4">Showreel</h2>
                         <div className="aspect-video bg-black rounded-lg border border-slate-700">
                             <iframe
                                className="w-full h-full rounded-lg"
                                src={showreelEmbedUrl}
                                title={`${artist.name} - Showreel`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                         </div>
                    </div>
                )}

                {/* Gallery Section */}
                {artist.gallery && artist.gallery.length > 0 && (
                     <div>
                         <h2 className="text-3xl font-bold text-white mb-4">Gallery</h2>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {artist.gallery.map((imgUrl, index) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer group" onClick={() => setLightboxImage(imgUrl)}>
                                    <img src={imgUrl} alt={`${artist.name} gallery image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                </div>
                            ))}
                         </div>
                    </div>
                )}
                
                {/* Booking Section */}
                <div id="booking-section" className="pt-16">
                    <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-2 text-center">Request to Book</h2>
                        <p className="text-slate-400 mb-6 text-center">The artist will confirm your request.</p>
                        <form onSubmit={handleSubmitBooking} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Event Date</label>
                                <DatePicker 
                                    selectedDate={bookingDetails.eventDate}
                                    onDateChange={handleDateChange}
                                    minDate={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Event Venue & City</label>
                                <input type="text" name="eventVenue" value={bookingDetails.eventVenue} onChange={handleBookingDetailChange} required className={formInputStyles} placeholder="e.g., Grand Palace, Mumbai" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Proposed Fee (₹)</label>
                                <input type="number" name="proposedFee" value={bookingDetails.proposedFee} onChange={handleBookingDetailChange} required min="0" className={formInputStyles} />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
            
            {lightboxImage && (
                <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
            )}
        </div>
    );
};

export default ArtistProfile;
