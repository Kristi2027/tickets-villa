import React, { useState, useMemo } from 'react';
import { User, Theatre } from '../types';
import { CustomSelect } from './SearchAndFilter.tsx';

interface UserFormModalProps {
    userToEdit: User | null;
    theatres: Theatre[];
    onSave: (user: User) => void;
    onClose: () => void;
}

const FOOTER_PERMISSIONS = [
    { id: 'create_event', label: 'Create Event' },
    { id: 'manage_events', label: 'Manage Events (Admin)' },
    { id: 'manage_theatres', label: 'Manage Theatres' },
    { id: 'box_office', label: 'Box Office' },
    { id: 'manage_payouts', label: 'Manage Payouts' },
];

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

const UserFormModal: React.FC<UserFormModalProps> = ({ userToEdit, theatres, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        email: userToEdit?.email || '',
        password: '',
        role: userToEdit?.role || 'theatre_manager',
        theatreId: userToEdit?.theatreId || '',
        permissions: userToEdit?.permissions || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name: keyof Omit<User, 'id'>, value: string | null) => {
        setFormData(prev => ({ ...prev, [name]: value || '' }));
    };
    
    const handlePermissionChange = (permissionId: string, isChecked: boolean) => {
        const currentPermissions = formData.permissions || [];
        const newPermissions = isChecked
            ? [...currentPermissions, permissionId]
            : currentPermissions.filter(p => p !== permissionId);
        setFormData(prev => ({ ...prev, permissions: newPermissions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userToEdit && !formData.password) || (userToEdit && formData.password && formData.password.length < 6)) {
             if (userToEdit && !formData.password) {
                // This is fine, we are not changing the password
             } else {
                alert("Password must be at least 6 characters long.");
                return;
             }
        }

        const finalUserData: User = {
            id: userToEdit?.id || '', // ID will be generated in App.tsx for new users
            email: formData.email,
            role: formData.role,
            permissions: formData.permissions,
            password: formData.password ? await hashPassword(formData.password) : undefined,
            theatreId: formData.role === 'theatre_manager' ? formData.theatreId : undefined,
        };
        onSave(finalUserData);
    };
    
    const roleOptions = [
        { value: 'theatre_manager', label: 'Theatre Manager' },
        { value: 'admin', label: 'Admin' },
        { value: 'organizer', label: 'Organizer' },
    ];
    
    const theatreOptions = useMemo(() => [
        { value: '', label: 'Select a theatre...' },
        ...theatres.map(t => ({ value: t.id, label: t.name }))
    ], [theatres]);

    const formInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-6">{userToEdit ? 'Edit User' : 'Create New User'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Password</label>
                            <input type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={userToEdit ? 'Leave blank to keep unchanged' : ''} required={!userToEdit} className={formInputStyles} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Role</label>
                            <CustomSelect options={roleOptions} value={formData.role} onChange={(value) => handleSelectChange('role', value)} />
                        </div>
                        {formData.role === 'theatre_manager' && (
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Assigned Theatre</label>
                                <CustomSelect options={theatreOptions} value={formData.theatreId} onChange={(value) => handleSelectChange('theatreId', value)} />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Footer Menu Permissions</label>
                        <div className="bg-black/20 p-3 rounded-lg border border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-3">
                             {FOOTER_PERMISSIONS.map(permission => (
                                <label key={permission.id} className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        checked={formData.permissions?.includes(permission.id)}
                                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                        className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-sm text-slate-300">{permission.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;