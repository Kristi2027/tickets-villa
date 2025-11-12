import React, { useState } from 'react';
import { MobileTheatre } from '../types';
import MobileTheatreFormModal from './MobileTheatreFormModal';
import ConfirmationModal from './ConfirmationModal';

interface MobileTheatreManagementProps {
    mobileTheatres: MobileTheatre[];
    onSaveMobileTheatre: (theatre: MobileTheatre) => void;
    onDeleteMobileTheatre: (theatreId: string) => void;
}

const MobileTheatreManagement: React.FC<MobileTheatreManagementProps> = ({ mobileTheatres, onSaveMobileTheatre, onDeleteMobileTheatre }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheatre, setEditingTheatre] = useState<MobileTheatre | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAddNew = () => {
        setEditingTheatre(null);
        setIsModalOpen(true);
    };

    const handleEdit = (theatre: MobileTheatre) => {
        setEditingTheatre(theatre);
        setIsModalOpen(true);
    };

    const handleSave = (theatre: MobileTheatre) => {
        onSaveMobileTheatre(theatre);
        setIsModalOpen(false);
    };

    const handleDelete = (theatreId: string) => {
        setItemToDelete(theatreId);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteMobileTheatre(itemToDelete);
        }
        setItemToDelete(null);
    };

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Mobile Theatre Management</h3>
                    <button onClick={handleAddNew} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                        + Add New Theatre
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Theatre Name</th>
                                <th className="px-4 py-3">Owner</th>
                                <th className="px-4 py-3">Season</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mobileTheatres.map(theatre => (
                                <tr key={theatre.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{theatre.name}</td>
                                    <td className="px-4 py-3">{theatre.owner}</td>
                                    <td className="px-4 py-3">{theatre.season}</td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleEdit(theatre)} className="font-medium text-red-500 hover:text-red-400">Edit</button>
                                        <button onClick={() => handleDelete(theatre.id)} className="font-medium text-slate-400 hover:text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <MobileTheatreFormModal
                    theatreToEdit={editingTheatre}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Mobile Theatre"
                message="Are you sure you want to delete this theatre? All of its data will be permanently removed. This action cannot be undone."
                confirmText="Delete"
            />
        </>
    );
};

export default MobileTheatreManagement;