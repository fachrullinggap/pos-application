"use client";

import { useState } from "react";
import { useCatalog } from "@/context/catalogContext";

const ListOrder = () => {
  const { cart, handleUpdateQuantity } = useCatalog();
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("Dine In");

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subTotal * 0.1;
  const total = subTotal + tax;

  return (
    // --- FIX ---
    // Change h-full to max-h-full and add overflow-hidden
    <aside className="h-full w-full bg-gray-900/80 backdrop-blur-sm text-white p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
      <div className="text-lg font-semibold text-gray-200">
        No. Order: <span className="text-blue-400">#00123</span>
      </div>

      <div className="flex gap-3 my-4">
        {[{ label: "Dine In" }, { label: "Take Away" }].map(({ label }) => (
          <button
            key={label}
            onClick={() => setOrderType(label)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              orderType === label
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600 placeholder-gray-400 text-white"/>
        <input type="text" placeholder="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600 placeholder-gray-400 text-white"/>
      </div>

      <div className="border-t border-b border-gray-700 my-4"></div>

      <h3 className="font-semibold mb-2">My Order</h3>
      {/* This inner div will now correctly scroll */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {cart.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover"/>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-400">Rp {item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleUpdateQuantity(item.id, -1)} className="bg-gray-700 w-7 h-7 rounded-full transition hover:bg-gray-600">-</button>
                <span className="w-4 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item.id, 1)} className="bg-gray-700 w-7 h-7 rounded-full transition hover:bg-gray-600">+</button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-gray-700 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Subtotal</span>
            <span>Rp {subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Tax (10%)</span>
            <span>Rp {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
          <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition">
            Pay Now
          </button>
        </div>
      )}
    </aside>
  );
};

export default ListOrder;
