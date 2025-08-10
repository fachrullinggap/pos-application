"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

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

    // --- FIX ---
    // Call the login function with BOTH username and password,
    // and store its true/false result in a variable.
    const isLoginSuccessful = login(username, password);

    // --- FIX ---
    // Check the result from the context function to decide what to do.
    if (isLoginSuccessful) {
      console.log("Login successful, redirecting...");
      router.push("/catalog");
    } else {
      console.log("Login failed.");
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/images/POS.jpeg" alt="Background" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-sm space-y-8 bg-white/20 p-8 rounded-2xl shadow-xl border border-gray-700">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-600 rounded-full p-3">
            <span className="text-white text-2xl font-bold">PadiPos</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome Back!</h1>
          <p className="text-sm text-gray-200 text-center">Please enter your username and password!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200">Username</label>
            <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 p-2" placeholder="Enter 'admin' or 'cashier'"/>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 p-2" placeholder="Enter password"/>
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button type="submit" className="w-full flex justify-center py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all">Login</button>
        </form>
      </div>
    </div>
  );
}
