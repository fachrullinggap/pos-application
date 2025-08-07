"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ListOrder from "@/components/listOrder";

const dummyFoodItems = [
  { id: 1, name: "Cheeseburger", price: "35.000", image: "/images/burger.jpg", category: "Foods" },
  { id: 2, name: "French Fries", price: "20.000", image: "/images/fries.jpg", category: "Foods" },
  { id: 3, name: "Chicken Wings", price: "40.000", image: "/images/wings.jpg", category: "Foods" },
  { id: 4, name: "Iced Coffee", price: "25.000", image: "/images/coffee.jpg", category: "Beverages" },
  { id: 5, name: "Sushi Roll", price: "50.000", image: "/images/sushi.jpg", category: "Foods" },
  { id: 6, name: "Chocolate Cake", price: "30.000", image: "/images/cake.jpg", category: "Dessert" },
  { id: 7, name: "Vanilla Cake", price: "30.000", image: "/images/cake.jpg", category: "Dessert" },
];

const categories = ["All Menu", "Foods", "Beverages", "Dessert"];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  // --- STATE LIFTED UP ---
  // The cart state is now managed here in the parent component.
  const [cart, setCart] = useState([]);

  // --- FUNCTION TO ADD ITEM TO CART ---
  const handleAddToCart = (itemToAdd) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === itemToAdd.id);

      if (existingItem) {
        // If item already in cart, just increase quantity
        return prevCart.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If new item, add to cart with quantity 1
        // Convert price string "35.000" to number 35000
        const priceAsNumber = parseInt(itemToAdd.price.replace(".", ""), 10);
        return [...prevCart, { ...itemToAdd, price: priceAsNumber, quantity: 1 }];
      }
    });
  };

  // --- FUNCTION TO UPDATE QUANTITY IN CART ---
  const handleUpdateQuantity = (itemId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0) // Remove item if quantity becomes 0
    );
  };

  // Filter logic for displaying catalog items
  const filteredItems = dummyFoodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All Menu" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans">
      <div className="h-screen max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-8">
        {/* Left side: Food Catalog */}
        <div className="flex-1 flex flex-col space-y-8">
          {/* Filter Buttons and Search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    selectedCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Food Catalog</h1>

          {/* Food Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-gray-700 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 overflow-hidden flex flex-col"
                >
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">Rp {item.price}</p>
                    {/* --- UPDATE: Add to Cart button now calls the handler function --- */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredItems.length === 0 && (
              <p className="text-center text-gray-400 mt-8">No items found.</p>
            )}
          </div>
        </div>

        {/* Right side: ListOrder (Cart) */}
        <div className="w-full lg:w-[380px] h-full flex-shrink-0">
          {/* --- PASSING PROPS: Pass state and functions to ListOrder --- */}
          <ListOrder
            cart={cart}
            updateQuantity={handleUpdateQuantity}
          />
        </div>
      </div>
    </div>
  );
}