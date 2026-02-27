"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">
                    {session.user.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-semibold">
                    {session.user.role} {session.user.branchName ? `(${session.user.branchName})` : ""}
                </p>
            </div>
            <button
                onClick={() => signOut()}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-600"
                title="Sign Out"
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}
