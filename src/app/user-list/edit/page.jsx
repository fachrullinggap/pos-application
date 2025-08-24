"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from 'framer-motion';
import { Save, X, AlertCircle } from 'lucide-react';

// This component now handles all the logic for fetching, displaying, and updating the form.
function EditUserForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');
    const { userToken } = useAuth();

    // Form field states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('cashier');

    // States for loading, submitting, and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // 1. Fetch user data from API when the component mounts or userId changes
    useEffect(() => {
        if (!userId || !userToken) {
            setIsLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                // Assumes you have an endpoint like GET /api/user/:id
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/get-user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data.');
                }

                const result = await response.json();
                if (result.data) {
                    setUsername(result.data.username);
                    setEmail(result.data.email);
                    setRole(result.data.role);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId, userToken]);
    
    // 2. Handle form submission to the API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Construct the update payload.
        // Only include fields that are being changed.
        const updateData = {
            username,
            email,
            userRole: role.toLowerCase(),
        };

        // Only include the password if the user has entered a new one
        if (password) {
            updateData.password = password;
        }

        try {
            // Assumes you have an endpoint like PATCH /api/user/update/:id
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update/${userId}`, {
                method: 'PATCH', // PATCH is often better for updates than PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user.');
            }

            alert("User updated successfully!");
            router.push('/user-list');
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading user data...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-lg max-w-2xl mx-auto w-full mt-4"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Input fields... */}
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
                            <option value="cashier">Cashier</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                {error && (
                    <div className="mt-4 mb-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-center">
                        {error}
                    </div>
                )}
                <div className="flex justify-end items-center gap-4 mt-8">
                   <button type="button" onClick={() => router.push('/user-list')}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/80 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                        <X size={16} /> Cancel
                    </button>
                    <button type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/90 hover:bg-green-600 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}


// This is the main page component that wraps the form
export default function EditUserPage() {
    const { userRole, loading: authLoading } = useAuth();
    
    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

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
                <Suspense fallback={<div className="text-center p-10">Loading form...</div>}>
                    <EditUserForm />
                </Suspense>
            </main>
        </div>
    );
}