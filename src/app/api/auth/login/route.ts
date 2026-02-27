import { signJWT } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const VALID_USERS = [
        { email: "admin@abhivairavan.com", password: process.env.ADMIN_PASSWORD, role: "admin" },
        { email: "kolathur@abhivairavan.com", password: process.env.KOLATHUR_PASSWORD, role: "branch", branchName: "Kolathur" },
        { email: "velacherry@abhivairavan.com", password: process.env.VELACHERRY_PASSWORD, role: "branch", branchName: "Velacherry" },
        { email: "kodambakkam@abhivairavan.com", password: process.env.KODAMBAKKAM_PASSWORD, role: "branch", branchName: "Kodambakkam" },
    ];

    try {
        const { email, password } = await req.json();

        // Diagnostic: Check if env vars are loaded (viewable in Vercel Logs)
        const missingVars = VALID_USERS.filter(u => !u.password).map(u => u.email);
        if (missingVars.length > 0) {
            console.error("CRITICAL: Environment variables missing for:", missingVars.join(", "));
        }

        const user = VALID_USERS.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
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
