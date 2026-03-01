"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface AuthUser {
    role: string;
    branchName?: string;
}

export function UserMenu() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => setUser(data.user));
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    if (!user) return null;

    return (
        <div className="flex items-center gap-4 bg-slate-50/50 pl-4 pr-1 py-1 rounded-2xl border border-slate-100">
            <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-none">
                    {user?.branchName || "Master Admin"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-extrabold">
                    {user?.role || "ADMIN"}
                </p>
            </div>
            <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all text-slate-400 hover:text-red-600 group"
                title="Sign Out"
            >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
}
