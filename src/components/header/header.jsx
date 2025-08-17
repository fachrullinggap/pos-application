"use client";

import { motion } from 'framer-motion';
import { useAuth } from "@/context/authContext";
import { format } from 'date-fns';

// The component now accepts a 'title' prop to be reusable
export default function Header({ title }) {
  const { userRole, loading } = useAuth();

  const user = {
    name: 'Fachrul',
    imageUrl: `https://ui-avatars.com/api/?name=Fachrul&background=3b82f6&color=fff`
  };

  // Optional: Loading skeleton
  if (loading) {
    return (
      <header className="flex justify-between items-center mb-8">
        <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="text-right">
            <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="w-11 h-11 bg-gray-700 rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex justify-between items-center mb-8"
    >
      {/* Renders the title passed via props */}
      <h1 className="text-3xl font-bold tracking-tight">
        {title || "PadiPos"}
      </h1>

      {/* Right side with date and profile */}
      <div className="flex items-center gap-6">
          <p className="text-gray-400 hidden sm:block">Today, {format(new Date(), 'dd/MM/yyyy')}</p>
          <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="text-right">
              <p className="font-semibold text-white capitalize">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{userRole}</p>
            </div>
            <img
              src={user.imageUrl}
              alt="Profile Picture"
              className="w-11 h-11 rounded-full border-2 border-white/20"
            />
          </motion.div>
      </div>
    </motion.header>
  );
}