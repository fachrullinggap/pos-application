"use client";

import { useState, useMemo } from "react";
import { useCatalog } from "@/context/catalogContext";
import { useAuth } from "@/context/authContext";

// --- Payment Modal Component (No changes needed here) ---
const PaymentModal = ({ isOpen, onClose, total, onSubmit }) => {
  const [amountReceived, setAmountReceived] = useState("");
  const [error, setError] = useState("");

  const amountChange = useMemo(() => {
    const received = parseFloat(amountReceived);
    if (isNaN(received) || received < total) {
      return 0;
    }
    return received - total;
  }, [amountReceived, total]);

  const handleSubmit = () => {
    const received = parseFloat(amountReceived);
     if (isNaN(received) || received < total) {
      setError("Amount received must be a valid number and greater than the total.");
      return;
    }
    setError("");
    onSubmit(received);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Payment</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="text-gray-300">Total Amount:</span>
            <span className="font-semibold text-blue-400">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div>
            <label htmlFor="amountReceived" className="block text-sm font-medium text-gray-300 mb-1">Amount Received</label>
            <input
              id="amountReceived"
              type="number"
              placeholder="Enter amount received"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="w-full bg-gray-900 px-4 py-2 rounded-md border border-gray-600 placeholder-gray-500 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-300">Change:</span>
            <span className="font-semibold text-green-400">Rp {amountChange.toLocaleString('id-ID')}</span>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        <div className="mt-6 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};


const ListOrder = () => {
  const { state, handleUpdateQuantity, handleCreateOrder } = useCatalog();
  const { userId } = useAuth();
  const { cart } = state;

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("Dine In");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subTotal * 0.11;
  const total = subTotal + tax;

  const handlePayNowClick = () => {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    if (!customerName) {
        alert("Please enter a customer name.");
        return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (amountReceived) => {
    // --- CHANGED: Prepare data with customerName ---
    const orderData = {
      customerName: customerName, // <-- Send the name from the state
      userId: userId,
      orderType: orderType === "Dine In" ? "DINE_IN" : "TAKE_AWAY",
      orderDetails: orderType === "Dine In" ? `Table ${tableNumber}` : "Take Away",
      amountReceived: amountReceived,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    const result = await handleCreateOrder(orderData);

    if (result.success) {
      alert(result.message);
      setIsModalOpen(false);
      setCustomerName("");
      setTableNumber("");
    } else {
      alert(`Error: ${result.error}`);
    }
  };


  return (
    <>
      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        total={total}
        onSubmit={handleConfirmPayment}
      />
      <aside className="h-full w-full bg-gray-900/80 backdrop-blur-sm text-white p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
        <div className="text-lg font-semibold text-gray-200">
          No. Order: <span className="text-blue-400">New Order</span>
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
          {orderType === 'Dine In' && (
            <input type="text" placeholder="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600 placeholder-gray-400 text-white"/>
          )}
        </div>

        <div className="border-t border-b border-gray-700 my-4"></div>

        <h3 className="font-semibold mb-2">My Order</h3>
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
                    <p className="text-gray-400">Rp {item.price.toLocaleString('id-ID')}</p>
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
              <span>Rp {subTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Tax (11%)</span>
              <span>Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={handlePayNowClick}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Pay Now
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default ListOrder;
