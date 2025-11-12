import React, { useState } from 'react';
import { GlobalSettings } from '../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGooglePaySelect: () => void;
    onUpiSelect: () => void;
    totalAmount: number;
    settings: GlobalSettings;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onGooglePaySelect, onUpiSelect, totalAmount, settings }) => {
    const [showUpiDetails, setShowUpiDetails] = useState(false);
    const [upiIdCopied, setUpiIdCopied] = useState(false);
    const upiId = settings.paymentGatewaySettings.upiId || 'eventsphere@okhdfcbank';

    if (!isOpen) return null;

    const handleCopyUpiId = () => {
        navigator.clipboard.writeText(upiId).then(() => {
            setUpiIdCopied(true);
            setTimeout(() => setUpiIdCopied(false), 2000);
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Choose Payment Method</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-slate-700 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-lg text-slate-300">Total Amount:</span>
                        <span className="text-2xl font-bold text-red-500">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {!showUpiDetails ? (
                    <div className="space-y-4">
                        <button onClick={onGooglePaySelect} className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-lg transition-opacity hover:opacity-90">
                            <img src="https://www.gstatic.com/images/icons/material/system/2x/google_pay_mark_64dp.png" alt="Google Pay" className="h-6" />
                            Pay with Google Pay
                        </button>
                        <button onClick={() => setShowUpiDetails(true)} className="w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-slate-600">
                            Pay with UPI / QR Code
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col items-center bg-white p-4 rounded-lg">
                            <svg width="150" height="150" viewBox="0 0 256 256"><path fill="#000000" d="M216 48H40a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8ZM48 56h72v72H48Zm72 144H48v-64h72Zm16-72h64v64h-64Zm-16-16V56h88v88h-88Z"/><path fill="#000000" d="M104 104h-4v-4a8 8 0 0 0-16 0v4h-4a8 8 0 0 0 0 16h4v4a8 8 0 0 0 16 0v-4h4a8 8 0 0 0 0-16Zm-12 12a4 4 0 0 1-8 0v-4h4v-4a4 4 0 0 1 8 0v12Z"/><path fill="#000000" d="M68 64a4 4 0 0 1 4-4h24a4 4 0 0 1 0 8H72a4 4 0 0 1-4-4Zm0 24a4 4 0 0 1 4-4h16a4 4 0 0 1 0 8H72a4 4 0 0 1-4-4Zm136-20a4 4 0 0 1-4 4h-24a4 4 0 0 1 0-8h24a4 4 0 0 1 4 4Zm0 24a4 4 0 0 1-4 4h-16a4 4 0 0 1 0-8h16a4 4 0 0 1 4 4Zm-24 104a4 4 0 0 1 4-4h24a4 4 0 0 1 0 8h-24a4 4 0 0 1-4-4Zm-40-24a4 4 0 0 1 4-4h24a4 4 0 0 1 0 8h-24a4 4 0 0 1-4-4Z"/></svg>
                            <p className="text-black font-semibold mt-2">Scan to Pay</p>
                        </div>
                         <div className="mt-4">
                            <label className="text-xs text-slate-400">Or pay using UPI ID</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input type="text" readOnly value={upiId} className="w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 font-mono" />
                                <button onClick={handleCopyUpiId} className="bg-red-600 text-white font-semibold text-sm px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    {upiIdCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                         </div>
                        <button onClick={onUpiSelect} className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-green-700">
                            I have completed the payment
                        </button>
                        <button onClick={() => setShowUpiDetails(false)} className="w-full mt-2 text-slate-400 text-sm hover:text-white">Back to options</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;