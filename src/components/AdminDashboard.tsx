"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";
import {
    TrendingUp, Users, DollarSign, Percent,
    Download, Filter, ChevronDown, Check
} from "lucide-react";
import { format, isWithinInterval, parseISO, startOfToday, startOfWeek, startOfMonth, subDays } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
    const [selectedBranch, setSelectedBranch] = useState("All Branches");
    const [selectedSource, setSelectedSource] = useState("All Sources");
    const [searchDate, setSearchDate] = useState("");
    const [minWalkins, setMinWalkins] = useState("");
    const [minSales, setMinSales] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    const sources = useMemo(() => {
        const uniqueSources = new Set(data.map(entry => entry.source));
        return ["All Sources", ...Array.from(uniqueSources)];
    }, [data]);

    const branches = useMemo(() => {
        const uniqueBranches = new Set(data.map(entry => entry.branch));
        return ["All Branches", ...Array.from(uniqueBranches)];
    }, [data]);

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredData = useMemo(() => {
        let result = data;

        // Branch Filter
        if (selectedBranch !== "All Branches") {
            result = result.filter(entry => entry.branch === selectedBranch);
        }

        // Source Filter
        if (selectedSource !== "All Sources") {
            result = result.filter(entry => entry.source === selectedSource);
        }

        // Date Filter (Specific Search)
        if (searchDate) {
            result = result.filter(entry => entry.date.includes(searchDate));
        }

        // Walk-in Filter
        if (minWalkins) {
            result = result.filter(entry => entry.walkins >= parseInt(minWalkins));
        }

        // Sales Filter
        if (minSales) {
            result = result.filter(entry => entry.sales >= parseFloat(minSales));
        }

        // Time Range Filter
        if (filterRange !== "all") {
            const now = new Date();
            let start: Date;

            if (filterRange === "today") start = startOfToday();
            else if (filterRange === "week") start = startOfWeek(now);
            else if (filterRange === "month") start = startOfMonth(now);
            else start = subDays(now, 30);

            result = result.filter(entry => {
                try {
                    const entryDate = parseISO(entry.date);
                    return isWithinInterval(entryDate, { start, end: now });
                } catch (e) {
                    return false;
                }
            });
        }

        return result;
    }, [data, filterRange, selectedBranch, selectedSource, searchDate, minWalkins, minSales]);

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
        // Take a larger slice to show meaningful trends
        filteredData.slice(-30).forEach(entry => {
            try {
                const d = format(parseISO(entry.date), "MMM dd");
                trends[d] = (trends[d] || 0) + entry.sales;
            } catch (e) { }
        });
        return Object.entries(trends).map(([date, sales]) => ({ date, sales }));
    }, [filteredData]);

    const handleExport = (format: "csv" | "excel" | "pdf") => {
        const exportData = filteredData.map(entry => ({
            Date: entry.date,
            Branch: entry.branch,
            "Total Walk-ins": entry.walkins,
            "Sales (INR)": entry.sales,
            Source: entry.source,
            "Top Selling Brand": entry.brand
        }));

        if (format === "pdf") {
            const doc = new jsPDF() as any;
            doc.text(`RetailOS - Export (${selectedBranch})`, 14, 15);
            doc.autoTable({
                startY: 20,
                head: [["Date", "Branch", "Walk-ins", "Sales", "Source", "Top Brand"]],
                body: exportData.map(d => [d.Date, d.Branch, d["Total Walk-ins"], `₹${d["Sales (INR)"]}`, d.Source, d["Top Selling Brand"]]),
                theme: 'grid',
                headStyles: { fillStyle: '#0F172A' }
            });
            doc.save(`retailos_export_${selectedBranch.replace(' ', '_')}.pdf`);
        } else {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Export");
            XLSX.writeFile(workbook, `retailos_export_${selectedBranch.replace(' ', '_')}.${format === "excel" ? "xlsx" : "csv"}`);
        }
        setIsExportOpen(false);
    };

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
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Branch Operations Data</h3>
                            <p className="text-sm text-slate-500">Viewing: {selectedBranch} {filterRange !== 'all' ? `(${filterRange})` : ''}</p>
                        </div>
                        <div className="flex gap-3">
                            {/* Export Menu */}
                            <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 shadow-sm"
                                >
                                    <Download size={18} />
                                    <span className="text-sm font-semibold">Export</span>
                                    <ChevronDown size={14} />
                                </button>

                                {isExportOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                                        {(["excel", "csv", "pdf"] as const).map((fmt) => (
                                            <button
                                                key={fmt}
                                                onClick={() => handleExport(fmt)}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 capitalize transition-colors"
                                            >
                                                Download as {fmt === 'excel' ? 'Excel' : fmt.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Filter Menu */}
                            <div className="relative" ref={filterRef}>
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md group"
                                >
                                    <Filter size={18} />
                                    <span className="text-sm font-semibold">Filter Branch</span>
                                    <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                                            Select Branch
                                        </div>
                                        {branches.map((branch) => (
                                            <button
                                                key={branch}
                                                onClick={() => {
                                                    setSelectedBranch(branch);
                                                    setIsFilterOpen(false);
                                                }}
                                                className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                {branch}
                                                {selectedBranch === branch && <Check size={16} className="text-blue-600" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Date</label>
                            <input
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Source</label>
                            <select
                                value={selectedSource}
                                onChange={(e) => setSelectedSource(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                {sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Min Walk-ins</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minWalkins}
                                onChange={(e) => setMinWalkins(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Min Sales</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minSales}
                                onChange={(e) => setMinSales(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest">
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold text-center">Branch</th>
                                <th className="px-6 py-4 font-bold text-center">Walk-ins</th>
                                <th className="px-6 py-4 font-bold text-right">Sales</th>
                                <th className="px-6 py-4 font-bold text-center">Source</th>
                                <th className="px-6 py-4 font-bold text-center">Top Selling Brand</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.slice().reverse().map((entry, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-slate-600 text-sm">{entry.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-slate-900">{entry.branch}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 text-sm">{entry.walkins}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-slate-900 font-bold bg-slate-50 px-2 py-1 rounded-md">₹{entry.sales.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-slate-100/50 text-slate-600 text-[10px] rounded-full font-bold border border-slate-200 uppercase tracking-tight">
                                            {entry.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-slate-600 text-sm font-medium">{entry.brand}</span>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Filter size={40} className="text-slate-200" />
                                            <p className="text-slate-400 font-medium italic">No entries found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {filteredData.length > 0 && (
                            <tfoot className="bg-slate-900 text-white font-bold">
                                <tr>
                                    <td className="px-6 py-4 rounded-bl-xl">TOTAL</td>
                                    <td className="px-6 py-4 text-center">
                                        {Array.from(new Set(filteredData.map(d => d.branch))).length} Branches
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {filteredData.reduce((acc, curr) => acc + curr.walkins, 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg">
                                        ₹{filteredData.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center rounded-br-xl" colSpan={2}>
                                        {filteredData.length} records
                                    </td>
                                </tr>
                            </tfoot>
                        )}
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
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        </div>
    );
}
