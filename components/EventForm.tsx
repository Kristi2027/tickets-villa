import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Event, Ticket, INDIAN_CITIES, DiscountCode, EarlyBird, Theatre, Showtime, Screen } from '../types.ts';
import { generateEventDescription } from '../services/geminiService.ts';
import DatePicker from './DatePicker.tsx';
import { CustomSelect } from './SearchAndFilter.tsx';
import Modal from './Modal.tsx';

// --- START OF IN-FILE SHOWTIME EDITOR COMPONENT ---

const ShowtimeEditorModal: React.FC<{
  theatre: Theatre;
  screen: Screen;
  movieShowtimes: Showtime[];
  onClose: () => void;
  onSave: (screenId: string, newTimes: string[]) => void;
}> = ({ theatre, screen, movieShowtimes, onClose, onSave }) => {
  const [currentTimes, setCurrentTimes] = useState<string[]>(() =>
    movieShowtimes
      .filter(st => st.screenId === screen.id)
      .map(st => st.time)
      .sort()
  );
  const [customTime, setCustomTime] = useState('');

  const addTime = (time: string) => {
    if (time && !currentTimes.includes(time)) {
      setCurrentTimes(prev => [...prev, time].sort());
    }
  };

  const handleAddCustomTime = () => {
    addTime(customTime);
    setCustomTime('');
  };

  const removeTime = (timeToRemove: string) => {
    setCurrentTimes(prev => prev.filter(t => t !== timeToRemove));
  };

  const handleSave = () => {
    onSave(screen.id, currentTimes);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-2">Edit Showtimes</h2>
      <p className="text-slate-400 mb-6">For <span className="font-semibold text-red-500">{theatre.name} - {screen.name}</span></p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] md:max-h-none">
        {/* Left: Add Times */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Add from Defaults</label>
            <div className="bg-black/20 p-2 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
                {screen.defaultShowtimes?.length ? screen.defaultShowtimes.map(time => (
                    <button
                        key={time}
                        type="button"
                        onClick={() => addTime(time)}
                        disabled={currentTimes.includes(time)}
                        className="w-full text-left p-2 rounded-md font-mono text-sm hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {time}
                    </button>
                )) : <p className="text-xs text-slate-500 text-center p-2">No defaults set for this screen.</p>}
            </div>
          </div>
          <div>
            <label htmlFor="customTime" className="text-sm font-medium text-slate-300 mb-2 block">Add Custom Time</label>
            <div className="flex gap-2">
                <input
                    id="customTime"
                    type="time"
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    className="w-full bg-black/20 border border-slate-700 rounded-lg py-2 px-3"
                />
                <button type="button" onClick={handleAddCustomTime} disabled={!customTime} className="bg-red-600/50 text-white font-bold h-10 px-4 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
                    Add
                </button>
            </div>
          </div>
        </div>
        {/* Right: Current Schedule */}
        <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Current Schedule for this Movie</label>
            <div className="bg-black/20 p-3 rounded-lg border border-slate-700 space-y-2 h-64 overflow-y-auto">
                {currentTimes.length > 0 ? currentTimes.map(time => (
                    <div key={time} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                        <span className="font-mono text-white">{time}</span>
                        <button type="button" onClick={() => removeTime(time)} className="text-red-400 p-1 rounded-md hover:bg-red-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )) : <p className="text-center text-sm text-slate-500 py-4">No showtimes scheduled.</p>}
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
        <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
        <button type="button" onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Save Schedule</button>
      </div>
    </Modal>
  );
};
// --- END OF IN-FILE COMPONENT ---


interface EventFormProps {
  event: Event | null;
  theatres: Theatre[];
  onSave: (event: Event) => void;
  onCancel: () => void;
  initialCategory?: string;
}

const initialEventState: Omit<Event, 'id' | 'status' | 'createdBy' | 'hype'> = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    city: 'Mumbai',
    venue: '',
    category: 'Music',
    bannerImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop&ixlib-rb-4.0.3&id=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    startTime: '18:00',
    endTime: '21:00',
    tickets: [{ name: 'General Admission', price: 0, quantityAvailable: 100 }],
    isFeatured: false,
    discountCodes: [],
    earlyBird: {
        isActive: false,
        discountType: 'percentage',
        discountValue: 10,
        endDate: new Date().toISOString().split('T')[0]
    },
    // Movie fields
    genre: '',
    actors: [],
    director: '',
    rating: undefined,
    screenListings: {},
    showtimes: [],
    trailerVideoId: '',
};


const EventForm: React.FC<EventFormProps> = ({ event, theatres, onSave, onCancel, initialCategory }) => {
    const [formData, setFormData] = useState<Omit<Event, 'id' | 'status' | 'createdBy' | 'hype'>>(() => {
        if (event) { // For editing an existing event
            return {
                title: event.title,
                description: event.description,
                date: new Date(event.date).toISOString().split('T')[0],
                city: event.city,
                venue: event.venue,
                category: event.category,
                bannerImage: event.bannerImage,
                tickets: event.tickets,
                startTime: event.startTime || '18:00',
                endTime: event.endTime || '21:00',
                isFeatured: event.isFeatured || false,
                discountCodes: event.discountCodes || [],
                earlyBird: event.earlyBird || initialEventState.earlyBird,
                genre: event.genre || '',
                actors: event.actors || [],
                director: event.director || '',
                rating: event.rating,
                screenListings: event.screenListings || {},
                showtimes: event.showtimes || [],
                trailerVideoId: event.trailerVideoId || '',
                theatreId: event.theatreId || '',
                screenId: event.screenId || '',
            };
        }
        
        // For creating a new event
        const baseState = { ...initialEventState };
        if (initialCategory === 'Movies') {
            baseState.category = 'Movies';
            baseState.tickets = [];
            baseState.startTime = undefined;
            baseState.endTime = undefined;
            baseState.theatreId = undefined;
            baseState.screenId = undefined;
        }
        return baseState;
    });
    const [actorsString, setActorsString] = useState(event?.actors?.join(', ') || '');
    const [trailerUrl, setTrailerUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [imageValidationError, setImageValidationError] = useState<string | null>(null);
    const [newDiscount, setNewDiscount] = useState<DiscountCode>({ code: '', type: 'percentage', value: 10 });
    const [linkCopied, setLinkCopied] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [isTheatreSelectOpen, setIsTheatreSelectOpen] = useState(false);
    const [theatreSearch, setTheatreSearch] = useState('');
    const theatreSelectRef = useRef<HTMLDivElement>(null);
    const [showtimeEditorState, setShowtimeEditorState] = useState<{ isOpen: boolean; theatre: Theatre | null; screen: Screen | null; }>({ isOpen: false, theatre: null, screen: null });


    const isMovieForm = (event && event.category === 'Movies') || initialCategory === 'Movies';
    
    const theatresByCity = useMemo(() => {
        return theatres.reduce((acc, theatre) => {
          const city = theatre.city;
          if (!acc[city]) {
            acc[city] = [];
          }
          acc[city].push(theatre);
          return acc;
        }, {} as Record<string, Theatre[]>);
    }, [theatres]);

    const filteredTheatresByCity = useMemo(() => {
        if (!theatreSearch) {
          return theatresByCity;
        }

        const filtered = {} as Record<string, Theatre[]>;
        const lowercasedSearch = theatreSearch.toLowerCase();

        for (const city in theatresByCity) {
          const matchingTheatres = theatresByCity[city].filter(theatre => 
            theatre.name.toLowerCase().includes(lowercasedSearch)
          );
          
          if (city.toLowerCase().includes(lowercasedSearch) && !filtered[city]) {
            filtered[city] = theatresByCity[city];
          } else if (matchingTheatres.length > 0) {
            filtered[city] = matchingTheatres;
          }
        }
        return filtered;
    }, [theatresByCity, theatreSearch]);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (theatreSelectRef.current && !theatreSelectRef.current.contains(e.target as Node)) {
                setIsTheatreSelectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (event?.actors) {
            setActorsString(event.actors.join(', '));
        }
        if (event?.trailerVideoId) {
            setTrailerUrl(`https://www.youtube.com/watch?v=${event.trailerVideoId}`);
        }
    }, [event]);

    useEffect(() => {
        if (formData.bannerImage) {
            let url;
            try {
                url = new URL(formData.bannerImage);
                if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
                     throw new Error('Invalid protocol');
                }
            } catch (_) {
                setImageStatus('error');
                setImageDimensions(null);
                setImageValidationError(null);
                return;
            }
            
            setImageStatus('loading');
            setImageDimensions(null);
            setImageValidationError(null);

            const img = new Image();
            img.src = formData.bannerImage;

            const handleLoad = () => {
                const { naturalWidth, naturalHeight } = img;
                setImageDimensions({ width: naturalWidth, height: naturalHeight });
                setImageStatus('success');

                const MIN_WIDTH = 1200;
                const MIN_HEIGHT = 600;
                if (naturalWidth < MIN_WIDTH || naturalHeight < MIN_HEIGHT) {
                    setImageValidationError(`Warning: Image is smaller than the recommended ${MIN_WIDTH}x${MIN_HEIGHT}px. It may appear blurry or stretched.`);
                } else {
                    setImageValidationError(null);
                }
            };

            const handleError = () => {
                setImageDimensions(null);
                setImageStatus('error');
                setImageValidationError(null);
            };

            img.addEventListener('load', handleLoad);
            img.addEventListener('error', handleError);

            return () => {
                img.removeEventListener('load', handleLoad);
                img.removeEventListener('error', handleError);
            };
        } else {
            setImageStatus('idle');
            setImageDimensions(null);
            setImageValidationError(null);
        }
    }, [formData.bannerImage]);

    // Effect to clean up form state when category changes
    useEffect(() => {
        if (formData.category === 'Movies') {
            setFormData(prev => ({
                ...prev,
                tickets: [],
                startTime: undefined,
                endTime: undefined,
                theatreId: undefined,
                screenId: undefined,
                city: '',
                venue: '',
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                genre: '',
                actors: [],
                director: '',
                rating: undefined,
                screenListings: {},
                showtimes: [],
                trailerVideoId: '',
                city: prev.city || initialEventState.city,
                venue: prev.venue || initialEventState.venue,
            }));
            setActorsString('');
            setTrailerUrl('');
        }
    }, [formData.category]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Clear error for the field being edited
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (e.target.nodeName === 'INPUT' && (e.target as HTMLInputElement).type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCustomSelectChange = (name: string, value: string | null) => {
        const newValue = value || '';
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (name === 'theatreId') {
            setFormData(prev => ({ ...prev, screenId: '' }));
        }
    };

    const handleScreenToggle = (theatreId: string, screenId: string) => {
        setFormData(prev => {
            const currentListings = { ...(prev.screenListings || {}) };
            const theatreScreenListings = currentListings[theatreId] || [];

            const newScreenListings = theatreScreenListings.includes(screenId)
                ? theatreScreenListings.filter(id => id !== screenId)
                : [...theatreScreenListings, screenId];
            
            if (newScreenListings.length > 0) {
                currentListings[theatreId] = newScreenListings;
            } else {
                delete currentListings[theatreId]; // remove theatre if no screens are selected
            }
            
            return { ...prev, screenListings: currentListings };
        });
    };

    const handleTheatreToggleAllScreens = (theatreId: string) => {
        const theatre = theatres.find(t => t.id === theatreId);
        if (!theatre) return;

        setFormData(prev => {
            const currentListings = { ...(prev.screenListings || {}) };
            const allScreensForTheatre = theatre.screens.map(s => s.id);
            const currentlySelected = currentListings[theatreId] || [];

            if (currentlySelected.length === allScreensForTheatre.length) {
                 delete currentListings[theatreId];
            } else {
                currentListings[theatreId] = allScreensForTheatre;
            }
            
            return { ...prev, screenListings: currentListings };
        });
    };

    const handleDateChange = (newDate: string) => {
        setFormData(prev => ({...prev, date: newDate}));
    };

    const handleTicketChange = (index: number, field: keyof Ticket, value: string | number) => {
        if (errors.ticketErrors && errors.ticketErrors[index]) {
            setErrors(prev => {
                const newTicketErrors = [...prev.ticketErrors];
                newTicketErrors[index] = '';
                const hasOtherErrors = newTicketErrors.some(Boolean);
                const newErrors = { ...prev };
                if (hasOtherErrors) {
                    newErrors.ticketErrors = newTicketErrors;
                } else {
                    delete newErrors.ticketErrors;
                    delete newErrors.tickets;
                }
                return newErrors;
            });
        }

        const newTickets = [...formData.tickets];
        const ticketToUpdate = { ...newTickets[index] };

        if (field === 'price' || field === 'quantityAvailable') {
            ticketToUpdate[field] = Number(value);
        } else { // field is 'name'
            ticketToUpdate[field] = String(value);
        }
        
        newTickets[index] = ticketToUpdate;
        setFormData(prev => ({...prev, tickets: newTickets}));
    };

    const addTicketType = () => {
        setFormData(prev => ({
            ...prev,
            tickets: [...prev.tickets, { name: '', price: 0, quantityAvailable: 100 }]
        }));
    };

    const removeTicketType = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tickets: prev.tickets.filter((_, i) => i !== index)
        }));
    };

    const handleGenerateDescription = async () => {
        if (!formData.title) {
            setErrors(prev => ({...prev, title: "Please enter a title first."}));
            return;
        }
        setIsGenerating(true);
        const keywords = `${formData.category}, ${formData.city}, ${formData.venue}`;
        try {
            const description = await generateEventDescription(formData.title, keywords);
            setFormData(prev => ({...prev, description}));
        } catch (error) {
            console.error(error);
            alert("Failed to generate description.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- SHOWTIME HANDLERS ---
    const handleRemoveShowtime = (showtimeIdToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            showtimes: prev.showtimes?.filter(st => st.id !== showtimeIdToRemove)
        }));
    };
    
    const handleSaveShowtimesForScreen = (screenId: string, newTimes: string[]) => {
        const screen = showtimeEditorState.screen;
        const theatre = showtimeEditorState.theatre;
        if (!screen || !theatre) return;
        
        // Remove all old showtimes for this screen
        const otherShowtimes = formData.showtimes?.filter(st => st.screenId !== screenId) || [];
        
        // Create new showtime objects
        const newShowtimes: Showtime[] = newTimes.map(time => {
            // try to find an existing one to preserve ID and seatStatus, otherwise create new
            const existing = formData.showtimes?.find(st => st.screenId === screenId && st.time === time);
            return existing || {
                id: `st-${screenId}-${time.replace(':', '')}-${Math.random()}`,
                theatreId: theatre.id,
                screenId: screen.id,
                time,
                availability: 'available',
                seatStatus: screen.seatLayout.grid.map(row => row.map(cell => cell === 'aisle' || cell === 'empty' ? 'locked' : 'available')),
            };
        });
    
        setFormData(prev => ({
            ...prev,
            showtimes: [...otherShowtimes, ...newShowtimes]
        }));
    
        setShowtimeEditorState({ isOpen: false, theatre: null, screen: null });
    };

    // --- PROMOTION TOOLS HANDLERS ---
    const handleAddDiscountCode = () => {
        if (!newDiscount.code || newDiscount.value <= 0) {
            alert("Please enter a valid code and a value greater than 0.");
            return;
        }
        if (formData.discountCodes?.some(c => c.code === newDiscount.code)) {
            alert(`A discount code with the name "${newDiscount.code}" already exists.`);
            return;
        }
        setFormData(prev => ({
            ...prev,
            discountCodes: [...(prev.discountCodes || []), newDiscount]
        }));
        setNewDiscount({ code: '', type: 'percentage', value: 10 });
    };

    const handleRemoveDiscountCode = (codeToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            discountCodes: prev.discountCodes?.filter(c => c.code !== codeToRemove)
        }));
    };
    
    const handleEarlyBirdChange = (field: keyof EarlyBird, value: any) => {
         if (errors.earlyBird) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.earlyBird;
                return newErrors;
            });
        }
        setFormData(prev => ({
            ...prev,
            earlyBird: { ...prev.earlyBird!, [field]: value }
        }));
    };

    const handleGenerateShareLink = (code: DiscountCode) => {
        if (!event?.id) {
            alert("Please save the event first to generate a shareable link.");
            return;
        }
        const url = `${window.location.origin}${window.location.pathname}?event_id=${event.id}&promo=${code.code}`;
        navigator.clipboard.writeText(url).then(() => {
            setLinkCopied(code.code);
            setTimeout(() => setLinkCopied(null), 2000);
        });
    };
    // --- END PROMOTION TOOLS HANDLERS ---

    const validateForm = (): Record<string, any> => {
        const newErrors: Record<string, any> = {};
        const ticketErrors: string[] = Array(formData.tickets.length).fill('');

        // Basic Info
        if (!formData.title.trim()) newErrors.title = "Event title is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (formData.category !== 'Movies' && !formData.venue.trim()) newErrors.venue = "Venue name is required.";
        if (!formData.bannerImage.trim()) newErrors.bannerImage = "Banner Image URL is required.";
        else {
            try {
                new URL(formData.bannerImage);
            } catch (_) {
                newErrors.bannerImage = "Please enter a valid URL.";
            }
        }
        
        // Time validation for non-movie events
        if (formData.category !== 'Movies' && formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = "End time must be after start time.";
            }
        }

        // Ticket validation for general admission events
        const isSeatedEvent = formData.category !== 'Movies' && !!formData.theatreId;
        if (!isSeatedEvent && formData.category !== 'Movies') {
            if (formData.tickets.length === 0) {
                newErrors.tickets = "At least one ticket type is required for general admission events.";
            } else {
                formData.tickets.forEach((ticket, index) => {
                    let errorMsg = '';
                    if (!ticket.name.trim()) errorMsg += 'Name is required. ';
                    if (ticket.price < 0 || isNaN(ticket.price)) errorMsg += 'Price must be a valid, non-negative number. ';
                    if (ticket.quantityAvailable < 0 || isNaN(ticket.quantityAvailable)) errorMsg += 'Quantity must be a valid, non-negative number.';
                    if (errorMsg) ticketErrors[index] = errorMsg.trim();
                });
                if (ticketErrors.some(e => e)) {
                    newErrors.ticketErrors = ticketErrors;
                }
            }
        }
        
        // Early Bird validation
        if (formData.earlyBird?.isActive) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (formData.earlyBird.endDate && /^\d{4}-\d{2}-\d{2}$/.test(formData.earlyBird.endDate)) {
                 const [year, month, day] = formData.earlyBird.endDate.split('-').map(Number);
                 const expiryDate = new Date(year, month - 1, day);
                 if (expiryDate < today) {
                    newErrors.earlyBird = "The Early Bird expiry date cannot be in the past.";
                 }
            } else {
                newErrors.earlyBird = "Please select a valid end date.";
            }
        }
        
        return newErrors;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        const getYouTubeId = (url: string): string | null => {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };

        const eventToSave: any = {
            ...formData,
            // The string 'YYYY-MM-DD' is parsed as UTC midnight
            date: new Date(formData.date.replace(/-/g, '/')).toISOString(),
            id: event?.id,
            status: event?.status || 'active',
            createdBy: event?.createdBy,
            hype: event?.hype,
        };
    
        if (formData.category === 'Movies') {
            eventToSave.actors = actorsString.split(',').map(a => a.trim()).filter(Boolean);
            eventToSave.rating = formData.rating ? parseFloat(String(formData.rating)) : undefined;
            eventToSave.trailerVideoId = getYouTubeId(trailerUrl);
            eventToSave.tickets = [];
            eventToSave.startTime = undefined;
            eventToSave.endTime = undefined;
            eventToSave.theatreId = undefined;
            eventToSave.screenId = undefined;
            eventToSave.city = 'Multiple Cities';
            eventToSave.venue = 'Multiple Theatres';
        } else {
            eventToSave.genre = undefined;
            eventToSave.actors = [];
            eventToSave.director = undefined;
            eventToSave.rating = undefined;
            eventToSave.screenListings = {};
            eventToSave.showtimes = [];
            eventToSave.trailerVideoId = undefined;
            if (eventToSave.theatreId && eventToSave.screenId) {
                eventToSave.tickets = []; // Seated events don't use general tickets
            } else {
                eventToSave.theatreId = undefined;
                eventToSave.screenId = undefined;
            }
        }
    
        onSave(eventToSave);
    };

    const formInputStyles = "w-full bg-zinc-800/50 border rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";
    const errorInputStyles = "border-red-500 ring-1 ring-red-500";
    const normalInputStyles = "border-slate-700";
    const isSeatedEvent = formData.category !== 'Movies' && !!formData.theatreId;
    
    const categoryOptions = [
        { value: 'Music', label: 'Music' },
        { value: 'Tech', label: 'Tech' },
        { value: 'Food & Drink', label: 'Food & Drink' },
        { value: 'Arts & Culture', label: 'Arts & Culture' },
        { value: 'Sports', label: 'Sports' },
        { value: 'Movies', label: 'Movies' },
    ];
    
    const cityOptions = INDIAN_CITIES.map(city => ({ value: city, label: city }));
    
    const theatreOptions = [
        { value: '', label: 'General Admission (No seating chart)' },
        ...theatres.map(theatre => ({ value: theatre.id, label: theatre.name }))
    ];
    
    const screenOptions = [
        { value: '', label: 'Select a screen...' },
        ...(theatres.find(t => t.id === formData.theatreId)?.screens.map(screen => ({ value: screen.id, label: screen.name })) || [])
    ];
    
    const discountTypeOptions = [
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed Amount' },
    ];
    
    const newDiscountTypeOptions = [
        { value: 'percentage', label: '%' },
        { value: 'fixed', label: '₹' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-8">{event ? 'Edit Event' : initialCategory === 'Movies' ? 'List a Movie' : 'Create a New Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 border border-slate-800 rounded-2xl p-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={formData.category === 'Movies' || isMovieForm ? 'md:col-span-2' : ''}>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={`${formInputStyles} ${errors.title ? errorInputStyles : normalInputStyles}`} />
                        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                    </div>
                    {formData.category !== 'Movies' && !isMovieForm && (
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                            <CustomSelect options={categoryOptions} value={formData.category} onChange={(value) => handleCustomSelectChange('category', value)} />
                        </div>
                    )}
                </div>

                {/* Event Settings */}
                <div className="border-t border-slate-800 pt-6">
                    <label htmlFor="isFeatured" className="flex items-center justify-between cursor-pointer">
                        <span className="font-semibold text-white">Mark as Featured Event</span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                id="isFeatured" 
                                name="isFeatured" 
                                checked={formData.isFeatured || false} 
                                onChange={handleChange} 
                                className="sr-only"
                            />
                            <div className="block bg-slate-700/50 border border-slate-700 w-12 h-6 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${(formData.isFeatured) ? 'transform translate-x-6 bg-green-500' : 'bg-red-600'}`}></div>
                        </div>
                    </label>
                    <p className="text-xs text-slate-400 mt-2">Featured events are displayed more prominently, for example, on the main banner.</p>
                </div>


                {/* Movie Specific Fields */}
                {formData.category === 'Movies' && (
                    <div className="border-t border-b border-slate-800 py-6 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                                <input type="text" name="genre" id="genre" value={formData.genre} onChange={handleChange} placeholder="e.g., Sci-Fi, Action" className={`${formInputStyles} ${normalInputStyles}`} />
                            </div>
                             <div>
                                <label htmlFor="director" className="block text-sm font-medium text-slate-300 mb-2">Director</label>
                                <input type="text" name="director" id="director" value={formData.director} onChange={handleChange} placeholder="e.g., Christopher Nolan" className={`${formInputStyles} ${normalInputStyles}`} />
                            </div>
                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-slate-300 mb-2">Rating (1-10)</label>
                                <input 
                                    type="number" 
                                    name="rating" 
                                    id="rating" 
                                    value={formData.rating || ''} 
                                    onChange={handleChange} 
                                    placeholder="e.g., 8.5" 
                                    min="1" 
                                    max="10" 
                                    step="0.1" 
                                    className={`${formInputStyles} ${normalInputStyles}`} 
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="actors" className="block text-sm font-medium text-slate-300 mb-2">Actors (comma-separated)</label>
                            <input type="text" name="actors" id="actors" value={actorsString} onChange={(e) => setActorsString(e.target.value)} placeholder="e.g., Tom Hanks, Scarlett Johansson" className={`${formInputStyles} ${normalInputStyles}`} />
                        </div>
                        <div>
                            <label htmlFor="trailerUrl" className="block text-sm font-medium text-slate-300 mb-2">YouTube Trailer URL</label>
                            <input type="url" id="trailerUrl" value={trailerUrl} onChange={e => setTrailerUrl(e.target.value)} placeholder="e.g., https://www.youtube.com/watch?v=..." className={`${formInputStyles} ${normalInputStyles}`} />
                            <p className="text-xs text-slate-500 mt-1">Paste the full YouTube URL. The Video ID will be extracted automatically.</p>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-300 mb-2">Assign to Theatres</label>
                             <div className="relative" ref={theatreSelectRef}>
                                <button type="button" onClick={() => setIsTheatreSelectOpen(!isTheatreSelectOpen)} className="w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-left flex justify-between items-center">
                                    <span className="text-white">
                                        {Object.keys(formData.screenListings || {}).length > 0 ? `${Object.keys(formData.screenListings || {}).length} theatre(s) selected` : 'Select theatres...'}
                                    </span>
                                     <svg className={`flex-shrink-0 ml-2 fill-current h-4 w-4 text-slate-400 transition-transform ${isTheatreSelectOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </button>
                                {isTheatreSelectOpen && (
                                    <div className="absolute z-10 top-full mt-1 w-full bg-zinc-800 border border-slate-700 rounded-lg flex flex-col max-h-96">
                                        <div className="p-2 sticky top-0 bg-zinc-800 z-10 border-b border-slate-700">
                                            <input
                                                type="text"
                                                placeholder="Search theatres by name or city..."
                                                value={theatreSearch}
                                                onChange={e => setTheatreSearch(e.target.value)}
                                                className="w-full bg-black/20 border border-slate-600 rounded-md py-1.5 px-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                        <div className="overflow-y-auto">
                                            {Object.keys(filteredTheatresByCity).length > 0 ? (
                                                Object.entries(filteredTheatresByCity).map(([city, cityTheatres]) => (
                                                    <div key={city}>
                                                        <h5 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase bg-zinc-900/70 backdrop-blur-sm sticky top-0">{city.toUpperCase()}</h5>
                                                        {cityTheatres.map(t => {
                                                             const allScreensForTheatre = t.screens.map(s => s.id);
                                                            const selectedScreensForTheatre = formData.screenListings?.[t.id] || [];
                                                            const areAllSelected = allScreensForTheatre.length > 0 && selectedScreensForTheatre.length === allScreensForTheatre.length;
                                                            const isIndeterminate = selectedScreensForTheatre.length > 0 && !areAllSelected;
                                                            return (
                                                                <div key={t.id} className="border-b border-slate-700/50 last:border-b-0">
                                                                    <div className="p-3 hover:bg-slate-700/30">
                                                                        <label className="flex items-center gap-3 cursor-pointer w-full">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={areAllSelected}
                                                                                ref={el => { if (el) { el.indeterminate = isIndeterminate; } }}
                                                                                onChange={() => handleTheatreToggleAllScreens(t.id)}
                                                                                className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                                                                            />
                                                                            <div>
                                                                                <span className="text-white font-semibold">{t.name}</span>
                                                                                <p className="text-xs text-slate-400">{t.screens.map(s => s.name).join(', ')}</p>
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                    <div className="pl-12 pr-3 pb-3 space-y-2">
                                                                        {t.screens.map(screen => (
                                                                            <label key={screen.id} className="flex items-center gap-3 cursor-pointer w-full">
                                                                                 <input 
                                                                                    type="checkbox" 
                                                                                    checked={selectedScreensForTheatre.includes(screen.id)} 
                                                                                    onChange={() => handleScreenToggle(t.id, screen.id)} 
                                                                                    className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                                                                                />
                                                                                <span className="text-sm text-slate-300">{screen.name}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="p-4 text-center text-sm text-slate-400">No theatres found.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                )}
                 {/* Showtime Schedule Section */}
                {formData.category === 'Movies' && Object.keys(formData.screenListings || {}).length > 0 && (
                    <div className="border-t border-slate-800 pt-6">
                        <h3 className="text-xl font-bold text-white mb-4">Showtime Schedule</h3>
                        <div className="space-y-4">
                            {Object.entries(formData.screenListings || {}).map(([theatreId, screenIds]) => {
                                const theatre = theatres.find(t => t.id === theatreId);
                                if (!theatre) return null;
                                return (
                                    <div key={theatreId} className="bg-black/20 p-4 rounded-lg border border-slate-700">
                                        <h4 className="font-semibold text-red-400">{theatre.name}</h4>
                                        <div className="mt-2 space-y-3">
                                            {/* FIX: The type of screenIds from Object.entries is not correctly inferred. Type guard and explicit parameter typing are used here. */}
                                            {Array.isArray(screenIds) && screenIds.map((screenId: string) => {
                                                const screen = theatre.screens.find(s => s.id === screenId);
                                                if (!screen) return null;
                                                const screenShowtimes = formData.showtimes?.filter(st => st.screenId === screenId).sort((a,b) => a.time.localeCompare(b.time)) || [];
                                                return (
                                                    <div key={screenId} className="border-t border-slate-800 pt-3">
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-semibold text-white">{screen.name}</p>
                                                            <button type="button" onClick={() => setShowtimeEditorState({ isOpen: true, theatre, screen })} className="text-sm font-semibold bg-red-600/20 text-red-400 py-1 px-3 rounded-md hover:bg-red-600/40">+ Add / Edit</button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {screenShowtimes.length > 0 ? screenShowtimes.map(st => (
                                                                <div key={st.id} className="bg-slate-800/50 p-2 rounded-md flex items-center gap-1.5 group">
                                                                    <span className="font-mono text-sm text-slate-300">{st.time}</span>
                                                                    <button type="button" onClick={() => handleRemoveShowtime(st.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                                    </button>
                                                                </div>
                                                            )) : <p className="text-xs text-slate-500">No showtimes scheduled for this screen.</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}


                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange} className={`${formInputStyles} ${errors.description ? errorInputStyles : normalInputStyles}`}></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                    <div className="text-right mt-2">
                         <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm font-semibold bg-red-600/20 text-red-400 py-1 px-3 rounded-md hover:bg-red-600/40 disabled:opacity-50">
                             {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                         </button>
                    </div>
                </div>

                {/* Location & Date */}
                <div className="border-t border-b border-slate-800 py-6 space-y-6">
                    <div className={`grid grid-cols-1 ${formData.category !== 'Movies' ? 'md:grid-cols-3' : ''} gap-6`}>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">
                                {formData.category === 'Movies' ? 'Release Date' : 'Date'}
                            </label>
                            <DatePicker
                                selectedDate={formData.date}
                                onDateChange={handleDateChange}
                                minDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        {formData.category !== 'Movies' && (
                            <>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">City</label>
                                    <CustomSelect options={cityOptions} value={formData.city} onChange={(value) => handleCustomSelectChange('city', value)} />
                                </div>
                                 <div>
                                    <label htmlFor="venue" className="block text-sm font-medium text-slate-300 mb-2">Venue Name</label>
                                    <input type="text" name="venue" id="venue" value={formData.venue} onChange={handleChange} className={`${formInputStyles} ${errors.venue ? errorInputStyles : normalInputStyles}`} />
                                     {errors.venue && <p className="mt-1 text-sm text-red-400">{errors.venue}</p>}
                                </div>
                            </>
                        )}
                    </div>
                    {formData.category !== 'Movies' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                                <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} className={`${formInputStyles} ${normalInputStyles}`} />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                                <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} className={`${formInputStyles} ${errors.endTime ? errorInputStyles : normalInputStyles}`} />
                                {errors.endTime && <p className="mt-1 text-sm text-red-400">{errors.endTime}</p>}
                            </div>
                        </div>
                    )}
                </div>

                 <div>
                    <label htmlFor="bannerImage" className="block text-sm font-medium text-slate-300 mb-2">Banner Image URL</label>
                    <input type="url" name="bannerImage" id="bannerImage" value={formData.bannerImage} onChange={handleChange} className={`${formInputStyles} ${errors.bannerImage ? errorInputStyles : normalInputStyles}`} />
                     {errors.bannerImage && <p className="mt-1 text-sm text-red-400">{errors.bannerImage}</p>}
                     {formData.bannerImage && !errors.bannerImage && (
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                           {imageStatus === 'loading' && <span>Validating image...</span>}
                           {imageStatus === 'error' && <span className="text-red-400">Could not load image. Check URL.</span>}
                           {imageStatus === 'success' && imageDimensions && (
                                <>
                                    <span>Dimensions: {imageDimensions.width}x{imageDimensions.height}px</span>
                                    {imageValidationError && <span className="text-yellow-400">{imageValidationError}</span>}
                                </>
                           )}
                        </div>
                    )}
                 </div>

                 {/* Seating Arrangement for non-movies */}
                {formData.category !== 'Movies' && (
                    <div className="border-t border-slate-800 pt-6">
                        <h3 className="text-xl font-bold text-white mb-4">Seating Arrangement</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label htmlFor="theatreId" className="block text-sm font-medium text-slate-300 mb-2">Assign Theatre (for seated events)</label>
                                <CustomSelect options={theatreOptions} value={formData.theatreId} onChange={(value) => handleCustomSelectChange('theatreId', value)} />
                            </div>
                             {formData.theatreId && (
                                <div>
                                    <label htmlFor="screenId" className="block text-sm font-medium text-slate-300 mb-2">Select Screen</label>
                                    <CustomSelect options={screenOptions} value={formData.screenId} onChange={(value) => handleCustomSelectChange('screenId', value)} />
                                </div>
                             )}
                         </div>
                    </div>
                )}


                {/* Ticketing */}
                {!isSeatedEvent && formData.category !== 'Movies' && (
                    <div className="border-t border-slate-800 pt-6">
                        <h3 className="text-xl font-bold text-white mb-4">Ticketing</h3>
                        {errors.tickets && <p className="mb-2 text-sm text-red-400">{errors.tickets}</p>}
                        <div className="space-y-4">
                            {formData.tickets.map((ticket, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-black/20 p-4 rounded-lg">
                                    <div className="md:col-span-5">
                                        <label className="text-xs font-medium text-slate-400">Ticket Name</label>
                                        <input type="text" placeholder="e.g., General Admission" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} className={`${formInputStyles} ${errors.ticketErrors?.[index] ? errorInputStyles : normalInputStyles}`} />
                                    </div>
                                     <div className="md:col-span-3">
                                        <label className="text-xs font-medium text-slate-400">Price (₹)</label>
                                        <input type="number" placeholder="0" min="0" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} className={`${formInputStyles} ${errors.ticketErrors?.[index] ? errorInputStyles : normalInputStyles}`} />
                                    </div>
                                     <div className="md:col-span-3">
                                        <label className="text-xs font-medium text-slate-400">Quantity</label>
                                        <input type="number" placeholder="100" min="0" value={ticket.quantityAvailable} onChange={(e) => handleTicketChange(index, 'quantityAvailable', e.target.value)} className={`${formInputStyles} ${errors.ticketErrors?.[index] ? errorInputStyles : normalInputStyles}`} />
                                    </div>
                                    <div className="md:col-span-1 flex items-end h-full">
                                        <button type="button" onClick={() => removeTicketType(index)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors w-full h-10">
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                    {errors.ticketErrors?.[index] && <p className="md:col-span-12 text-sm text-red-400 -mt-2">{errors.ticketErrors[index]}</p>}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addTicketType} className="mt-4 text-sm font-semibold bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition-colors">+ Add Ticket Type</button>
                    </div>
                )}
                
                {/* Promotion Tools */}
                 <div className="border-t border-slate-800 pt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Promotion Tools</h3>
                    <div className="space-y-6">
                        {/* Early Bird */}
                        <div className={`bg-black/20 p-4 rounded-lg border ${errors.earlyBird ? 'border-red-500' : 'border-slate-700'}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.earlyBird?.isActive || false} onChange={e => handleEarlyBirdChange('isActive', e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-red-600 focus:ring-red-600"/>
                                <span className="font-semibold text-white">Enable Early Bird Discount</span>
                            </label>
                            {formData.earlyBird?.isActive && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                     <div>
                                        <label className="text-xs text-slate-400 block mb-1">Discount Type</label>
                                        <CustomSelect options={discountTypeOptions} value={formData.earlyBird.discountType} onChange={(value) => handleEarlyBirdChange('discountType', value || 'percentage')} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Value ({formData.earlyBird.discountType === 'percentage' ? '%' : '₹'})</label>
                                        <input type="number" min="0" value={formData.earlyBird.discountValue} onChange={e => handleEarlyBirdChange('discountValue', Number(e.target.value))} className={`${formInputStyles} ${normalInputStyles}`}/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Offer Ends On</label>
                                         <input type="date" value={formData.earlyBird.endDate} onChange={e => handleEarlyBirdChange('endDate', e.target.value)} className={`${formInputStyles} ${normalInputStyles}`}/>
                                    </div>
                                </div>
                            )}
                            {errors.earlyBird && <p className="mt-2 text-sm text-red-400">{errors.earlyBird}</p>}
                        </div>
                         {/* Discount Codes */}
                        <div className="bg-black/20 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-semibold text-white mb-4">Discount Codes</h4>
                             <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                                 <div className="flex-1 w-full">
                                    <label className="text-xs text-slate-400 block mb-1">Code Name</label>
                                    <input type="text" placeholder="E.g., SAVE10" value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className={`${formInputStyles} ${normalInputStyles}`}/>
                                 </div>
                                 <div className="w-full sm:w-32">
                                     <label className="text-xs text-slate-400 block mb-1">Type</label>
                                     <CustomSelect options={newDiscountTypeOptions} value={newDiscount.type} onChange={(value) => setNewDiscount({...newDiscount, type: (value || 'percentage') as any})} />
                                 </div>
                                  <div className="w-full sm:w-32">
                                     <label className="text-xs text-slate-400 block mb-1">Value</label>
                                    <input type="number" min="0" value={newDiscount.value} onChange={e => setNewDiscount({...newDiscount, value: Number(e.target.value)})} className={`${formInputStyles} ${normalInputStyles}`}/>
                                 </div>
                                <button type="button" onClick={handleAddDiscountCode} className="h-10 px-4 bg-red-600 text-white font-bold rounded-lg text-sm w-full sm:w-auto">Add</button>
                            </div>
                            <div className="space-y-2">
                                {(formData.discountCodes || []).map(code => (
                                    <div key={code.code} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                                        <span className="font-mono text-red-400">{code.code}</span>
                                        <span>- {code.type === 'percentage' ? `${code.value}%` : `₹${code.value}`}</span>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => handleGenerateShareLink(code)} className="text-sm font-semibold text-purple-400 hover:text-purple-300">
                                                {linkCopied === code.code ? 'Copied!' : 'Get Link'}
                                            </button>
                                            <button type="button" onClick={() => handleRemoveDiscountCode(code.code)} className="text-red-400 p-1.5 rounded-md hover:bg-red-500/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
                    <button type="button" onClick={onCancel} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">
                        {event ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </form>

            {showtimeEditorState.isOpen && showtimeEditorState.theatre && showtimeEditorState.screen && (
                <ShowtimeEditorModal
                    theatre={showtimeEditorState.theatre}
                    screen={showtimeEditorState.screen}
                    movieShowtimes={formData.showtimes || []}
                    onClose={() => setShowtimeEditorState({ isOpen: false, theatre: null, screen: null })}
                    onSave={handleSaveShowtimesForScreen}
                />
            )}
        </div>
    );
};

export default EventForm;
