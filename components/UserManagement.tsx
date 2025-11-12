import React, { useState } from 'react';
import { User, Theatre } from '../types';
import UserFormModal from './UserFormModal';
import ConfirmationModal from './ConfirmationModal';

interface UserManagementProps {
    users: User[];
    theatres: Theatre[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, theatres, onSaveUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSave = (user: User) => {
        onSaveUser(user);
        setIsModalOpen(false);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteUser(itemToDelete);
        }
        setItemToDelete(null);
    };
    
    const userToDelete = users.find(u => u.id === itemToDelete);
    
    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">User Management</h3>
                    <button onClick={handleAddNew} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                        + Add New User
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Permissions</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{user.email}</td>
                                    <td className="px-4 py-3 uppercase text-xs font-bold">{user.role.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-xs">{(user.permissions || []).length} assigned</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => handleEdit(user)} className="font-medium text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-md transition text-xs">Edit</button>
                                        <button onClick={() => setItemToDelete(user.id)} className="font-medium text-slate-400 hover:text-red-500 bg-slate-500/10 hover:bg-red-500/20 px-3 py-1 rounded-md transition text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <UserFormModal 
                    userToEdit={editingUser}
                    theatres={theatres}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete the user "${userToDelete?.email}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </>
    );
};

export default UserManagement;