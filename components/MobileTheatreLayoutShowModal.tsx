import React, { useState, useMemo } from 'react';
import { TourStop, SeatLayout, SEAT_CATEGORIES_DEFAULT, MobileShowtime } from '../types';
import SeatLayoutEditor from './SeatLayoutEditor';
import Modal from './Modal';

interface MobileTheatreLayoutShowModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourStop: TourStop;
    onSave: (updatedTourStop: TourStop) => void;
}

const MobileTheatreLayoutShowModal: React.FC<MobileTheatreLayoutShowModalProps> = ({ isOpen, onClose, tourStop, onSave }) => {
    
    const [localTourStop, setLocalTourStop] = useState<TourStop>(() => {
        // Ensure tour stop has a default layout if none exists
        const layout = tourStop.seatLayout || {
            rows: 15,
            cols: 25,
            grid: Array(15).fill(null).map(() => Array(25).fill('standard')),
            categories: SEAT_CATEGORIES_DEFAULT,
        };
        return { ...tourStop, seatLayout: layout };
    });
    
    const [newShowtime, setNewShowtime] = useState({ date: '', time: '' });

    const handleLayoutChange = (newLayout: SeatLayout) => {
        setLocalTourStop(prev => ({ ...prev, seatLayout: newLayout }));
    };

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalTourStop(prev => ({ ...prev, [name]: value }));
    };

    const handleAddShowtime = () => {
        if (!newShowtime.date || !newShowtime.time || !localTourStop.seatLayout) return;
        const newShow: MobileShowtime = {
            id: `ms-${Date.now()}`,
            date: newShowtime.date,
            time: newShowtime.time,
            seatStatus: localTourStop.seatLayout.grid.map(row => 
                row.map(cell => ['aisle', 'empty', 'stage-left', 'stage-right', 'ramp'].includes(cell) ? 'locked' : 'available')
            ),
        };
        setLocalTourStop(prev => ({
            ...prev,
            showtimes: [...(prev.showtimes || []), newShow]
        }));
        setNewShowtime({ date: '', time: '' });
    };
    
    const handleRemoveShowtime = (showtimeId: string) => {
        setLocalTourStop(prev => ({
            ...prev,
            showtimes: prev.showtimes?.filter(s => s.id !== showtimeId)
        }));
    };

    const handleSave = () => {
        onSave(localTourStop);
    };

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl">
            <div className="max-h-[85vh] flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2">Manage Layout & Shows</h2>
                <p className="text-slate-400 mb-6">For stop at <span className="font-semibold text-red-500">{tourStop.location}</span></p>
                
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Venue Name</label>
                            <input type="text" name="venueName" value={localTourStop.venueName} onChange={handleDetailChange} required className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Entry Gate</label>
                            <input type="text" name="entryGate" value={localTourStop.entryGate || ''} onChange={handleDetailChange} required className={formInputStyles} />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Showtimes</h3>
                        <div className="bg-black/20 p-3 rounded-lg border border-slate-700">
                             <div className="flex items-end gap-3 mb-3">
                                <div className="flex-grow">
                                    <label className="text-xs text-slate-400">Date</label>
                                    <input type="date" value={newShowtime.date} onChange={e => setNewShowtime(p => ({...p, date: e.target.value}))} className={formInputStyles} />
                                </div>
                                 <div className="flex-grow">
                                    <label className="text-xs text-slate-400">Time</label>
                                    <input type="time" value={newShowtime.time} onChange={e => setNewShowtime(p => ({...p, time: e.target.value}))} className={formInputStyles} />
                                </div>
                                <button type="button" onClick={handleAddShowtime} className="h-10 px-4 bg-red-600 text-white font-bold rounded-lg text-sm">Add</button>
                            </div>
                            <div className="space-y-2">
                                {(localTourStop.showtimes || []).map(show => (
                                    <div key={show.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                                        <span className="font-semibold text-white">{new Date(show.date).toLocaleDateString('en-IN', {weekday: 'short', day: '2-digit', month: 'short'})} - {show.time}</span>
                                        <button type="button" onClick={() => handleRemoveShowtime(show.id)} className="text-red-400 p-1.5 rounded-md hover:bg-red-500/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Seat Layout</h3>
                        {localTourStop.seatLayout && <SeatLayoutEditor layout={localTourStop.seatLayout} onLayoutChange={handleLayoutChange} />}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Save Changes for this Stop</button>
                </div>
            </div>
        </Modal>
    );
};

export default MobileTheatreLayoutShowModal;