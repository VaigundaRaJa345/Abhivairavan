import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsInstance() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: SCOPES,
    });

    return google.sheets({ version: "v4", auth });
}

export type RetailEntry = {
    timestamp: string;
    date: string;
    branchName: string;
    walkins: number;
    revenue: number;
    source: string;
    topBrand: string;
};

export async function appendRetailEntry(entry: RetailEntry) {
    const sheets = await getSheetsInstance();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [
                [
                    entry.timestamp,
                    entry.date,
                    entry.branchName,
                    entry.walkins,
                    entry.revenue,
                    entry.source,
                    entry.topBrand,
                ],
            ],
        },
    });
}

export async function getRetailEntries(): Promise<RetailEntry[]> {
    const sheets = await getSheetsInstance();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A2:G", // Assuming row 1 is headers
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
        timestamp: row[0],
        date: row[1],
        branchName: row[2],
        walkins: parseInt(row[3]) || 0,
        revenue: parseFloat(row[4]) || 0,
        source: row[5],
        topBrand: row[6],
    }));
}
