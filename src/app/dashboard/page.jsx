"use client";

import { useState, useMemo } from 'react';
import { useAuth } from "@/context/authContext";
import NextNav from '@/components/navigation/nextNav';
import Header from '@/components/header/header';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { BarChart, DollarSign, Utensils, GlassWater, IceCream, ChefHat, Search, X } from 'lucide-react';
import { format, subDays, startOfDay, addDays, isBefore, isEqual } from 'date-fns';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- MOCK DATA ---
const generateMockData = (startDateStr, endDateStr) => {
    const data = [];
    let currentDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
        data.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            food: Math.floor(Math.random() * 80000) + 20000,
            beverage: Math.floor(Math.random() * 150000) + 50000,
            dessert: Math.floor(Math.random() * 50000) + 5000,
        });
        currentDate = addDays(currentDate, 1);
    }
    return data;
};

const dailyOmzet = generateMockData('2025-08-01', '2025-09-30');

const foodSalesData = [
    { name: 'Nasi Goreng Spesial', sales: 150 },
    { name: 'Ayam Bakar Madu', sales: 125 },
    { name: 'Sate Ayam', sales: 110 },
    { name: 'Iga Bakar', sales: 95 },
    { name: 'Sop Buntut', sales: 80 },
];

const beverageSalesData = [
    { name: 'Es Teh Manis', sales: 250 },
    { name: 'Jus Alpukat', sales: 180 },
    { name: 'Kopi Susu', sales: 150 },
    { name: 'Lemon Tea', sales: 120 },
    { name: 'Es Jeruk', sales: 100 },
];

const dessertSalesData = [
    { name: 'Pudding Coklat', sales: 90 },
    { name: 'Cheesecake', sales: 75 },
    { name: 'Pisang Goreng Keju', sales: 120 },
    { name: 'Brownies', sales: 60 },
];
// --- END MOCK DATA ---


// --- UI COMPONENTS ---
const StatCard = ({ icon, title, value, onClick, className }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex items-center gap-6 shadow-lg ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </motion.div>
);

const SalesDetailModal = ({ open, onClose, title, data }) => {
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
                            placeholder="Search keyword here..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto">
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
                                        <td className="p-2 text-right font-mono">{item.sales}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
    const { userRole, loading } = useAuth();
    const user = { name: 'Fachrul', imageUrl: `https://ui-avatars.com/api/?name=Fachrul&background=3b82f6&color=fff` };
    const router = useRouter();

    const [isModalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', data: [] });
    const [chartCategory, setChartCategory] = useState('All');
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleOpenModal = (title, data) => {
        setModalData({ title, data });
        setModalOpen(true);
    };

    const totalOmzet = useMemo(() => dailyOmzet.reduce((acc, day) => acc + day.food + day.beverage + day.dessert, 0), []);
    const totalFoodSales = useMemo(() => foodSalesData.reduce((acc, item) => acc + item.sales, 0), []);
    const totalBeverageSales = useMemo(() => beverageSalesData.reduce((acc, item) => acc + item.sales, 0), []);
    const totalDessertSales = useMemo(() => dessertSalesData.reduce((acc, item) => acc + item.sales, 0), []);

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const chartSeries = [
        { dataKey: 'food', label: 'Food', color: '#1e3a8a' },
        { dataKey: 'beverage', label: 'Beverage', color: '#1d4ed8' },
        { dataKey: 'dessert', label: 'Dessert', color: '#a5b4fc' },
    ];
    
    const filteredSeries = chartCategory === 'All' 
        ? chartSeries 
        : chartSeries.filter(s => s.label === chartCategory);
    
    const filteredChartData = useMemo(() => {
        const today = startOfDay(new Date());
        
        if (startDate && endDate) {
            const start = startOfDay(new Date(startDate));
            const end = startOfDay(new Date(endDate));
            
            return dailyOmzet.filter(item => {
                const itemDate = startOfDay(new Date(item.date));
                return itemDate >= start && itemDate <= end;
            });
        }
        
        const sevenDaysAgo = subDays(today, 6);
        return dailyOmzet.filter(item => {
            const itemDate = startOfDay(new Date(item.date));
            return itemDate >= sevenDaysAgo && itemDate <= today;
        });
    }, [startDate, endDate]);


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
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white font-sans">
            <NextNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <Header title="Dashboard" />

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
                >
                    <StatCard icon={<BarChart />} title="Total Orders" value="1,280" />
                    <StatCard icon={<DollarSign />} title="Total Omzet" value={`Rp ${totalOmzet.toLocaleString('id-ID')}`} />
                    <StatCard icon={<ChefHat />} title="All Menu Orders" value={(totalFoodSales + totalBeverageSales + totalDessertSales).toLocaleString()} />
                    <StatCard icon={<Utensils />} title="Total Foods Orders" value={totalFoodSales.toLocaleString()} onClick={() => handleOpenModal('Foods Sales', foodSalesData)} />
                    <StatCard icon={<GlassWater />} title="Total Beverages Orders" value={totalBeverageSales.toLocaleString()} onClick={() => handleOpenModal('Beverages Sales', beverageSalesData)} />
                    <StatCard icon={<IceCream />} title="Total Desserts Orders" value={totalDessertSales.toLocaleString()} onClick={() => handleOpenModal('Desserts Sales', dessertSalesData)} />
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
                           <ThemeProvider theme={darkTheme}>
                                <MuiBarChart
                                    dataset={filteredChartData}
                                    xAxis={[{ 
                                        dataKey: 'date', 
                                        scaleType: 'band', 
                                        valueFormatter: (dateStr) => format(new Date(dateStr), 'dd/MM/yyyy') 
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
                        </div>
                    </div>
                </motion.div>
            </main>
            
            <SalesDetailModal 
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData.title}
                data={modalData.data}
            />
        </div>
    );
}