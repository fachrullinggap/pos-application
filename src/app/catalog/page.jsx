"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useCatalog } from "@/context/catalogContext";
import { useRouter } from "next/navigation";
import Header from '@/components/header/header';
import CatalogFilter from "@/components/catalogComponent/catalogFilter";
import CatalogFoodGrid from "@/components/catalogComponent/catalogFoodGrid";
import ListOrder from "@/components/listOrder";
import AddMenu from "@/components/addMenu";
import EditMenu from "@/components/editMenu";
import NextNav from '@/components/navigation/nextNav';
import { motion } from 'framer-motion'; // --- ANIMATION: Import motion ---

export default function CatalogPage() {
  const { userRole, loading } = useAuth();
  const { handleDeleteMenuItem } = useCatalog();
  const router = useRouter();
  const [editingItem, setEditingItem] = useState(null);

  const handleEditClick = (item) => {
    setEditingItem(item);
  };

  const handleFinishEditing = () => {
    setEditingItem(null);
  };

  const handleDeleteClick = async (itemId) => {
    if (window.confirm("Are you sure you want to permanently delete this item?")) {
      // handleDeleteMenuItem(itemId);
      const result = await handleDeleteMenuItem(itemId);

      if (!result.success) {
        alert(`Error: ${result.error}`);
      } else {
        alert(result.message); 
      }
    }
  };

  const AdminView = () => {
    if (editingItem) {
      return <EditMenu itemToEdit={editingItem} onFinished={handleFinishEditing} />;
    }
    return <AddMenu />;
  };

  // --- ANIMATION: Variants for staggering child elements ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each child animating in
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
      
      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        <Header title="Food Catalog" />

        {/* --- ANIMATION: Main container for the two panels --- */}
        <motion.div
          className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden mt-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* --- ANIMATION: Left panel container --- */}
          <motion.div
            variants={itemVariants}
            className="flex-1 flex flex-col space-y-4 overflow-hidden"
          >
            <CatalogFilter />
            <div className="flex-1 overflow-y-auto pr-2">
              <CatalogFoodGrid
                userRole={userRole}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>
          </motion.div>

          {/* --- ANIMATION: Right panel container --- */}
          <motion.div
            variants={itemVariants}
            className="w-full lg:w-[380px] h-full flex-shrink-0"
          >
             <div className="flex-1 h-full overflow-y-auto">
                {userRole === 'admin' ? <AdminView /> : <ListOrder />}
             </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}