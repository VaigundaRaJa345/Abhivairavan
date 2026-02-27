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
        <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">
                    {user.branchName || "Master Admin"}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-semibold">
                    {user.role} {user.branchName ? `(${user.branchName})` : ""}
                </p>
            </div>
            <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-600"
                title="Sign Out"
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}
