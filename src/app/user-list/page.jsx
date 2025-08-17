"use client";

import { useState, useMemo } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

// --- MOCK DATA (Replace with your actual data fetching) ---
const mockUsers = [
    { id: 1, username: 'admin_user', email: 'admin@padipos.com', role: 'Admin' },
    { id: 2, username: 'fachrul', email: 'fachrul@example.com', role: 'Cashier' },
    { id: 3, username: 'budi_s', email: 'budi.santoso@mail.com', role: 'Cashier' },
    { id: 4, username: 'citra_l', email: 'citra.l@mail.com', role: 'Cashier' },
    { id: 5, username: 'dewi_a', email: 'dewi.anggraini@mail.com', role: 'Admin' },
];

export default function UserListPage() {
    const { userRole, loading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState(mockUsers);
    const [filters, setFilters] = useState({ username: '', email: '', role: '' });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            // Add your API call for deletion here
        }
    };
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.username.toLowerCase().includes(filters.username.toLowerCase()) &&
            user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
            user.role.toLowerCase().includes(filters.role.toLowerCase())
        );
    }, [users, filters]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    if (userRole !== 'admin') {
        return (
            <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
                <NextNav />
                <main className="flex-1 p-8 flex flex-col overflow-hidden">
                    <Header title="User List" />
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xl text-red-400">You do not have permission to view this page.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
            <NextNav />
            <main className="flex-1 p-8 flex flex-col overflow-hidden">
                <Header title="User List" />
                
                <motion.div 
                    className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg flex-1 flex flex-col overflow-hidden mt-4"
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => router.push('/user-list/add')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors"
                        >
                            <UserPlus size={16} />
                            Add User
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-3">Username</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                                <tr>
                                    <th className="px-6 py-2"><input type="text" name="username" onChange={handleFilterChange} placeholder="Search username..." className="w-full bg-gray-700 rounded-md px-2 py-1 text-white text-sm font-normal"/></th>
                                    <th className="px-6 py-2"><input type="text" name="email" onChange={handleFilterChange} placeholder="Search email..." className="w-full bg-gray-700 rounded-md px-2 py-1 text-white text-sm font-normal"/></th>
                                    <th className="px-6 py-2"><input type="text" name="role" onChange={handleFilterChange} placeholder="Search role..." className="w-full bg-gray-700 rounded-md px-2 py-1 text-white text-sm font-normal"/></th>
                                    <th className="px-6 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="px-6 py-4 font-medium">{user.username}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => router.push(`/user-list/edit?id=${user.id}`)} className="p-2 text-blue-400 hover:text-blue-300"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}