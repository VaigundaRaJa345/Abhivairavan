"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingAnimation() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Show loading bar on any URL change
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-1.5 w-full bg-slate-100/50 overflow-hidden pointer-events-none">
            <div className="h-full bg-slate-900 animate-loading-bar w-full" />
        </div>
    );
}
