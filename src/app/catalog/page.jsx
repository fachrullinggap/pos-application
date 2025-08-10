"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useCatalog } from "@/context/catalogContext"; // Import catalog context
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import CatalogFilter from "@/components/catalogComponent/catalogFilter";
import CatalogFoodGrid from "@/components/catalogComponent/catalogFoodGrid";
import ListOrder from "@/components/listOrder";
import AddMenu from "@/components/addMenu";
import EditMenu from "@/components/editMenu";

export default function CatalogPage() {
  const { userRole, loading, logout } = useAuth();
  const { handleDeleteMenuItem } = useCatalog(); // Get the delete function from the catalog context
  const router = useRouter();
  const [editingItem, setEditingItem] = useState(null);

  const handleEditClick = (item) => {
    setEditingItem(item);
  };

  const handleFinishEditing = () => {
    setEditingItem(null);
  };

  // --- NEW DELETE HANDLER ---
  const handleDeleteClick = (itemId) => {
    // A confirmation dialog is a good practice for destructive actions.
    if (window.confirm("Are you sure you want to permanently delete this item?")) {
      handleDeleteMenuItem(itemId);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const AdminView = () => {
    if (editingItem) {
      return <EditMenu itemToEdit={editingItem} onFinished={handleFinishEditing} />;
    }
    return <AddMenu />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
      <div className="h-screen max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-8">
        
        {/* --- FIX: Add overflow-hidden to the left panel --- */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Food Catalog</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-red-600/90 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors">
              <LogOut size={16} />
              Logout
            </button>
          </div>
          <CatalogFilter />
          <div className="flex-1 overflow-y-auto">
            <CatalogFoodGrid
              userRole={userRole}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          </div>
        </div>

        {/* --- FIX: Add overflow-hidden to the right panel's container --- */}
        <div className="w-full lg:w-[380px] h-full flex-shrink-0 overflow-auto">
          <div className="flex-1">
            {userRole === 'admin' ? <AdminView /> : <ListOrder />}
          </div>
        </div>

      </div>
    </div>
  );
}
