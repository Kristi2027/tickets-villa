import React, { useState, useMemo } from 'react';
import { GuestDetails, INDIAN_CITIES } from '../types';
import { CustomSelect } from './SearchAndFilter.tsx';

interface GuestInfoModalProps {
    onClose: () => void;
    onSubmit: (details: GuestDetails) => void;
}

const GuestInfoModal: React.FC<GuestInfoModalProps> = ({ onClose, onSubmit }) => {
    const [details, setDetails] = useState<GuestDetails>({
        name: '',
        email: '',
        phone: '',
        city: 'Mumbai',
        state: 'Maharashtra',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: keyof GuestDetails, value: string | null) => {
        setDetails(prev => ({ ...prev, [name]: value || '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(details);
    };
    
    const cityOptions = useMemo(() => INDIAN_CITIES.map(c => ({ value: c, label: c })), []);

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-2">Guest Details</h2>
                <p className="text-slate-400 mb-6">Please provide your details to continue with the booking.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name</label>
                            <input type="text" name="name" value={details.name} onChange={handleChange} required className={formInputStyles} />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Phone Number</label>
                            <input type="tel" name="phone" value={details.phone} onChange={handleChange} required className={formInputStyles} />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Email Address</label>
                        <input type="email" name="email" value={details.email} onChange={handleChange} required className={formInputStyles} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">City</label>
                            <CustomSelect options={cityOptions} value={details.city} onChange={(value) => handleSelectChange('city', value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">State</label>
                            <input type="text" name="state" value={details.state} onChange={handleChange} required className={formInputStyles} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Continue to Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GuestInfoModal;