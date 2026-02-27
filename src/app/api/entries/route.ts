import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { appendRetailEntry, getRetailEntries } from "@/lib/google-sheets";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    try {
        await appendRetailEntry(data);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to append to Google Sheets" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const entries = await getRetailEntries();
        return NextResponse.json(entries);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch from Google Sheets" }, { status: 500 });
    }
}
