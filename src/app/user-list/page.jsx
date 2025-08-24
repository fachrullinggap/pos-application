"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { UserPlus, Edit, Trash2, AlertCircle } from 'lucide-react';

export default function UserListPage() {
    const { userRole, userToken, userId, loading: authLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ username: '', email: '', role: '' });

    useEffect(() => {
        if (userRole !== 'admin' || !userToken) {
            setIsLoading(false);
            return;
        }

        console.log(userId)

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/get-users`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                setUsers(result.data || []);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Could not load user data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [userRole, userToken]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (userId) => {
        // The confirmation dialog is a good practice
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                // 1. Correct URL now includes "/delete"
                // 2. Uses the environment variable for the base URL
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/delete/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                // 3. Improved error handling to show specific API messages
                if (!response.ok) {
                    const errorData = await response.json(); // Get error details from API
                    throw new Error(errorData.message || 'Failed to delete user.');
                }

                // If successful, update the UI by removing the user from the state
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                alert("User deleted successfully!"); // Optional: give success feedback
                
            } catch (err) {
                console.error("Deletion error:", err);
                // Show the specific error message from the API or a fallback
                alert(`Could not delete the user: ${err.message}`);
            }
        }
    };
    
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            // This new line excludes the logged-in user
            user.id !== userId &&
            
            // Your existing filters remain the same
            user.username.toLowerCase().includes(filters.username.toLowerCase()) &&
            user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
            user.role.toLowerCase().includes(filters.role.toLowerCase())
        );
    }, [users, filters, userId]);

    if (authLoading || isLoading) {
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

    if (error) {
        return (
             <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
                <NextNav />
                <main className="flex-1 p-8 flex flex-col overflow-hidden">
                    <Header title="User List" />
                    <div className="flex-1 flex items-center justify-center text-center">
                        <div className="flex flex-col items-center gap-4">
                            <AlertCircle size={48} className="text-red-400" />
                            <p className="text-xl text-red-400">{error}</p>
                        </div>
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role.toLowerCase() === 'admin' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
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