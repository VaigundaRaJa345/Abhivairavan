import { signJWT } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // 🔍 AGGRESSIVE DIAGNOSTIC
    console.log("--- VERCEL ENV SCAN ---");
    console.log("Total ENV Keys:", Object.keys(process.env).length);
    console.log("Sample Keys:", Object.keys(process.env).slice(0, 5));
    console.log("Direct Check (ADMIN_PASSWORD):", process.env.ADMIN_PASSWORD ? "EXISTS" : "MISSING");
    console.log("Direct Check (JWT_SECRET):", process.env.JWT_SECRET ? "EXISTS" : "MISSING");

    const VALID_USERS = [
        { email: "admin@abhivairavan.com", password: (process.env.ADMIN_PASSWORD || "").trim(), role: "admin" },
        { email: "kolathur@abhivairavan.com", password: (process.env.KOLATHUR_PASSWORD || "").trim(), role: "branch", branchName: "Kolathur" },
        { email: "velacherry@abhivairavan.com", password: (process.env.VELACHERRY_PASSWORD || "").trim(), role: "branch", branchName: "Velacherry" },
        { email: "kodambakkam@abhivairavan.com", password: (process.env.KODAMBAKKAM_PASSWORD || "").trim(), role: "branch", branchName: "Kodambakkam" },
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
