import React, { useState } from 'react';
import { Event, Theatre } from '../types.ts';
import EventForm from './EventForm.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

interface MovieManagementProps {
    events: Event[];
    theatres: Theatre[];
    onSelectEvent: (event: Event) => void;
    onSaveEvent: (event: Event) => void;
    onDeleteEvent: (eventId: string) => void;
}

const MovieManagement: React.FC<MovieManagementProps> = ({ events, theatres, onSelectEvent, onSaveEvent, onDeleteEvent }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const movieEvents = events.filter(event => event.category === 'Movies');

    const handleAddNew = () => {
        setEditingEvent(null);
        setIsFormVisible(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setIsFormVisible(true);
    };

    const handleSave = (event: Event) => {
        onSaveEvent(event);
        setIsFormVisible(false);
        setEditingEvent(null);
    };

    const handleDelete = (eventId: string) => {
        setItemToDelete(eventId);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteEvent(itemToDelete);
        }
        setItemToDelete(null);
    };
    
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-300';
            case 'pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'rejected': return 'bg-red-500/20 text-red-300';
            case 'past': return 'bg-slate-500/20 text-slate-400';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    if (isFormVisible) {
        return <EventForm 
            event={editingEvent} 
            theatres={theatres}
            onSave={handleSave} 
            onCancel={() => setIsFormVisible(false)}
            initialCategory="Movies"
        />;
    }

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Movie Management</h3>
                    <button onClick={handleAddNew} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                        + List Movie
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Movie Title</th>
                                <th className="px-4 py-3">Genre</th>
                                <th className="px-4 py-3">Release Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movieEvents.map(event => (
                                <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{event.title}</td>
                                    <td className="px-4 py-3">{event.genre}</td>
                                    <td className="px-4 py-3">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusChip(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => onSelectEvent(event)} className="font-medium text-cyan-400 hover:text-cyan-300">Details</button>
                                        <button onClick={() => handleEdit(event)} className="font-medium text-red-500 hover:text-red-400">Edit</button>
                                        <button onClick={() => handleDelete(event.id)} className="font-medium text-slate-400 hover:text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Movie"
                message="Are you sure you want to delete this movie? All of its data will be permanently removed. This action cannot be undone."
                confirmText="Delete"
            />
        </>
    );
};

export default MovieManagement;