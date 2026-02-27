import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-for-development-only"
);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;
    const { pathname } = req.nextUrl;

    // Public paths
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
        if (token && pathname === "/login") {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
    }

    // Protected paths
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        // RBAC: Admin only paths (if any specific ones exist, but usually it's conditional UI)
        // For now, let's just ensure they are logged in.
        // The specific APIs handle granular role checks.

        return NextResponse.next();
    } catch {
        // Invalid token
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("auth_token");
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
