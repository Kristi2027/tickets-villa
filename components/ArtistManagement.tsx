import React, { useState } from 'react';
import { Artist } from '../types';
import ArtistFormModal from './ArtistFormModal';
import ConfirmationModal from './ConfirmationModal';

interface ArtistManagementProps {
    artists: Artist[];
    onSaveArtist: (artist: Artist) => void;
    onDeleteArtist: (artistId: string) => void;
    onViewArtistDashboard: (artist: Artist) => void;
}

const ArtistManagement: React.FC<ArtistManagementProps> = ({ artists, onSaveArtist, onDeleteArtist, onViewArtistDashboard }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAddNew = () => {
        setEditingArtist(null);
        setIsModalOpen(true);
    };

    const handleEdit = (artist: Artist) => {
        setEditingArtist(artist);
        setIsModalOpen(true);
    };

    const handleSave = (artist: Artist) => {
        onSaveArtist(artist);
        setIsModalOpen(false);
    };

    const handleDelete = (artistId: string) => {
        setItemToDelete(artistId);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteArtist(itemToDelete);
        }
        setItemToDelete(null);
    };
    
    const artistToDelete = artists.find(a => a.id === itemToDelete);

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Artist Management</h3>
                    <button onClick={handleAddNew} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                        + Add New Artist
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Artist Name</th>
                                <th className="px-4 py-3">Genre</th>
                                <th className="px-4 py-3">Associated Email</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artists.map(artist => (
                                <tr key={artist.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{artist.name}</td>
                                    <td className="px-4 py-3">{artist.genre}</td>
                                    <td className="px-4 py-3">{artist.userEmail}</td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => onViewArtistDashboard(artist)} className="font-medium text-cyan-400 hover:text-cyan-300">Dashboard</button>
                                        <button onClick={() => handleEdit(artist)} className="font-medium text-red-500 hover:text-red-400">Edit</button>
                                        <button onClick={() => handleDelete(artist.id)} className="font-medium text-slate-400 hover:text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <ArtistFormModal
                    artistToEdit={editingArtist}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Artist"
                message={`Are you sure you want to delete the artist "${artistToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </>
    );
};

export default ArtistManagement;