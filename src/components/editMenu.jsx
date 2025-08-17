"use client";

import { useState, useEffect } from "react";
import { useCatalog } from "@/context/catalogContext";
import { UploadCloud, X } from "lucide-react";

export default function EditMenu({ itemToEdit, onFinished }) {
  const { handleEditMenuItem, categories } = useCatalog();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState("Foods");
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setPrice(itemToEdit.price);
      setCategory(itemToEdit.category);
      setImagePreview(itemToEdit.image);
      setDetail(itemToEdit.detail || "");
    }
  }, [itemToEdit]);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith("image/")) {
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
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedItem = {
      ...itemToEdit,
      name,
      price,
      detail,
      category,
      image: imagePreview,
    };
    handleEditMenuItem(updatedItem);
    onFinished();
  };

  if (!itemToEdit) return null;

  return (
    <aside className="h-full w-full bg-gray-900/80 backdrop-blur-sm text-white p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Edit Menu Item</h3>
        <button onClick={onFinished} className="text-gray-400 hover:text-white"><X size={20} /></button>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div
          onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave}
          className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-blue-500 bg-gray-800/50" : "border-gray-600"}`}
        >
          <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded-md" />
           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
             <p className="text-sm text-white">Drop to replace image</p>
           </div>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
        </div>

        <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600" />
        <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600" />
        
        <textarea
            placeholder="Item Detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
            rows="3"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600">
          {categories.filter(c => c !== "All Menu").map(cat => (<option key={cat} value={cat}>{cat}</option>))}
        </select>

        <button type="submit" className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition">
          Save Changes
        </button>
      </form>
    </aside>
  );
}