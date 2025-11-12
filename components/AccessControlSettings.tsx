import React, { useState } from 'react';
import { GlobalSettings, PaymentGatewaySettings } from '../types.ts';

interface AccessControlSettingsProps {
    categoryVisibility: { events: boolean; movies: boolean; venues: boolean; mobileTheatres: boolean; artists: boolean; };
    onToggleCategoryVisibility: (category: 'events' | 'movies' | 'venues' | 'mobileTheatres' | 'artists') => void;
    globalSettings: GlobalSettings;
    onSaveSettings: (settings: GlobalSettings) => void;
}

const ToggleSwitch: React.FC<{
    label: string;
    enabled: boolean;
    onChange: () => void;
}> = ({ label, enabled, onChange }) => (
    <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
        <span className="font-medium text-slate-300">{label}</span>
        <div className="relative">
            <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={onChange} />
            <div className="block bg-slate-700/50 border border-slate-700 w-12 h-6 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${enabled ? 'transform translate-x-6 bg-green-500' : 'bg-red-600'}`}></div>
        </div>
    </label>
);

const AccessControlSettings: React.FC<AccessControlSettingsProps> = ({
    categoryVisibility,
    onToggleCategoryVisibility,
    globalSettings,
    onSaveSettings
}) => {
    const [settings, setSettings] = useState<GlobalSettings>(globalSettings);

    const handleFinancialSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handlePaymentSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            paymentGatewaySettings: {
                ...prev.paymentGatewaySettings,
                [name]: value,
            }
        }));
    };

    const handleSave = () => {
        onSaveSettings(settings);
    };

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <div className="space-y-8">
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Global Settings</h3>
                
                <div className="border-b border-slate-800 pb-6 mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Category Visibility</h4>
                    <p className="text-sm text-slate-400 mb-4">Toggle the visibility of main categories across the platform.</p>
                    <div className="space-y-4 max-w-sm">
                        <ToggleSwitch label="Events" enabled={categoryVisibility.events} onChange={() => onToggleCategoryVisibility('events')} />
                        <ToggleSwitch label="Movies" enabled={categoryVisibility.movies} onChange={() => onToggleCategoryVisibility('movies')} />
                        <ToggleSwitch label="Venues" enabled={categoryVisibility.venues} onChange={() => onToggleCategoryVisibility('venues')} />
                        <ToggleSwitch label="Mobile Theatres" enabled={categoryVisibility.mobileTheatres} onChange={() => onToggleCategoryVisibility('mobileTheatres')} />
                        <ToggleSwitch label="Artists" enabled={categoryVisibility.artists} onChange={() => onToggleCategoryVisibility('artists')} />
                    </div>
                </div>

                <div className="border-b border-slate-800 pb-6 mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Financial Settings</h4>
                    <p className="text-sm text-slate-400 mb-4">Set the rates for platform fees and taxes. These will affect all future transactions.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Platform Fee Rate (%)</label>
                            <input type="number" name="platformFeeRate" value={settings.platformFeeRate} onChange={handleFinancialSettingChange} min="0" step="0.1" className={formInputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">GST Rate (%)</label>
                            <input type="number" name="gstRate" value={settings.gstRate} onChange={handleFinancialSettingChange} min="0" step="0.1" className={formInputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Service Charge Rate (%)</label>
                            <input type="number" name="serviceChargeRate" value={settings.serviceChargeRate} onChange={handleFinancialSettingChange} min="0" step="0.1" className={formInputStyles} />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Payment Gateway Settings</h4>
                    <p className="text-sm text-slate-400 mb-4">Configure your payment provider details.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Default UPI ID</label>
                            <input type="text" name="upiId" value={settings.paymentGatewaySettings.upiId} onChange={handlePaymentSettingChange} className={formInputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Razorpay Key ID</label>
                            <input type="text" name="razorpayKeyId" value={settings.paymentGatewaySettings.razorpayKeyId} onChange={handlePaymentSettingChange} placeholder="rzp_test_..." className={formInputStyles} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Stripe Public Key</label>
                            <input type="text" name="stripePublicKey" value={settings.paymentGatewaySettings.stripePublicKey} onChange={handlePaymentSettingChange} placeholder="pk_test_..." className={formInputStyles} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-right">
                    <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessControlSettings;