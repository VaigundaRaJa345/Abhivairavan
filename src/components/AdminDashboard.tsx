"use client";

import { useState, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";
import {
    TrendingUp, Users, DollarSign, Percent,
    Download, Filter
} from "lucide-react";
import { format, isWithinInterval, parseISO, startOfToday, startOfWeek, startOfMonth, subDays } from "date-fns";

export type AnalyticsEntry = {
    timestamp: string;
    date: string;
    branch: string;
    walkins: number;
    sales: number;
    source: string;
    brand: string;
};

export default function AdminDashboard({ data }: { data: AnalyticsEntry[] }) {
    const [filterRange, setFilterRange] = useState<"all" | "today" | "week" | "month">("all");

    const filteredData = useMemo(() => {
        if (filterRange === "all") return data;

        const now = new Date();
        let start: Date;

        if (filterRange === "today") start = startOfToday();
        else if (filterRange === "week") start = startOfWeek(now);
        else if (filterRange === "month") start = startOfMonth(now);
        else start = subDays(now, 30);

        return data.filter(entry => {
            try {
                const entryDate = parseISO(entry.date);
                return isWithinInterval(entryDate, { start, end: now });
            } catch (e) {
                return false;
            }
        });
    }, [data, filterRange]);

    const stats = useMemo(() => {
        const totalWalkins = filteredData.reduce((acc, curr) => acc + curr.walkins, 0);
        const totalSales = filteredData.reduce((acc, curr) => acc + curr.sales, 0);
        const conversionRate = totalWalkins > 0 ? (filteredData.length / totalWalkins) * 100 : 0;
        const grossProfit = totalSales * 0.25;

        return {
            totalWalkins,
            totalSales,
            conversionRate,
            grossProfit
        };
    }, [filteredData]);

    const branchData = useMemo(() => {
        const branches: Record<string, number> = {};
        filteredData.forEach(entry => {
            branches[entry.branch] = (branches[entry.branch] || 0) + entry.walkins;
        });
        return Object.entries(branches).map(([name, walkins]) => ({ name, walkins }));
    }, [filteredData]);

    const salesTrends = useMemo(() => {
        const trends: Record<string, number> = {};
        filteredData.slice(-15).forEach(entry => {
            try {
                const d = format(parseISO(entry.date), "MMM dd");
                trends[d] = (trends[d] || 0) + entry.sales;
            } catch (e) { }
        });
        return Object.entries(trends).map(([date, sales]) => ({ date, sales }));
    }, [filteredData]);

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Master Analytics</h2>
                    <p className="text-slate-500 mt-1">Real-time overview of all retail operations</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    {(["today", "week", "month", "all"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setFilterRange(r)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterRange === r
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPICard
                    title="Total Walk-ins"
                    value={stats.totalWalkins.toLocaleString()}
                    icon={<Users className="text-blue-600" />}
                    trend="+12%"
                />
                <KPICard
                    title="Total Revenue"
                    value={`₹${stats.totalSales.toLocaleString()}`}
                    icon={<DollarSign className="text-green-600" />}
                    trend="+8.4%"
                />
                <KPICard
                    title="Conversion Rate"
                    value={`${stats.conversionRate.toFixed(1)}%`}
                    icon={<Percent className="text-amber-600" />}
                    trend="-2.1%"
                />
                <KPICard
                    title="Est. Gross Profit"
                    value={`₹${stats.grossProfit.toLocaleString()}`}
                    icon={<TrendingUp className="text-purple-600" />}
                    trend="+15%"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-slate-400" />
                        Walk-ins per Branch
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="walkins" fill="#0F172A" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-slate-400" />
                        Revenue Trends
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#D4AF37"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Raw Data Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Recent Branch Entries</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200">
                            <Download size={18} className="text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200">
                            <Filter size={18} className="text-slate-600" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Branch</th>
                                <th className="px-6 py-4 font-semibold">Walk-ins</th>
                                <th className="px-6 py-4 font-semibold">Sales</th>
                                <th className="px-6 py-4 font-semibold">Source</th>
                                <th className="px-6 py-4 font-semibold">Top Brand</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.slice().reverse().map((entry, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600">{entry.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-900">{entry.branch}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{entry.walkins}</td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">₹{entry.sales.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                                            {entry.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{entry.brand}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                        No entries found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="glass-card rounded-2xl p-6 border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend}
                </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        </div>
    );
}
