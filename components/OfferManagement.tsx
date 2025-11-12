import React, { useState } from 'react';
import { Offer } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface OfferManagementProps {
    offers: Offer[];
    onSaveOffer: (offer: Offer) => void;
    onDeleteOffer: (offerId: string) => void;
}

// Sub-component for the form
const OfferForm: React.FC<{
    offer: Offer | null;
    onSave: (offer: Offer) => void;
    onCancel: () => void;
}> = ({ offer, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: offer?.title || '',
        details: offer?.details || '',
        type: offer?.type || 'tag',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: offer?.id || '' } as Offer);
    };

    const formInputStyles = "w-full bg-black border border-red-600 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-black/20 p-6 rounded-lg border border-slate-700">
            <h4 className="text-xl font-bold text-white">{offer ? 'Edit Offer' : 'Create New Offer'}</h4>
            <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Offer Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className={formInputStyles} placeholder="e.g., Get upto INR1000 Off*..."/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Details (optional)</label>
                <textarea name="details" value={formData.details} onChange={handleChange} rows={2} className={formInputStyles} placeholder="e.g., Terms and conditions apply."></textarea>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Offer Type (for Icon)</label>
                <select name="type" value={formData.type} onChange={handleChange} className={formInputStyles}>
                    <option value="tag">Tag</option>
                    <option value="card">Credit Card</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                <button type="button" onClick={onCancel} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Save Offer</button>
            </div>
        </form>
    );
};

const OfferManagement: React.FC<OfferManagementProps> = ({ offers, onSaveOffer, onDeleteOffer }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAddNew = () => {
        setEditingOffer(null);
        setIsFormVisible(true);
    };

    const handleEdit = (offer: Offer) => {
        setEditingOffer(offer);
        setIsFormVisible(true);
    };

    const handleSave = (offer: Offer) => {
        onSaveOffer(offer);
        setIsFormVisible(false);
        setEditingOffer(null);
    };

    const handleDelete = (offerId: string) => {
        setItemToDelete(offerId);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteOffer(itemToDelete);
        }
        setItemToDelete(null);
    };

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Offer Management</h3>
                    {!isFormVisible && (
                        <button onClick={handleAddNew} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                            + Add New Offer
                        </button>
                    )}
                </div>

                {isFormVisible ? (
                    <OfferForm 
                        offer={editingOffer} 
                        onSave={handleSave} 
                        onCancel={() => { setIsFormVisible(false); setEditingOffer(null); }} 
                    />
                ) : (
                    <div className="overflow-x-auto">
                        {offers.length > 0 ? (
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs text-slate-400 uppercase bg-black/20">
                                    <tr>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map(offer => (
                                        <tr key={offer.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="px-4 py-3 font-medium text-white">{offer.title}</td>
                                            <td className="px-4 py-3 uppercase">{offer.type}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => handleEdit(offer)} className="font-medium text-red-500 hover:text-red-400">Edit</button>
                                                <button onClick={() => handleDelete(offer.id)} className="font-medium text-slate-400 hover:text-red-500">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-16 text-slate-500">
                                <p>No offers created yet.</p>
                                <p className="text-sm">Click "Add New Offer" to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Offer"
                message="Are you sure you want to delete this offer? This action cannot be undone."
                confirmText="Delete"
            />
        </>
    );
};

export default OfferManagement;