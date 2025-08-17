"use client";

import { useState, useCallback } from "react";
import { useCatalog } from "@/context/catalogContext";
import { UploadCloud, X } from "lucide-react";

export default function AddMenu() {
  const { handleAddMenuItem, categories } = useCatalog();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState("Foods");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !detail || !category || !imagePreview) {
      alert("Please fill all fields and add an image.");
      return;
    }
    const newItem = {
      id: Date.now(),
      name,
      price,
      detail,
      category,
      image: imagePreview,
    };
    handleAddMenuItem(newItem);
    // Reset form
    setName("");
    setPrice("");
    setDetail("");
    setCategory("Foods");
    clearImage();
  };

  return (
    <aside className="h-full w-full bg-gray-900/80 backdrop-blur-sm text-white p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
      <h3 className="font-semibold mb-4 text-lg">Add New Menu Item</h3>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        {/* Image Upload */}
        <div
          onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave}
          className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
            isDragging ? "border-blue-500 bg-gray-800/50" : "border-gray-600"
          }`}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded-md" />
              <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 rounded-full p-1">
                <X size={16} />
              </button>
            </>
          ) : (
            <div className="text-center">
              <UploadCloud size={32} className="mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-400">
                <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
              </p>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          )}
        </div>

        {/* Form Fields */}
        <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600" />
        <input type="text" placeholder="Price (e.g., 25.000)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600" />
        
        <textarea
            placeholder="Item Detail (e.g., Made with fresh cheese cream)"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
            rows="3"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600">
          {categories.filter(c => c !== "All Menu").map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button type="submit" className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition">
          Add Item to Menu
        </button>
      </form>
    </aside>
  );
}