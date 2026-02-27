import { signJWT } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Helper to find env vars even if they have prefixes or weird casing
    const getEnv = (key: string) => {
        const foundKey = Object.keys(process.env).find(k => k.toUpperCase().includes(key.toUpperCase()));
        return foundKey ? process.env[foundKey]?.trim() : undefined;
    };

    const VALID_USERS = [
        { email: "admin@abhivairavan.com", password: getEnv("ADMIN_PASSWORD"), role: "admin" },
        { email: "kolathur@abhivairavan.com", password: getEnv("KOLATHUR_PASSWORD"), role: "branch", branchName: "Kolathur" },
        { email: "velacherry@abhivairavan.com", password: getEnv("VELACHERRY_PASSWORD"), role: "branch", branchName: "Velacherry" },
        { email: "kodambakkam@abhivairavan.com", password: getEnv("KODAMBAKKAM_PASSWORD"), role: "branch", branchName: "Kodambakkam" },
    ];

    try {
        const { email, password } = await req.json();

        // 🔍 DIAGNOSTIC LOG (Check Vercel Logs for this)
        console.log("--- Login Diagnostic ---");
        console.log("Input Email:", email);
        console.log("Keys available in process.env:", Object.keys(process.env).filter(k => k.includes("PASSWORD") || k.includes("SECRET")));

        const user = VALID_USERS.find(
            (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password.trim()
        );

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = await signJWT({
            email: user.email,
            role: user.role as "admin" | "branch",
            branchName: user.branchName,
        });

        const response = NextResponse.json({ success: true, role: user.role });

        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
