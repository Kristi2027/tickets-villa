import React, { useState } from 'react';
import { MobileTheatre, TourStop, SEAT_CATEGORIES_DEFAULT } from '../types';
import MobileTheatreLayoutShowModal from './MobileTheatreLayoutShowModal';

interface MobileTheatreFormModalProps {
    theatreToEdit: MobileTheatre | null;
    onSave: (theatre: MobileTheatre) => void;
    onClose: () => void;
}

const initialTheatreState: Omit<MobileTheatre, 'id'> = {
    name: '',
    owner: '',
    season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    bannerImage: 'https://images.unsplash.com/photo-1594903328362-23e5a3296068?q=80&w=1974&auto=format&fit=crop&ixlib-rb-4.0.3&id=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: '',
    tourPlan: [],
};

const MobileTheatreFormModal: React.FC<MobileTheatreFormModalProps> = ({ theatreToEdit, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<MobileTheatre, 'id'>>(() => {
        return theatreToEdit ? { ...theatreToEdit } : initialTheatreState;
    });
    const [layoutModalState, setLayoutModalState] = useState<{ isOpen: boolean; tourStopIndex: number | null; }>({ isOpen: false, tourStopIndex: null });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTourPlanChange = (index: number, field: keyof TourStop, value: string) => {
        setFormData(prev => {
            const newTourPlan = [...prev.tourPlan];
            newTourPlan[index] = { ...newTourPlan[index], [field]: value };
            return { ...prev, tourPlan: newTourPlan };
        });
    };
    
    const addTourStop = () => {
        setFormData(prev => ({
            ...prev,
            tourPlan: [...prev.tourPlan, { location: '', venueName: '', startDate: '', endDate: '' }]
        }));
    };
    
    const removeTourStop = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tourPlan: prev.tourPlan.filter((_, i) => i !== index)
        }));
    };

    const handleSaveLayoutAndShows = (updatedTourStop: TourStop) => {
        if (layoutModalState.tourStopIndex !== null) {
            const index = layoutModalState.tourStopIndex;
            setFormData(prev => {
                const newTourPlan = [...prev.tourPlan];
                newTourPlan[index] = updatedTourStop;
                return { ...prev, tourPlan: newTourPlan };
            });
        }
        setLayoutModalState({ isOpen: false, tourStopIndex: null });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            id: theatreToEdit?.id || '',
        };
        onSave(finalData as MobileTheatre);
    };

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
         <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
                <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold text-white mb-6">{theatreToEdit ? 'Edit Mobile Theatre' : 'Create New Mobile Theatre'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Theatre Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyles} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Owner Name</label>
                                <input type="text" name="owner" value={formData.owner} onChange={handleChange} required className={formInputStyles} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Season</label>
                            <input type="text" name="season" value={formData.season} onChange={handleChange} required placeholder="e.g., 2024-2025" className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Banner Image URL</label>
                            <input type="url" name="bannerImage" value={formData.bannerImage} onChange={handleChange} required className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className={formInputStyles}></textarea>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Tour Plan</label>
                            <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-slate-700">
                            {formData.tourPlan.map((stop, index) => (
                                <div key={index} className="bg-slate-800/50 p-3 rounded-md">
                                    <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
                                        <div className="md:col-span-3">
                                            <label className="text-xs text-slate-400">Location</label>
                                            <input type="text" value={stop.location} onChange={e => handleTourPlanChange(index, 'location', e.target.value)} placeholder="Location/City" className={`${formInputStyles}`} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-slate-400">Start Date</label>
                                            <input type="date" value={stop.startDate} onChange={e => handleTourPlanChange(index, 'startDate', e.target.value)} className={`${formInputStyles}`} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-slate-400">End Date</label>
                                            <input type="date" value={stop.endDate} onChange={e => handleTourPlanChange(index, 'endDate', e.target.value)} className={`${formInputStyles}`} />
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-end h-full">
                                            <button type="button" onClick={() => removeTourStop(index)} className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors h-10 w-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-right">
                                         <button type="button" onClick={() => setLayoutModalState({ isOpen: true, tourStopIndex: index })} className="text-sm font-semibold bg-red-600/20 text-red-400 py-1.5 px-3 rounded-md hover:bg-red-600/40">
                                            Manage Layout & Shows
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addTourStop} className="mt-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition-colors w-full">+ Add Tour Stop</button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                            <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Save Theatre</button>
                        </div>
                    </form>
                </div>
            </div>
            {layoutModalState.isOpen && layoutModalState.tourStopIndex !== null && (
                <MobileTheatreLayoutShowModal
                    isOpen={layoutModalState.isOpen}
                    onClose={() => setLayoutModalState({ isOpen: false, tourStopIndex: null })}
                    tourStop={formData.tourPlan[layoutModalState.tourStopIndex]}
                    onSave={handleSaveLayoutAndShows}
                />
            )}
         </>
    );
};

export default MobileTheatreFormModal;