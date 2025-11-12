import React, { useState } from 'react';
import { Artist } from '../types';
import Modal from './Modal';

interface ArtistFormModalProps {
    artistToEdit: Artist | null;
    onSave: (artist: Artist) => void;
    onClose: () => void;
}

const initialArtistState: Omit<Artist, 'id'> = {
    name: '',
    userEmail: '',
    genre: 'Singer',
    photo: 'https://images.unsplash.com/photo-1594995843021-750534062a6d?q=80&w=1974&auto=format&fit=crop&ixlib-rb-4.0.3&id=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: '',
    bookingFee: 100000,
    showreelUrl: '',
    gallery: [],
};

const ArtistFormModal: React.FC<ArtistFormModalProps> = ({ artistToEdit, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Artist, 'id'>>(() => {
        return artistToEdit ? { ...artistToEdit } : initialArtistState;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'bookingFee' ? Number(value) : value }));
    };

    const handleGalleryChange = (index: number, value: string) => {
        setFormData(prev => {
            const newGallery = [...(prev.gallery || [])];
            newGallery[index] = value;
            return { ...prev, gallery: newGallery };
        });
    };

    const addGalleryImage = () => {
        setFormData(prev => ({
            ...prev,
            gallery: [...(prev.gallery || []), '']
        }));
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            gallery: (prev.gallery || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: artistToEdit?.id || '' } as Artist);
    };
    
    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <Modal isOpen={true} onClose={onClose} maxWidth="max-w-3xl">
            <div className="max-h-[85vh] overflow-y-auto pr-2 -mr-4">
                <h2 className="text-2xl font-bold text-white mb-6">{artistToEdit ? 'Edit Artist Profile' : 'Create New Artist'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Artist Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyles} />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Genre</label>
                            <input type="text" name="genre" value={formData.genre} onChange={handleChange} required className={formInputStyles} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Associated User Email</label>
                            <input type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} required className={formInputStyles} placeholder="artist.login@email.com"/>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Base Booking Fee (₹)</label>
                            <input type="number" name="bookingFee" value={formData.bookingFee} onChange={handleChange} required min="0" className={formInputStyles} />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Profile Photo URL</label>
                        <input type="url" name="photo" value={formData.photo} onChange={handleChange} required className={formInputStyles} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className={formInputStyles}></textarea>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Media Content</h3>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Showreel URL (YouTube)</label>
                            <input type="url" name="showreelUrl" value={formData.showreelUrl || ''} onChange={handleChange} className={formInputStyles} placeholder="e.g., https://www.youtube.com/watch?v=..." />
                        </div>
                        <div className="mt-4">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Photo Gallery</label>
                            <div className="space-y-2 bg-black/20 p-3 rounded-lg border border-slate-700">
                                {(formData.gallery || []).map((url, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => handleGalleryChange(index, e.target.value)}
                                            placeholder="Image URL"
                                            className={`${formInputStyles} text-sm`}
                                        />
                                        <button type="button" onClick={() => removeGalleryImage(index)} className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors h-10 w-10 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                                 <button type="button" onClick={addGalleryImage} className="mt-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition-colors w-full">+ Add Image URL</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Save Artist</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ArtistFormModal;
