import React, { useEffect } from 'react';

interface TrailerModalProps {
    trailerUrl: string;
    onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, onClose }) => {
    // Effect to handle Escape key press for accessibility
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trailer-modal-title"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-zinc-950 rounded-xl overflow-hidden w-full max-w-4xl shadow-2xl shadow-red-500/10 aspect-video relative"
                onClick={e => e.stopPropagation()} // Prevent closing modal when clicking on the video player
            >
                <div id="trailer-modal-title" className="sr-only">Movie Trailer</div>
                <button
                    onClick={onClose}
                    aria-label="Close trailer"
                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/80 transition-all z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <iframe
                    className="w-full h-full"
                    src={trailerUrl}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default TrailerModal;