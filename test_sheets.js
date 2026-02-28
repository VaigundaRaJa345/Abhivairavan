require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testConnection() {
    console.log("--- Google Sheets Connection Test ---");

    const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!rawJson) {
        console.error("❌ ERROR: GOOGLE_SERVICE_ACCOUNT_JSON is not defined in .env.local");
        return;
    }

    if (rawJson.includes("...")) {
        console.error("❌ ERROR: Your GOOGLE_SERVICE_ACCOUNT_JSON still contains the '...' placeholder.");
        console.log("👉 Please open your service account .json file and copy the REAL content into .env.local");
        return;
    }

    try {
        const sanitizedJson = rawJson.trim().replace(/^['"]|['"]$/g, "");
        const serviceAccount = JSON.parse(sanitizedJson);
        console.log("✅ JSON format is valid.");
        console.log(`📡 Attempting to connect as: ${serviceAccount.client_email}`);

        const auth = new google.auth.JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        console.log(`📊 Fetching sheet metadata for ID: ${sheetId}`);
        const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        console.log(`✅ Success! Spreadsheet Title: "${res.data.properties.title}"`);
        console.log("\n🚀 Your configuration is correct and the sheet is shared properly.");

    } catch (err) {
        console.error("\n❌ CONNECTION FAILED!");
        console.error("Error Details:", err.message);

        if (err.message.includes("403") || err.message.includes("not found")) {
            console.log("\n👉 FIX: Ensure you have SHARED your Google Sheet with the service account email above.");
        } else if (err.message.includes("401") || err.message.includes("key")) {
            console.log("\n👉 FIX: Your private_key or client_email might be corrupted. Check your .env.local file.");
        }
    }
}

testConnection();
