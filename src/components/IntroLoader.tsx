"use client";

import { useEffect, useState } from "react";

export default function IntroLoader() {
    const [show, setShow] = useState(false);
    const [stage, setStage] = useState(0); // 0: initial, 1: visible, 2: fading out

    useEffect(() => {
        // Only run on the very first load of the session
        const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
        if (hasSeenIntro) return;

        setShow(true);
        sessionStorage.setItem("hasSeenIntro", "true");

        // Stage 1: Show content
        const t1 = setTimeout(() => setStage(1), 100);
        // Stage 2: Start fade out
        const t2 = setTimeout(() => setStage(2), 2500);
        // Stage 3: Remove from DOM
        const t3 = setTimeout(() => setShow(false), 3200);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${stage === 2 ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className={`text-center px-6 transition-all duration-1000 transform ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                    <span className="text-slate-900 block md:inline">Abhivairavan Plumbing</span>
                    <span className="hidden md:inline mx-4 text-slate-300 font-light">×</span>
                    <span className="text-slate-500 font-medium block md:inline mt-2 md:mt-0">Zoink Digital designs</span>
                </h1>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="h-1 bg-slate-100 overflow-hidden rounded-full w-48">
                        <div className="h-full bg-slate-900 animate-loading-bar w-full" style={{ transformOrigin: 'left' }} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                        Initializing Systems
                    </p>
                </div>
            </div>
        </div>
    );
}
