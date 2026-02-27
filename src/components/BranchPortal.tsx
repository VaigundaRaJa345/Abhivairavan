"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SOURCES = [
    "Google Ads",
    "Facebook/Instagram",
    "Word of Mouth",
    "Walk-by",
    "JustDial",
    "Old Customer",
    "Architect/Contractor",
    "Other",
];

const BRANDS = ["Jaquar", "Kohler", "Grohe", "Parryware", "Other"];

export default function BranchPortal({ branchName }: { branchName: string }) {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [walkins, setWalkins] = useState("");
    const [revenue, setRevenue] = useState("");
    const [source, setSource] = useState("");
    const [topBrand, setTopBrand] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");

        try {
            const res = await fetch("/api/entries", {
                method: "POST",
                body: JSON.stringify({
                    date,
                    branchName,
                    walkins: parseInt(walkins),
                    revenue: parseFloat(revenue),
                    source,
                    topBrand,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!res.ok) throw new Error("Failed to submit");

            setStatus("success");
            setWalkins("");
            setRevenue("");
            setSource("");
            setTopBrand("");

            setTimeout(() => setStatus("idle"), 5000);
        } catch (err) {
            console.error(err);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">{branchName} Portal</h2>
                <p className="text-slate-500 mt-2">Daily Data Entry Form</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 md:p-8"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Entry Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Total Walk-ins
                            </label>
                            <input
                                type="number"
                                value={walkins}
                                onChange={(e) => setWalkins(e.target.value)}
                                className="input-field"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Total Sales Revenue (INR)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input
                                type="number"
                                value={revenue}
                                onChange={(e) => setRevenue(e.target.value)}
                                className="input-field pl-8"
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Walk-in Source
                        </label>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="input-field"
                            required
                        >
                            <option value="">Select Source</option>
                            {SOURCES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Top Selling Brand Today
                        </label>
                        <select
                            value={topBrand}
                            onChange={(e) => setTopBrand(e.target.value)}
                            className="input-field"
                            required
                        >
                            <option value="">Select Brand</option>
                            {BRANDS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === "success" ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100 italic"
                            >
                                <CheckCircle2 size={20} />
                                Entry submitted successfully!
                            </motion.div>
                        ) : status === "error" ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 italic"
                            >
                                <AlertCircle size={20} />
                                Failed to submit. Please check your connection.
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? "Sending..." : (
                            <>
                                <Send size={18} />
                                Submit Daily Report
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            <div className="mt-8 text-center text-slate-400 text-sm">
                Logged in as Branch Manager
            </div>
        </div>
    );
}
