import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsInstance() {
    const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!rawJson || rawJson.includes("...")) {
        throw new Error(
            "CRITICAL: GOOGLE_SERVICE_ACCOUNT_JSON is missing or contains placeholders ('...'). " +
            "Please paste your real Google Service Account JSON into your environment variables."
        );
    }

    try {
        // Handle cases where the JSON might be wrapped in single or double quotes from the env file
        const sanitizedJson = rawJson.trim().replace(/^['"]|['"]$/g, "");
        const serviceAccount = JSON.parse(sanitizedJson);

        const auth = new google.auth.JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: SCOPES,
        });

        return google.sheets({ version: "v4", auth });
    } catch (err) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", err);
        throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON format. Ensure it is valid JSON.");
    }
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
