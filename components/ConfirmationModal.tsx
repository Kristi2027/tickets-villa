import React from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-600/10">
                     <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg leading-6 font-bold text-white mt-4" id="modal-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-slate-400">
                        {message}
                    </p>
                </div>
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full justify-center rounded-lg px-4 py-2 bg-slate-700 text-base font-bold text-white hover:bg-slate-600 sm:text-sm transition-colors"
                >
                    {cancelText}
                </button>
                 <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full justify-center rounded-lg px-4 py-2 bg-red-600 text-base font-bold text-white hover:bg-red-700 sm:text-sm transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;