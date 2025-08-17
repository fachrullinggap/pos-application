"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';

// Re-using the mock data to find the user to edit
const mockUsers = [
    { id: 1, username: 'admin_user', email: 'admin@padipos.com', role: 'Admin' },
    { id: 2, username: 'fachrul', email: 'fachrul@example.com', role: 'Cashier' },
    { id: 3, username: 'budi_s', email: 'budi.santoso@mail.com', role: 'Cashier' },
    { id: 4, username: 'citra_l', email: 'citra.l@mail.com', role: 'Cashier' },
    { id: 5, username: 'dewi_a', email: 'dewi.anggraini@mail.com', role: 'Admin' },
];

function EditUserForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Cashier');
    
    useEffect(() => {
        if (userId) {
            // In a real app, you would fetch this data from an API
            const userToEdit = mockUsers.find(u => u.id === parseInt(userId));
            if (userToEdit) {
                setUsername(userToEdit.username);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
            }
        }
    }, [userId]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your logic to update the user via API
        console.log("Updating user:", { userId, username, email, password: password ? '********' : 'unchanged', role });
        alert("User updated successfully!");
        router.push('/user-list');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-lg max-w-2xl mx-auto w-full mt-4"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                        <input
                            type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                        <input
                            type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                        <select
                            id="role" value={role} onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="Cashier">Cashier</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                     <button type="button" onClick={() => router.push('/user-list')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/80 rounded-lg text-sm font-semibold transition-colors">
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/90 hover:bg-green-600 rounded-lg text-sm font-semibold transition-colors">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

export default function EditUserPage() {
    const { userRole, loading } = useAuth();
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    // You can add more robust role checks here if needed
    if (userRole !== 'admin') {
         return (
            <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
                <NextNav />
                <main className="flex-1 p-8 flex flex-col overflow-hidden">
                    <Header title="Edit User" />
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xl text-red-400">Access Denied.</p>
                    </div>
                </main>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
            <NextNav />
            <main className="flex-1 p-8 flex flex-col overflow-hidden">
                <Header title="Edit User" />
                <Suspense fallback={<div>Loading form...</div>}>
                    <EditUserForm />
                </Suspense>
            </main>
        </div>
    );
}