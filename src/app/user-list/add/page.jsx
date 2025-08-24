"use client";

import { useState } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';

export default function AddUserPage() {
    const { userToken, loading: authLoading } = useAuth(); // Corrected variable name for clarity
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Cashier');
    
    // States for handling submission status and errors
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null); // Clear previous errors on a new submission

        if (!userToken) {
            setError("Authentication token is missing. Please log in again.");
            setIsSubmitting(false);
            return;
        }

        // Construct the request body from state
        const userData = {
            username,
            email,
            password,
            userRole: role.toLowerCase(),
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                // If the server responds with an error, capture and throw it
                throw new Error(data.message || 'An unknown error occurred.');
            }

            // --- Success ---
            console.log("User created successfully:", data);
            alert("User created successfully!");
            router.push('/user-list');

        } catch (err) {
            // --- Error ---
            console.error("Failed to create user:", err);
            setError(err.message); // Set error state to display it in the UI
        } finally {
            // --- Finally ---
            // This runs whether the request succeeded or failed
            setIsSubmitting(false);
        }
    };

    // Corrected loading check to use the aliased 'authLoading'
    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
            <NextNav />
            <main className="flex-1 p-8 flex flex-col overflow-hidden">
                <Header title="Add New User" />
                
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
                                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input
                                    type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                <select
                                    id="role" value={role} onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        {/* Display API error message if one exists */}
                        {error && (
                            <div className="mt-4 mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-end gap-4 mt-8">
                             <button type="button" onClick={() => router.push('/user-list')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/80 rounded-lg text-sm font-semibold transition-colors"
                                disabled={isSubmitting} // Disable button during submission
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600/90 hover:bg-green-600 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting} // Disable button during submission
                            >
                                <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save User'}
                            </button>
                        </div>
                        
                    </form>
                </motion.div>
            </main>
        </div>
    );
}