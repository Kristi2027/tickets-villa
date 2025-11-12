import React, { useState, useMemo } from 'react';
import { Venue, INDIAN_CITIES, AVAILABLE_AMENITIES } from '../types.ts';
import { CustomSelect } from './SearchAndFilter.tsx';

interface VenueFormModalProps {
    venueToEdit: Venue | null;
    onSave: (venue: Venue) => void;
    onClose: () => void;
}

// FIX: Remove 'bookedDates' from Omit as it's not a property of Venue.
const initialVenueState: Omit<Venue, 'id'> = {
    name: '',
    address: '',
    city: 'Mumbai',
    capacity: 100,
    amenities: [],
    bannerImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070&auto=format&fit=crop&ixlib-rb-4.0.3&id=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: '',
    pricing: { perHour: 0, fullDay: 0 },
    refundPolicy: '50% refund if cancelled 30 days prior. No refund within 15 days of the event.',
};

const VenueFormModal: React.FC<VenueFormModalProps> = ({ venueToEdit, onSave, onClose }) => {
    // FIX: Remove 'bookedDates' from Omit as it's not a property of Venue.
    const [formData, setFormData] = useState<Omit<Venue, 'id'>>(() => {
        return venueToEdit ? { ...venueToEdit } : initialVenueState;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                [name]: Number(value)
            }
        }));
    };

    const handleSelectChange = (name: string, value: string | null) => {
        setFormData(prev => ({ ...prev, [name]: value || '' }));
    };

    const handleAmenityChange = (amenity: string) => {
        setFormData(prev => {
            const newAmenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities: newAmenities };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            id: venueToEdit?.id || '',
            amenities: formData.amenities,
            capacity: Number(formData.capacity)
        };
        onSave(finalData as Venue);
    };

    const cityOptions = useMemo(() => INDIAN_CITIES.map(c => ({ value: c, label: c })), []);

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-6">{venueToEdit ? 'Edit Venue' : 'Create New Venue'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Venue Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} required className={formInputStyles} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">City</label>
                            <CustomSelect options={cityOptions} value={formData.city} onChange={(value) => handleSelectChange('city', value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Capacity</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" className={formInputStyles} />
                        </div>
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
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Select Amenities</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-black/20 p-3 rounded-lg border border-slate-700">
                            {AVAILABLE_AMENITIES.map(amenity => (
                                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => handleAmenityChange(amenity)}
                                        className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-sm text-slate-300">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Price Per Hour (₹)</label>
                            <input type="number" name="perHour" value={formData.pricing.perHour} onChange={handlePricingChange} required min="0" className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Price for Full Day (₹)</label>
                            <input type="number" name="fullDay" value={formData.pricing.fullDay} onChange={handlePricingChange} required min="0" className={formInputStyles} />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Refund Policy</label>
                        <textarea name="refundPolicy" value={formData.refundPolicy} onChange={handleChange} required rows={2} className={formInputStyles}></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Save Venue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VenueFormModal;