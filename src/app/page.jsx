"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { motion } from "framer-motion"; // --- ANIMATION: Import motion ---

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const isLoginSuccessful = login(username, password);
    if (isLoginSuccessful) {
      router.push("/catalog");
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  // --- ANIMATION: Variants for staggering child elements ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        // --- ANIMATION: Subtle zoom effect on background ---
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <img src="/images/POS.jpeg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* Login Box */}
      <motion.div
        className="relative z-10 w-full max-w-sm space-y-8 bg-white/10 p-8 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md"
        // --- ANIMATION: Main container entrance animation ---
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg">
            <span className="text-white text-2xl font-bold">PadiPos</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome Back!</h1>
          <p className="text-sm text-gray-200 text-center">Please enter your username and password!</p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200">Username</label>
            <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 p-2" placeholder="Enter 'admin' or 'cashier'"/>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 p-2" placeholder="Enter password"/>
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <motion.button
            // --- ANIMATION: Interactive button effects ---
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex justify-center py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all"
          >
            Login
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}