import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-for-development-only"
);

export type AuthUser = {
    email: string;
    role: "admin" | "branch";
    branchName?: string;
};

export async function signJWT(payload: AuthUser) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as AuthUser;
    } catch {
        return null;
    }
}

export async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    return await verifyJWT(token);
}

export function logout() {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    return response;
}
