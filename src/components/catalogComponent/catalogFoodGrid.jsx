"use client";

import { useCatalog } from "@/context/catalogContext";
import { Edit, Trash2 } from "lucide-react"; // Import the Trash2 icon

// The component now accepts an onDeleteClick handler
export default function CatalogFoodGrid({ userRole, onEditClick, onDeleteClick }) {
  const { filteredItems, handleAddToCart } = useCatalog();

  return (
    <div className="flex-1 overflow-y-auto pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 border border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col group"
          >
            <div className="relative">
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
              {/* Show admin controls only for the admin user */}
              {userRole === 'admin' && (
                <>
                  {/* Delete Button (Top Left) */}
                  <button
                    onClick={() => onDeleteClick(item.id)}
                    className="absolute top-2 right-11 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                  {/* Edit Button (Top Right) */}
                  <button
                    onClick={() => onEditClick(item)}
                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                    aria-label="Edit item"
                  >
                    <Edit size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold truncate">{item.name}</h3>
              <p className="text-sm text-gray-400 mb-3">Rp {item.price}</p>
              
              {/* --- HIDE "ADD TO CART" FOR ADMIN --- */}
              {/* This button will only be rendered if the user is NOT an admin */}
              {userRole !== 'admin' && (
                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {filteredItems.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No items found.</p>
      )}
    </div>
  );
}
