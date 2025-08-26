"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Eye, X, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';

// --- UI COMPONENTS ---
const TransactionDetailModal = ({ order, onClose, isLoading }) => {
    if (isLoading) {
        return (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-8 text-center">
                    <p className="text-white">Loading Details...</p>
                </div>
            </div>
        )
    }

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
                        <p className="text-gray-400">No. Order</p><p className="font-mono text-right">{order.orderNumber}</p>
                        <p className="text-gray-400">Order Date</p><p className="text-right">{format(parseISO(order.orderDate), 'dd/MM/yyyy HH:mm')}</p>
                        <p className="text-gray-400">Customer Name</p><p className="text-right">{order.customer.name}</p>
                        <p className="text-gray-400">Order Type</p><p className="text-right">{order.orderType === 'DINE_IN' ? 'Dine In' : 'Take Away'}{order.orderDetails ? ` - ${order.orderDetails}`: ''}</p>
                    </div>

                    <div className="border-y border-dashed border-gray-600 py-4 my-4">
                        <h3 className="font-semibold mb-2">Ordered Items</h3>
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-x-4 items-center mb-1">
                                <span>{item.product.name}</span>
                                <span className="text-gray-400">{item.quantity} x {item.price.toLocaleString('id-ID')}</span>
                                <span className="text-right font-mono">{(item.quantity * item.price).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </div>

                     <div className="space-y-1 font-mono">
                        <div className="flex justify-between"><span className="text-gray-400">Sub Total</span><span>{order.subTotal.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Tax (11%)</span><span>{order.tax.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between font-bold text-base border-t border-gray-600 pt-2 mt-2"><span className="text-white">Total</span><span>{order.total.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between mt-4"><span className="text-gray-400">Received</span><span>{order.amountReceived.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Change</span><span>{order.amountChange.toLocaleString('id-ID')}</span></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// --- MAIN REPORTS PAGE ---
export default function ReportsPage() {
    const { userRole, userToken, loading: authLoading } = useAuth();
    const router = useRouter();

    const [allOrders, setAllOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchOrders = async () => {
            if (!userToken) return;
            try {
                setError(null);
                setPageLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/get-all-orders`, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });
                if (!response.ok) throw new Error('Failed to fetch reports.');
                const data = await response.json();
                setAllOrders(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setPageLoading(false);
            }
        };
        fetchOrders();
    }, [userToken]);


    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const orderDate = startOfDay(parseISO(order.orderDate));
            if (startDate && orderDate < startOfDay(new Date(startDate))) return false;
            if (endDate && orderDate > startOfDay(new Date(endDate))) return false;
            return true;
        });
    }, [startDate, endDate, allOrders]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredOrders, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    const handleViewDetails = async (orderId) => {
        if (!orderId) return;
        try {
            setIsModalLoading(true);
            setSelectedOrder(null);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/get-id-order/${orderId}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch order details.');
            const data = await response.json();
            setSelectedOrder(data.data);
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsModalLoading(false);
        }
    };

    // --- UPDATED: CSV Export Handler ---
    const handleExportCSV = async () => {
        if (filteredOrders.length === 0) {
            alert("No data to export.");
            return;
        }

        alert("Preparing detailed report for CSV export. This may take a moment...");

        try {
            // 1. Fetch details for all filtered orders
            const detailPromises = filteredOrders.map(order =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/get-id-order/${order.id}`, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                }).then(res => res.json())
            );

            const detailResults = await Promise.all(detailPromises);
            const detailedOrders = detailResults.map(res => res.data);

            // 2. Define detailed headers
            const headers = [
                "Order Number", "Order Date", "Customer Name", "Order Type", "Order Details",
                "Item Name", "Item Quantity", "Item Price", "Item Subtotal",
                "Order Subtotal", "Order Tax", "Order Total", "Amount Received", "Change"
            ];
            
            const escapeCsv = (str) => {
                if (str === null || str === undefined) return '';
                const s = String(str);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            // 3. Create a row for each item in each order
            const csvRows = detailedOrders.flatMap(order => {
                return order.orderItems.map(item => {
                    const row = [
                        order.orderNumber,
                        format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss'),
                        order.customer.name,
                        order.orderType,
                        order.orderDetails,
                        item.product.name,
                        item.quantity,
                        item.price,
                        item.quantity * item.price,
                        order.subTotal,
                        order.tax,
                        order.total,
                        order.amountReceived,
                        order.amountChange
                    ].map(escapeCsv);
                    return row.join(',');
                });
            });

            const csvString = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `PadiPos_Detailed_Reports_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            alert(`Failed to generate detailed CSV: ${err.message}`);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Authentication...</div>;
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

                <motion.div 
                    className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 flex-grow">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
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
                    {pageLoading ? (
                        <div className="flex-1 flex items-center justify-center">Loading reports...</div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center text-red-400">
                            <AlertCircle className="mr-2"/> {error}
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-3">No Order</th>
                                            <th className="px-6 py-3">Order Date</th>
                                            <th className="px-6 py-3">Customer Name</th>
                                            <th className="px-6 py-3">Total</th>
                                            <th className="px-6 py-3 text-center">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedOrders.map(order => (
                                            <tr key={order.id} className="border-b border-gray-800 hover:bg-white/5">
                                                <td className="px-6 py-4 font-mono">{order.orderNumber}</td>
                                                <td className="px-6 py-4">{format(parseISO(order.orderDate), 'E, dd/MM/yyyy HH:mm')}</td>
                                                <td className="px-6 py-4">{order.customerName}</td>
                                                <td className="px-6 py-4 font-mono">Rp {order.total.toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleViewDetails(order.id)} className="p-2 text-blue-400 hover:text-blue-300">
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
                        </>
                    )}
                </motion.div>
            </main>
            
            <TransactionDetailModal 
                order={selectedOrder}
                isLoading={isModalLoading}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}
