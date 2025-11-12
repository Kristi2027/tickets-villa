import React, { useRef } from 'react';

// --- MOCK DATA ---
const mockTags = [
    { label: '#Blockbuster', count: 10745 },
    { label: '#WowMusic', count: 9903 },
    { label: '#GreatActing', count: 9271 },
    { label: '#AwesomeStory', count: 8521 },
    { label: '#SuperDirection', count: 7654 },
    { label: '#MustWatch', count: 6812 },
];

const mockReviews = [
    {
        id: 1,
        user: 'User',
        rating: '10/10',
        tags: ['#Blockbuster'],
        comment: 'One of the best movies ever made! The music, acting, and direction were all top-notch. A cinematic masterpiece that will be remembered for years to come. Do not miss this one!',
        likes: '2.3K',
        date: '8 Days ago',
    },
    {
        id: 2,
        user: 'User',
        rating: '10/10',
        tags: ['#SuperDirection', '#GreatActing', '#WowMusic'],
        comment: 'assam no 1 superhit movie.. joi jubeen da #JusticeForJubeenGarg 😍😍😍💓💓💓',
        likes: '1.2K',
        date: '8 Days ago',
    },
    {
        id: 3,
        user: 'AnotherUser',
        rating: '9/10',
        tags: ['#AwesomeStory'],
        comment: 'The story was so engaging from start to finish. I was on the edge of my seat the entire time. Highly recommended for anyone who loves a good thriller with a compelling plot.',
        likes: '980',
        date: '9 Days ago',
    }
];

// --- ICONS ---
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const LikeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>;
const DislikeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.438 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-1.867a4 4 0 00.8-2.4z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>;


const TopReviews: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-2xl font-bold text-white">Top reviews</h3>
                 <a href="#" className="text-sm font-semibold text-red-500 hover:text-red-400">17K reviews &gt;</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Summary of 17K reviews.</p>
            
            {/* Tags scroller */}
            <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {mockTags.map(tag => (
                    <button key={tag.label} className="flex-shrink-0 bg-zinc-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full text-sm hover:bg-slate-700 transition-colors">
                        {tag.label} <span className="text-slate-500 font-semibold">{tag.count}</span>
                    </button>
                ))}
            </div>

            {/* Reviews scroller */}
            <div className="relative group mt-4">
                 <div className="absolute -left-4 top-0 bottom-0 hidden md:flex items-center z-10">
                     <button onClick={() => scroll('left')} className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                </div>
                 <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {mockReviews.map(review => (
                        <div key={review.id} className="bg-zinc-900 border border-slate-800 rounded-lg p-5 w-80 flex-shrink-0 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{review.user}</p>
                                        <p className="text-xs text-slate-500">Booked on TicketsVilla</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-red-600/10 text-red-500 px-2 py-1 rounded-md font-bold text-sm">
                                    <StarIcon />
                                    <span>{review.rating}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {review.tags.map(tag => (
                                    <span key={tag} className="text-xs text-cyan-400 font-semibold">{tag}</span>
                                ))}
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                            <div className="flex justify-between items-center text-slate-500">
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        <LikeIcon />
                                        <span className="text-xs font-semibold">{review.likes}</span>
                                    </button>
                                     <button className="hover:text-white transition-colors">
                                        <DislikeIcon />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className="text-xs">{review.date}</span>
                                     <button className="hover:text-white transition-colors">
                                        <ShareIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute -right-4 top-0 bottom-0 hidden md:flex items-center z-10">
                     <button onClick={() => scroll('right')} className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     </button>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
                <a href="#" className="hover:text-red-500 underline">Report content</a>
            </p>
        </div>
    );
};

export default TopReviews;