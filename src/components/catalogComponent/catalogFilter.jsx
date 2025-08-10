"use client";

import { Search } from "lucide-react";
import { useCatalog } from "@/context/catalogContext";

export default function CatalogFilter() {
  const {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    categories
  } = useCatalog();

  return (
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
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>
    </div>
  );
}