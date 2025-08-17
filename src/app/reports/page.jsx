"use client";

import { useState, useMemo } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
// --- CHANGE 1: Import the Download icon ---
import { Eye, Search, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, startOfDay } from 'date-fns';

// --- MOCK DATA FOR REPORTS (Replace with your actual data fetching) ---
const generateMockOrders = (count) => {
    const orders = [];
    const customerNames = ["Andi Wijaya", "Budi Santoso", "Citra Lestari", "Dewi Anggraini", "Eko Prasetyo"];
    const orderTypes = ["Dine In", "Take Away"];
    const menu = {
        Foods: [{ name: 'Nasi Goreng', price: 25000 }, { name: 'Ayam Bakar', price: 35000 }],
        Beverages: [{ name: 'Es Teh', price: 5000 }, { name: 'Jus Alpukat', price: 15000 }],
        Desserts: [{ name: 'Pudding Coklat', price: 12000 }, { name: 'Pisang Goreng', price: 10000 }],
    };

    for (let i = 0; i < count; i++) {
        const orderDate = new Date(2025, 7, Math.floor(Math.random() * 17) + 1, Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
        const orderType = orderTypes[Math.floor(Math.random() * 2)];
        const items = [];
        const categories = new Set();
        
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
            const categoryKeys = Object.keys(menu);
            const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            const randomItem = menu[randomCategory][Math.floor(Math.random() * menu[randomCategory].length)];
            items.push({ ...randomItem, category: randomCategory, qty: Math.floor(Math.random() * 2) + 1 });
            categories.add(randomCategory);
        }
        
        const subTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const tax = subTotal * 0.11;
        const total = subTotal + tax;
        const received = Math.ceil((total + Math.random() * 20000) / 5000) * 5000;

        orders.push({
            id: `ORD-${String(Date.now()).slice(-4)}-${i}`,
            orderDate,
            orderType,
            tableNumber: orderType === "Dine In" ? Math.floor(Math.random() * 10) + 1 : null,
            customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
            categories: Array.from(categories),
            items,
            payment: {
                subTotal,
                tax,
                total,
                received,
                change: received - total,
            }
        });
    }
    return orders.sort((a, b) => b.orderDate - a.orderDate);
};

const allOrders = generateMockOrders(50);
// --- END MOCK DATA ---


// --- UI COMPONENTS ---
const TransactionDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl text-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Transaction Detail</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto text-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                        <p className="text-gray-400">No. Order</p><p className="font-mono text-right">{order.id}</p>
                        <p className="text-gray-400">Order Date</p><p className="text-right">{format(order.orderDate, 'dd/MM/yyyy HH:mm')}</p>
                        <p className="text-gray-400">Customer Name</p><p className="text-right">{order.customerName}</p>
                        <p className="text-gray-400">Order Type</p><p className="text-right">{order.orderType}{order.tableNumber ? ` - Table ${order.tableNumber}`: ''}</p>
                    </div>

                    <div className="border-y border-dashed border-gray-600 py-4 my-4">
                        <h3 className="font-semibold mb-2">Ordered Items</h3>
                        {order.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-x-4 items-center mb-1">
                                <span>{item.name}</span>
                                <span className="text-gray-400">{item.qty} x {item.price.toLocaleString('id-ID')}</span>
                                <span className="text-right font-mono">{(item.qty * item.price).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </div>

                     <div className="space-y-1 font-mono">
                        <div className="flex justify-between"><span className="text-gray-400">Sub Total</span><span>{order.payment.subTotal.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Tax (11%)</span><span>{order.payment.tax.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between font-bold text-base border-t border-gray-600 pt-2 mt-2"><span className="text-white">Total</span><span>{order.payment.total.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between mt-4"><span className="text-gray-400">Received</span><span>{order.payment.received.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Change</span><span>{order.payment.change.toLocaleString('id-ID')}</span></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// --- MAIN REPORTS PAGE ---
export default function ReportsPage() {
    const { userRole, loading } = useAuth();
    const router = useRouter();

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [orderTypeFilter, setOrderTypeFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const orderDate = startOfDay(order.orderDate);
            if (startDate && orderDate < startOfDay(new Date(startDate))) return false;
            if (endDate && orderDate > startOfDay(new Date(endDate))) return false;
            if (orderTypeFilter !== 'All' && order.orderType !== orderTypeFilter) return false;
            if (categoryFilter !== 'All' && !order.categories.includes(categoryFilter)) return false;
            return true;
        });
    }, [startDate, endDate, categoryFilter, orderTypeFilter]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredOrders, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    // --- CHANGE 2: Add the CSV export handler function ---
    const handleExportCSV = () => {
        if (filteredOrders.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["No Order", "Order Date", "Customer Name", "Order Type", "Table Number", "Items", "Sub Total", "Tax", "Total"];
        
        // Function to safely handle values with commas
        const escapeCsv = (str) => {
            if (str === null || str === undefined) return '';
            const s = String(str);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };

        const csvRows = filteredOrders.map(order => {
            const itemsStr = order.items.map(i => `${i.qty}x ${i.name}`).join('; ');
            const row = [
                order.id,
                format(order.orderDate, 'yyyy-MM-dd HH:mm:ss'),
                order.customerName,
                order.orderType,
                order.tableNumber || 'N/A',
                itemsStr,
                order.payment.subTotal,
                order.payment.tax,
                order.payment.total
            ].map(escapeCsv);
            return row.join(',');
        });

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `PadiPos_Reports_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <main className="flex-1 p-8 flex flex-col overflow-hidden">
                <Header title="Sales Report" />

                {/* --- CHANGE 3: Update the filter section to include the download button --- */}
                <motion.div 
                    className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="All">All Order Types</option>
                            <option value="Dine In">Dine In</option>
                            <option value="Take Away">Take Away</option>
                        </select>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="All">All Categories</option>
                            <option value="Foods">Foods</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Desserts">Desserts</option>
                        </select>
                    </div>
                     <button
                        onClick={handleExportCSV}
                        className="ml-4 flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </motion.div>

                <motion.div 
                    className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg flex-1 flex flex-col overflow-hidden"
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-3">No Order</th>
                                    <th className="px-6 py-3">Order Date</th>
                                    <th className="px-6 py-3">Order Type</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Customer Name</th>
                                    <th className="px-6 py-3 text-center">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="px-6 py-4 font-mono">{order.id}</td>
                                        <td className="px-6 py-4">{format(order.orderDate, 'E, dd/MM/yyyy HH:mm:ss')}</td>
                                        <td className="px-6 py-4">{order.orderType}</td>
                                        <td className="px-6 py-4">{order.categories.join(', ')}</td>
                                        <td className="px-6 py-4">{order.customerName}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleViewDetails(order)} className="p-2 text-blue-400 hover:text-blue-300">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between pt-4 text-sm flex-shrink-0">
                        <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none">
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                        <span>Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><ChevronLeft size={16}/></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 disabled:opacity-50"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                </motion.div>
            </main>
            
            <TransactionDetailModal 
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}