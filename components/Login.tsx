import React, { useState } from 'react';
import { User, Role } from '../types.ts';
import { MOCK_USERS } from '../mockData.ts';

interface LoginProps {
    onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [selectedRole, setSelectedRole] = useState<Role>('admin');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const userToLogin = MOCK_USERS.find(user => user.role === selectedRole);
        if (userToLogin) {
            onLogin(userToLogin);
        } else {
            // Fallback to the first user if no specific role matches (e.g., if mock data changes)
            const fallbackUser = MOCK_USERS[0];
            if (fallbackUser) {
                onLogin(fallbackUser);
            } else {
                alert(`No mock user found for role: ${selectedRole}`);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900 border border-slate-800 rounded-2xl shadow-lg shadow-red-500/10">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Welcome to Tickets Villa
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        This is a demo. Please select a role to log in.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-medium text-slate-300 mb-2">
                            Select a user role to simulate login
                        </label>
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                            className="w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                        >
                            <option value="admin">Admin</option>
                            <option value="theatre_manager">Theatre Manager</option>
                            <option value="organizer">Organizer</option>
                            <option value="artist">Artist</option>
                            <option value="customer">Customer</option>
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;