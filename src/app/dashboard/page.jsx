"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { BarChart, DollarSign, Utensils, GlassWater, IceCream, ChefHat, Search, X, AlertCircle } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- UI COMPONENTS ---
const StatCard = ({ icon, title, value, onClick, className, isLoading }) => (
    <motion.div
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        className={`bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex items-center gap-6 shadow-lg ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            {isLoading ? (
                 <div className="h-8 w-32 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-2xl font-bold">{value}</p>
            )}
        </div>
    </motion.div>
);

const SalesDetailModal = ({ open, onClose, title, data, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    if (!open) return null;
    
    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gray-900/80 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <p className="text-center text-gray-400 p-4">Loading data...</p>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-gray-900">
                                    <tr>
                                        <th className="p-2 text-sm font-semibold text-gray-400">Menu Name</th>
                                        <th className="p-2 text-sm font-semibold text-gray-400 text-right">Total Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index} className="border-t border-gray-800 hover:bg-white/5">
                                            <td className="p-2">{item.name}</td>
                                            <td className="p-2 text-right font-mono">{item.sales.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
    const { userRole, userToken, loading: authLoading } = useAuth();
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [stats, setStats] = useState({});
    const [dailyOmzet, setDailyOmzet] = useState([]);
    const [topProducts, setTopProducts] = useState({ Foods: [], Beverages: [], Dessert: [] });
    const [pageLoading, setPageLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', data: [], isLoading: false });
    
    const [chartCategory, setChartCategory] = useState('All');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // --- DATA FETCHING ---
    const fetchDashboardData = useCallback(async () => {
        if (!userToken) return;
        try {
            setPageLoading(true);
            // Fetch stats and top products in parallel
            const [statsRes, foodsRes, beveragesRes, dessertRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, { headers: { 'Authorization': `Bearer ${userToken}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/top-products?category=Foods`, { headers: { 'Authorization': `Bearer ${userToken}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/top-products?category=Beverages`, { headers: { 'Authorization': `Bearer ${userToken}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/top-products?category=Dessert`, { headers: { 'Authorization': `Bearer ${userToken}` } })
            ]);

            if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats.');
            
            const statsData = await statsRes.json();
            const foodsData = await foodsRes.json();
            const beveragesData = await beveragesRes.json();
            const dessertData = await dessertRes.json();

            setStats(statsData.data);
            setTopProducts({
                Foods: foodsData.data || [],
                Beverages: beveragesData.data || [],
                Dessert: dessertData.data || [],
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setPageLoading(false);
        }
    }, [userToken]);

    const fetchChartData = useCallback(async () => {
        if (!userToken || !startDate || !endDate) return;
        try {
            setChartLoading(true);
            // --- FIX: Simplified the endDate parameter ---
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-omzet?startDate=${startDate}&endDate=${endDate}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch chart data.');
            const data = await response.json();
            setDailyOmzet(data.data || []);
        } catch (err) {
            // Don't overwrite main page error, just log it
            console.error("Chart fetch error:", err.message);
        } finally {
            setChartLoading(false);
        }
    }, [userToken, startDate, endDate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);


    const handleOpenModal = (title, category) => {
        setModalData({ title, data: topProducts[category], isLoading: false });
        setModalOpen(true);
    };

    const darkTheme = createTheme({ palette: { mode: 'dark' } });

    const chartSeries = [
        { dataKey: 'food', label: 'Food', color: '#1e3a8a' },
        { dataKey: 'beverage', label: 'Beverage', color: '#1d4ed8' },
        { dataKey: 'dessert', label: 'Dessert', color: '#a5b4fc' },
    ];
    
    const filteredSeries = chartCategory === 'All' 
        ? chartSeries 
        : chartSeries.filter(s => s.label === chartCategory);

    if (authLoading) {
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
    
    if (error) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4"/>
                <p className="text-xl">Failed to load dashboard</p>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans">
            <NextNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <Header title="Dashboard" />

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
                >
                    <StatCard icon={<BarChart size={28} />} title="Total Orders" value={stats.totalOrders?.toLocaleString() || '0'} isLoading={pageLoading} />
                    <StatCard icon={<DollarSign size={28} />} title="Total Omzet" value={`Rp ${stats.totalOmzet?.toLocaleString('id-ID') || '0'}`} isLoading={pageLoading} />
                    <StatCard icon={<ChefHat size={28} />} title="All Menu Orders" value={stats.totalItemsSold?.toLocaleString() || '0'} isLoading={pageLoading} />
                    <StatCard icon={<Utensils size={28} />} title="Total Foods Orders" value={stats.totalFoodSales?.toLocaleString() || '0'} onClick={() => handleOpenModal('Foods Sales', 'Foods')} isLoading={pageLoading}/>
                    <StatCard icon={<GlassWater size={28} />} title="Total Beverages Orders" value={stats.totalBeverageSales?.toLocaleString() || '0'} onClick={() => handleOpenModal('Beverages Sales', 'Beverages')} isLoading={pageLoading} />
                    <StatCard icon={<IceCream size={28} />} title="Total Desserts Orders" value={stats.totalDessertSales?.toLocaleString() || '0'} onClick={() => handleOpenModal('Desserts Sales', 'Dessert')} isLoading={pageLoading} />
                </motion.div>

                <motion.div 
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg"
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold">Total Omzet</h2>
                        <div className="flex items-center gap-2">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                            <span className="text-gray-500">-</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                            <select 
                                value={chartCategory}
                                onChange={(e) => setChartCategory(e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option>All</option>
                                <option>Food</option>
                                <option>Beverage</option>
                                <option>Dessert</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full h-96 overflow-x-auto">
                        <div className="min-w-[700px] h-full">
                           {chartLoading ? (
                               <div className="w-full h-full flex items-center justify-center">Loading chart data...</div>
                           ) : (
                            <ThemeProvider theme={darkTheme}>
                                <MuiBarChart
                                    dataset={dailyOmzet}
                                    xAxis={[{ 
                                        dataKey: 'date', 
                                        scaleType: 'band', 
                                        valueFormatter: (dateStr) => format(new Date(dateStr), 'dd MMM') 
                                    }]}
                                    series={filteredSeries.map(s => ({
                                        dataKey: s.dataKey,
                                        label: s.label,
                                        color: s.color,
                                        valueFormatter: (value) => value ? `Rp ${value.toLocaleString('id-ID')}` : '',
                                    }))}
                                    grid={{ horizontal: true }}
                                />
                           </ThemeProvider>
                           )}
                        </div>
                    </div>
                </motion.div>
            </main>
            
            <SalesDetailModal 
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData.title}
                data={modalData.data}
                isLoading={modalData.isLoading}
            />
        </div>
    );
}
