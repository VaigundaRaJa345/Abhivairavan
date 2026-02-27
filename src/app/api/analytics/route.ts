import { getAuthUser } from "@/lib/auth";
import { getRetailEntriesRaw } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const rawRows = await getRetailEntriesRaw();

        // Map the 2D array into an array of clean JSON objects
        const formattedData = rawRows.map((row) => ({
            timestamp: row[0] || "",
            date: row[1] || "",
            branch: row[2] || "",
            walkins: parseInt(row[3]) || 0,
            sales: parseFloat(row[4]) || 0,
            source: row[5] || "",
            brand: row[6] || "",
        }));

        return NextResponse.json(formattedData);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
