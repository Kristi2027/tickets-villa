import React, { useState } from 'react';
import { Venue } from '../types';
import VenueFormModal from './VenueFormModal';
import ConfirmationModal from './ConfirmationModal';

interface VenueManagementProps {
    venues: Venue[];
    onSelectVenue: (venue: Venue) => void;
    onSaveVenue: (venue: Venue) => void;
    onDeleteVenue: (venueId: string) => void;
}

const VenueManagement: React.FC<VenueManagementProps> = ({ venues, onSelectVenue, onSaveVenue, onDeleteVenue }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAddNew = () => {
        setEditingVenue(null);
        setIsModalOpen(true);
    };

    const handleEdit = (venue: Venue) => {
        setEditingVenue(venue);
        setIsModalOpen(true);
    };

    const handleSave = (venue: Venue) => {
        onSaveVenue(venue);
        setIsModalOpen(false);
    };

    const handleDelete = (venueId: string) => {
        setItemToDelete(venueId);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteVenue(itemToDelete);
        }
        setItemToDelete(null);
    };

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Venue Management</h3>
                    <button onClick={handleAddNew} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                        + Add New Venue
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Venue Name</th>
                                <th className="px-4 py-3">City</th>
                                <th className="px-4 py-3">Capacity</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venues.map(venue => (
                                <tr key={venue.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{venue.name}</td>
                                    <td className="px-4 py-3">{venue.city}</td>
                                    <td className="px-4 py-3">{venue.capacity}</td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => onSelectVenue(venue)} className="font-medium text-cyan-400 hover:text-cyan-300">Details</button>
                                        <button onClick={() => handleEdit(venue)} className="font-medium text-red-500 hover:text-red-400">Edit</button>
                                        <button onClick={() => handleDelete(venue.id)} className="font-medium text-slate-400 hover:text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <VenueFormModal
                    venueToEdit={editingVenue}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Venue"
                message="Are you sure you want to delete this venue? All of its data will be permanently removed. This action cannot be undone."
                confirmText="Delete"
            />
        </>
    );
};

export default VenueManagement;