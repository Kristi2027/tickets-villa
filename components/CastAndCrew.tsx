import React, { useRef } from 'react';

interface Person {
    name: string;
    role: string;
    image: string;
}

interface CastAndCrewProps {
    cast?: Person[];
    crew?: Person[];
}

const ArrowButton: React.FC<{ direction: 'left' | 'right'; onClick: () => void; }> = ({ direction, onClick }) => (
    <button
        onClick={onClick}
        aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
        className="absolute top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-colors z-10 disabled:opacity-0"
    >
        {direction === 'left' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        )}
    </button>
);


const ScrollerSection: React.FC<{ title: string; people: Person[] }> = ({ title, people }) => {
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
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
            </div>
            <div className="relative group">
                <div className="absolute -left-4 top-0 bottom-0 hidden md:flex items-center z-10">
                     <button onClick={() => scroll('left')} className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                </div>
                <div 
                    ref={scrollRef} 
                    className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {people.map((person, index) => (
                        <div key={index} className="flex-shrink-0 text-center w-28">
                            <img 
                                src={person.image} 
                                alt={person.name} 
                                loading="lazy" 
                                className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg border-2 border-slate-800" 
                            />
                            <p className="mt-2 text-sm font-semibold text-white truncate">{person.name}</p>
                            <p className="text-xs text-slate-400 truncate">{person.role}</p>
                        </div>
                    ))}
                </div>
                 <div className="absolute -right-4 top-0 bottom-0 hidden md:flex items-center z-10">
                     <button onClick={() => scroll('right')} className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     </button>
                </div>
            </div>
        </div>
    );
};


const CastAndCrew: React.FC<CastAndCrewProps> = ({ cast, crew }) => {
    if (!cast?.length && !crew?.length) {
        return null;
    }

    return (
        <div className="space-y-10">
            {cast && cast.length > 0 && <ScrollerSection title="Cast" people={cast} />}
            {crew && crew.length > 0 && <ScrollerSection title="Crew" people={crew} />}
        </div>
    );
};

export default CastAndCrew;