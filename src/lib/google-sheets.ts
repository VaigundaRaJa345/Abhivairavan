import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsInstance() {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");

    const auth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: SCOPES,
    });

    return google.sheets({ version: "v4", auth });
}

export type RetailEntry = {
    timestamp: string;
    date: string;
    branchName: string;
    walkins: number;
    sales: number;
    source: string;
    topBrand: string;
};

export async function appendRetailEntry(entry: RetailEntry) {
    const sheets = await getSheetsInstance();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Strict Column Order:
    // A: Timestamp | B: Date | C: Branch Name | D: Walk-ins | E: Sales (INR) | F: Source | G: Top Brand
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
                    entry.sales,
                    entry.source,
                    entry.topBrand,
                ],
            ],
        },
    });
}

export async function getRetailEntriesRaw(): Promise<any[][]> {
    const sheets = await getSheetsInstance();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A2:G",
    });

    return response.data.values || [];
}
