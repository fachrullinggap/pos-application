"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Upload, Trash2, Save } from 'lucide-react';

export default function SettingsPage() {
    const { userRole, loading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("fachrul@example.com");
    const [username, setUsername] = useState("Fachrul");
    const [password, setPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState(`https://ui-avatars.com/api/?name=Fachrul&background=3b82f6&color=fff&size=128`);

    // --- CHANGE 1: Create a ref for the hidden file input element ---
    const fileInputRef = useRef(null);

    // This effect handles cleanup for the temporary image URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (profilePicture && profilePicture.startsWith('blob:')) {
                URL.revokeObjectURL(profilePicture);
            }
        };
    }, [profilePicture]);

    const handleSaveChanges = (e) => {
        e.preventDefault();
        // In a real app, you would upload the new image file if it exists,
        // then save the other changes.
        console.log("Saving changes:", { email, username, password: password ? "********" : "unchanged" });
        alert("Changes saved successfully!");
    };

    // --- CHANGE 2: This function is triggered when a new file is selected ---
    const handlePictureSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create a temporary URL for the selected image file to show a preview
            const newImageUrl = URL.createObjectURL(file);
            setProfilePicture(newImageUrl);
        }
    };

    const handleDeletePicture = () => {
        setProfilePicture(`https://ui-avatars.com/api/?name=${username || 'User'}&background=3b82f6&color=fff&size=128`);
        alert("Picture deleted and reset to default.");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    if (!userRole) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <p className="text-xl">Access Denied</p>
                <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 rounded-md">Go to Login</button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
            <NextNav />

            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                <Header title="Settings" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-lg max-w-4xl mx-auto w-full"
                >
                    <h2 className="text-2xl font-bold mb-6">Account</h2>

                    <form onSubmit={handleSaveChanges}>
                        <div className="flex items-center gap-8 mb-8">
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                            />
                            <div className="flex flex-col gap-3">
                                {/* --- CHANGE 3: The button now clicks the hidden file input --- */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors"
                                >
                                    <Upload size={16} />
                                    Change Picture
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeletePicture}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-sm font-semibold transition-colors text-red-300"
                                >
                                    <Trash2 size={16} />
                                    Delete Picture
                                </button>
                            </div>
                        </div>

                        {/* --- CHANGE 4: Add the hidden file input --- */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePictureSelect}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current password"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-green-600/90 hover:bg-green-600 rounded-lg font-semibold transition-colors"
                            >
                                <Save size={18} />
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}