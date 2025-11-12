import React, { useState } from 'react';
import { Theatre, Screen, SeatLayout, SEAT_CATEGORIES_DEFAULT } from '../types.ts';
import SeatLayoutEditor from './SeatLayoutEditor.tsx';
import Modal from './Modal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

interface ShowtimeSettingsModalProps {
    screen: Screen;
    onClose: () => void;
    onSave: (newShowtimes: string[]) => void;
}

const ShowtimeSettingsModal: React.FC<ShowtimeSettingsModalProps> = ({ screen, onClose, onSave }) => {
    const [times, setTimes] = useState<string[]>(screen.defaultShowtimes || []);
    const [newTime, setNewTime] = useState('');

    const handleAddTime = () => {
        if (newTime && !times.includes(newTime)) {
            setTimes(prev => [...prev, newTime].sort());
            setNewTime('');
        }
    };
    
    const handleRemoveTime = (timeToRemove: string) => {
        setTimes(prev => prev.filter(t => t !== timeToRemove));
    };

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <Modal isOpen={true} onClose={onClose}>
            <h2 className="text-2xl font-bold text-white mb-2">Default Showtime Settings</h2>
            <p className="text-slate-400 mb-6">For: <span className="font-semibold text-red-500">{screen.name}</span></p>

            <div className="space-y-4">
                 <div className="flex items-end gap-3">
                    <div className="flex-grow">
                        <label htmlFor="newTime" className="block text-sm font-medium text-slate-300 mb-2">Add New Time</label>
                        <input
                            id="newTime"
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className={formInputStyles}
                        />
                    </div>
                    <button onClick={handleAddTime} className="bg-red-600 text-white font-bold h-10 px-6 rounded-lg text-sm hover:bg-red-700 transition-colors">
                        Add
                    </button>
                </div>

                <div className="max-h-60 overflow-y-auto bg-black/20 p-3 rounded-lg border border-slate-700 space-y-2">
                    {times.length > 0 ? times.map(time => (
                        <div key={time} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                            <span className="font-mono text-white">{time}</span>
                            <button onClick={() => handleRemoveTime(time)} className="text-red-400 p-1.5 rounded-md hover:bg-red-500/10">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-sm text-slate-500 py-4">No default showtimes added.</p>
                    )}
                </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
                <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                <button type="button" onClick={() => onSave(times)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">Save Settings</button>
            </div>
        </Modal>
    );
};


interface TheatreManagementProps {
    initialTheatres: Theatre[];
    onSaveTheatres: (theatres: Theatre[]) => void;
}

const TheatreManagement: React.FC<TheatreManagementProps> = ({ initialTheatres, onSaveTheatres }) => {
    const [theatres, setTheatres] = useState<Theatre[]>(initialTheatres);
    const [isSeatEditorOpen, setIsSeatEditorOpen] = useState(false);
    const [isTheatreEditorOpen, setIsTheatreEditorOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    const [editingTheatre, setEditingTheatre] = useState<Theatre | null>(null);
    const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'theatre' | 'screen', id: string, parentId?: string } | null>(null);


    const openSeatEditor = (theatre: Theatre, screen: Screen) => {
        setEditingTheatre(theatre);
        setEditingScreen(screen);
        setIsSeatEditorOpen(true);
    };

    const openSettingsModal = (theatre: Theatre, screen: Screen) => {
        setEditingTheatre(theatre);
        setEditingScreen(screen);
        setIsSettingsModalOpen(true);
    };


    const handleLayoutChange = (newLayout: SeatLayout) => {
        if (!editingTheatre || !editingScreen) return;
        setEditingScreen(prev => prev ? { ...prev, seatLayout: newLayout } : null);
    };
    
    const handleSaveSeatLayout = () => {
        if (!editingTheatre || !editingScreen) return;
        const updatedTheatres = theatres.map(t => 
            t.id === editingTheatre.id 
                ? { ...t, screens: t.screens.map(s => s.id === editingScreen.id ? editingScreen : s) } 
                : t
        );
        setTheatres(updatedTheatres);
        onSaveTheatres(updatedTheatres);
        setIsSeatEditorOpen(false);
    };

    const handleSaveShowtimes = (newShowtimes: string[]) => {
        if (!editingTheatre || !editingScreen) return;
        const updatedScreen = { ...editingScreen, defaultShowtimes: newShowtimes.sort() };
        const updatedTheatres = theatres.map(t =>
            t.id === editingTheatre.id
                ? { ...t, screens: t.screens.map(s => s.id === editingScreen.id ? updatedScreen : s) }
                : t
        );
        setTheatres(updatedTheatres);
        onSaveTheatres(updatedTheatres);
        setIsSettingsModalOpen(false);
    };


    const handleOpenTheatreEditor = (theatre: Theatre | null) => {
        setEditingTheatre(theatre ? {...theatre} : { id: '', name: '', city: 'Mumbai', screens: [] });
        setIsTheatreEditorOpen(true);
    };

    const handleSaveTheatre = () => {
        if (!editingTheatre) return;
        let updatedTheatres;
        if (theatres.some(t => t.id === editingTheatre.id)) {
            updatedTheatres = theatres.map(t => t.id === editingTheatre.id ? editingTheatre : t);
        } else {
            updatedTheatres = [...theatres, { ...editingTheatre, id: `thr-${Date.now()}` }];
        }
        setTheatres(updatedTheatres);
        onSaveTheatres(updatedTheatres);
        setIsTheatreEditorOpen(false);
    };

    const handleDeleteTheatre = (theatreId: string) => {
        setItemToDelete({ type: 'theatre', id: theatreId });
    };

    const handleAddScreen = (theatreId: string) => {
        const newScreen: Screen = {
            id: `scr-${Date.now()}`,
            name: `New Screen ${Math.floor(Math.random() * 100)}`,
            seatLayout: { rows: 5, cols: 10, grid: Array(5).fill(Array(10).fill('standard')), categories: SEAT_CATEGORIES_DEFAULT }
        };
        const updatedTheatres = theatres.map(t => t.id === theatreId ? { ...t, screens: [...t.screens, newScreen] } : t);
        setTheatres(updatedTheatres);
        onSaveTheatres(updatedTheatres);
    };
    
    const handleDeleteScreen = (theatreId: string, screenId: string) => {
        setItemToDelete({ type: 'screen', id: screenId, parentId: theatreId });
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'theatre') {
            const updatedTheatres = theatres.filter(t => t.id !== itemToDelete.id);
            setTheatres(updatedTheatres);
            onSaveTheatres(updatedTheatres);
        } else if (itemToDelete.type === 'screen') {
            const { id: screenId, parentId: theatreId } = itemToDelete;
            const updatedTheatres = theatres.map(t =>
                t.id === theatreId
                    ? { ...t, screens: t.screens.filter(s => s.id !== screenId) }
                    : t
            );
            setTheatres(updatedTheatres);
            onSaveTheatres(updatedTheatres);
        }
        setItemToDelete(null);
    };

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Theatre & Screen Management</h3>
                    <button onClick={() => handleOpenTheatreEditor(null)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                        + Add New Theatre
                    </button>
                </div>
                <div className="space-y-6">
                    {theatres.map(theatre => (
                        <div key={theatre.id} className="bg-black/20 p-4 rounded-lg border border-slate-800">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xl font-semibold text-white">{theatre.name} <span className="text-sm text-slate-400 font-normal">- {theatre.city}</span></h4>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenTheatreEditor(theatre)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                                    <button onClick={() => handleDeleteTheatre(theatre.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                {theatre.screens.map(screen => (
                                    <div key={screen.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md">
                                        <div>
                                            <p className="font-semibold">{screen.name}</p>
                                            <p className="text-xs text-slate-400">{screen.seatLayout.rows} Rows &times; {screen.seatLayout.cols} Columns</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openSettingsModal(theatre, screen)} className="font-medium text-purple-400 hover:text-purple-300 bg-purple-600/10 hover:bg-purple-600/20 px-3 py-1 rounded-md transition text-xs">Settings</button>
                                            <button onClick={() => openSeatEditor(theatre, screen)} className="font-medium text-red-500 hover:text-red-400 bg-red-600/10 hover:bg-red-600/20 px-3 py-1 rounded-md transition text-xs">Edit Layout</button>
                                            <button onClick={() => handleDeleteScreen(theatre.id, screen.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => handleAddScreen(theatre.id)} className="mt-4 text-sm font-semibold bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition-colors">+ Add Screen</button>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isSeatEditorOpen} onClose={() => setIsSeatEditorOpen(false)} maxWidth="max-w-6xl">
                 {editingScreen && editingTheatre && (
                    <div className="max-h-[85vh] overflow-y-auto p-1">
                        <h2 className="text-2xl font-bold text-white mb-2">Edit Seat Layout</h2>
                        <p className="text-slate-400 mb-6">{editingTheatre.name} - {editingScreen.name}</p>
                        <SeatLayoutEditor layout={editingScreen.seatLayout} onLayoutChange={handleLayoutChange} />
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
                            <button type="button" onClick={() => setIsSeatEditorOpen(false)} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                            <button type="button" onClick={handleSaveSeatLayout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">Save Changes</button>
                        </div>
                    </div>
                 )}
            </Modal>

            {isSettingsModalOpen && editingScreen && (
                <ShowtimeSettingsModal
                    screen={editingScreen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    onSave={handleSaveShowtimes}
                />
            )}

            {isTheatreEditorOpen && editingTheatre && (
                 <Modal isOpen={isTheatreEditorOpen} onClose={() => setIsTheatreEditorOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-6">{editingTheatre.id ? 'Edit Theatre' : 'Add New Theatre'}</h2>
                    <div className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-300 mb-2">Theatre Name</label>
                             <input type="text" value={editingTheatre.name} onChange={e => setEditingTheatre({...editingTheatre, name: e.target.value})} className={formInputStyles}/>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                             <input type="text" value={editingTheatre.city} onChange={e => setEditingTheatre({...editingTheatre, city: e.target.value})} className={formInputStyles}/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setIsTheatreEditorOpen(false)} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                        <button type="button" onClick={handleSaveTheatre} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">Save Theatre</button>
                    </div>
                 </Modal>
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title={itemToDelete?.type === 'theatre' ? "Delete Theatre" : "Delete Screen"}
                message={
                    itemToDelete?.type === 'theatre' 
                        ? `Are you sure you want to delete the theatre "${theatres.find(t => t.id === itemToDelete.id)?.name}" and all its screens? This action cannot be undone.` 
                        : `Are you sure you want to delete this screen? This action cannot be undone.`
                }
                confirmText="Delete"
            />
        </>
    );
};

export default TheatreManagement;