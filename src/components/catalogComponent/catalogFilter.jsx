"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useCatalog } from "@/context/catalogContext";
import { motion } from "framer-motion"; // Import motion

export default function CatalogFilter() {
  const {
    state, // Get the whole state object
    setSearch,
    setSelectedCategory,
    categories,
  } = useCatalog();
  const { search, selectedCategory } = state;

  // State to track if the search input is focused
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animation variants for the container to stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Each child will appear 0.05s after the previous one
      },
    },
  };

  // Animation variants for each individual item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="flex flex-wrap items-center justify-between gap-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- Animated Category Buttons --- */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none"
            whileTap={{ scale: 0.95 }} // Click animation
            variants={itemVariants} // Stagger animation
          >
            {/* The sliding highlight effect */}
            {selectedCategory === cat && (
              <motion.div
                layoutId="categoryHighlight"
                className="absolute inset-0 bg-blue-600 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">
              {cat}
            </span>
          </motion.button>
        ))}
      </div>

      {/* --- Animated Search Input --- */}
      <motion.div 
        className="relative w-full max-w-sm"
        variants={itemVariants} // Stagger animation is kept
        // The 'animate' and 'transition' props for focus are removed
      >
        <input
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          // 'onFocus' and 'onBlur' props are removed
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-none"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </motion.div>
    </motion.div>
  );
}