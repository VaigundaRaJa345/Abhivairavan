"use client";

import { useEffect, useState } from "react";

export default function IntroLoader() {
    const [show, setShow] = useState(true);
    const [stage, setStage] = useState(0); // 0: initial, 1: text visible, 2: fading out

    useEffect(() => {
        // Stage 1: Reveal text after 200ms
        const t1 = setTimeout(() => setStage(1), 200);
        // Stage 2: Start fade out after 2.2s
        const t2 = setTimeout(() => setStage(2), 2200);
        // Stage 3: Remove from DOM after 2.8s
        const t3 = setTimeout(() => setShow(false), 2800);

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
            <div className="text-center px-6">
                <h1
                    className={`text-2xl md:text-4xl font-bold tracking-tight transition-all duration-1000 ease-out transform
            ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                    <span className="text-slate-900">Abhivairavan Plumbing</span>
                    <span className="mx-3 text-slate-300 font-light">×</span>
                    <span className="text-slate-500 font-medium">Zoink Digital designs</span>
                </h1>
                <div
                    className={`mt-6 h-0.5 bg-slate-100 overflow-hidden rounded-full mx-auto max-w-[200px] transition-all duration-1000
            ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="h-full bg-slate-900 animate-loading-bar" />
                </div>
            </div>
        </div>
    );
}
