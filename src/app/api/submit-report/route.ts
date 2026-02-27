import { getAuthUser } from "@/lib/auth";
import { appendRetailEntry } from "@/lib/google-sheets";
import { NextResponse } from "next/server";
import { z } from "zod";

const ReportSchema = z.object({
    branch: z.string(),
    walkins: z.number().int().min(0),
    sales: z.number().min(0),
    source: z.enum(["Google Ads", "Meta Ads", "Walk-by", "Referral", "Other"]),
    brand: z.string(),
    date: z.string(),
});

export async function POST(req: Request) {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "branch") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = ReportSchema.parse(body);

        // Ensure branch matches the user's assigned branch
        if (validatedData.branch !== user.branchName) {
            return NextResponse.json({ error: "Branch mismatch" }, { status: 403 });
        }

        await appendRetailEntry({
            timestamp: new Date().toISOString(),
            date: validatedData.date,
            branchName: validatedData.branch,
            walkins: validatedData.walkins,
            sales: validatedData.sales,
            source: validatedData.source,
            topBrand: validatedData.brand,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors }, { status: 400 });
        }
        console.error("Submission error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
