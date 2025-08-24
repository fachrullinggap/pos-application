"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Upload, Trash2, Save, AlertCircle, CircleGauge } from 'lucide-react';

export default function SettingsPage() {
    // ADDED: userToken is needed for API calls
    const { userToken, userName, userEmail, userPicture, loading: authLoading, updateUserData  } = useAuth();
    const router = useRouter();

    // Form field states
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    // State for the image preview URL
    const [profilePicture, setProfilePicture] = useState(null);
    // State for the actual image file to be uploaded (for when you add multer)
    const [selectedFile, setSelectedFile] = useState(null);

    // ADDED: States for submission status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    // ADDED: Initialize form state from auth context once it loads
    useEffect(() => {
        if (userName) {
            setUsername(userName);
        }
        if (userEmail) {
            setEmail(userEmail);
        }
        if (userPicture) {
            setProfilePicture(userPicture);
        } else if (userName) {
            // Fallback to ui-avatars if no picture is saved
            setProfilePicture(`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=128`);
        }
    }, [userName, userEmail, userPicture]);

    // This effect handles cleanup for the temporary image URL
    useEffect(() => {
        return () => {
            if (profilePicture && profilePicture.startsWith('blob:')) {
                URL.revokeObjectURL(profilePicture);
            }
        };
    }, [profilePicture]);

    // REPLACED: The handleSaveChanges function is now fully implemented
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // 1. Use FormData when a file might be included.
        const formData = new FormData();

        // 2. Append all data that has changed to the FormData object.
        if (username !== userName) formData.append('username', username);
        if (email !== userEmail) formData.append('email', email);
        if (password) formData.append('password', password);
        
        // The key 'profilePicture' must match what your backend expects (e.g., multer's upload.single('profilePicture'))
        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }

        // A different way to check if there are changes.
        if (Array.from(formData.keys()).length === 0) {
            alert("Tidak ada data yang berubah.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/edit/profile`, {
                method: 'PATCH',
                headers: {
                    // 3. (IMPORTANT) Do NOT set the 'Content-Type' header yourself.
                    // The browser will automatically set it to 'multipart/form-data' 
                    // with the correct boundary when the body is a FormData object.
                    'Authorization': `Bearer ${userToken}`,
                },
                // 4. The body is the FormData object itself, not a string.
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal merubah profile.");
            }

            alert("Sukses merubah profile!");

            // Update context and localStorage
            // Note: You may also need to get the new profilePictureUrl from the response to update the context.
            updateUserData({ username: username, email: email , userPicture: result.userPictureUrl} );

            window.location.reload();
            
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePictureSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file); // Store the file for later upload
            const newImageUrl = URL.createObjectURL(file);
            setProfilePicture(newImageUrl);
        }
    };

    const handleDeletePicture = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/remove/profile-pic`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            // First, get the JSON data from the response. We only need to do this once.
            const result = await response.json();

            // THEN, check if the request was successful.
            if (!response.ok) {
                // If not okay, the 'result' variable already contains the error message from the server.
                throw new Error(result.message || "Gagal menghapus foto profile.");
            }

            // If we reach here, the request was successful.
            setSelectedFile(null); // Clear any selected file
            
            // Consider using a more modern notification (toast/snackbar) instead of alert.
            alert("Foto profile berhasil dihapus!");

            // Update context and localStorage with the new data from the result.
            updateUserData({ userPicture: result.userPictureUrl });

            window.location.reload();
            
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            // Stop the loading indicator regardless of success or failure.
            // setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    if (!userToken) {
        // Redirect if not logged in
        router.push('/');
        return null; // Return null to prevent rendering the rest of the component
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
                            {/* ... buttons for changing/deleting picture ... */}
                             <div className="flex flex-col gap-3">
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
                                    // CHANGED: value is now linked to component state
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
                                    // CHANGED: value is now linked to component state
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
                        <div className="flex justify-end items-center gap-4">
                            {/* ADDED: Error display */}
                            {error && (
                                <div className="text-sm text-red-400 mr-auto flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600/90 hover:bg-green-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {/* ADDED: Dynamic button text */}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}