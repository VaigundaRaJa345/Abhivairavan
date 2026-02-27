# Abhivairavan RetailOS - Setup Guide (Strict Mode)

This application uses a custom JWT-based authentication system and integrates directly with the Google Sheets API.

## 1. Google Cloud Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Sheets API**.
3. Create a **Service Account** and download its **JSON** key file.
4. **IMPORTANT**: Share your Google Sheet with the `client_email` found in your JSON file (give it **Editor** access).

## 2. Environment Variables (.env.local)
Copy the entire contents of your Service Account JSON file into `GOOGLE_SERVICE_ACCOUNT_JSON`.

```env
JWT_SECRET="generate-a-long-random-string"
GOOGLE_SHEET_ID="your-spreadsheet-id"

# The entire JSON content of your service account key file
GOOGLE_SERVICE_ACCOUNT_JSON='{"type": "service_account", ...}'

# Passwords
ADMIN_PASSWORD="your-admin-password"
KOLATHUR_PASSWORD="your-branch-password"
VELACHERRY_PASSWORD="your-branch-password"
KODAMBAKKAM_PASSWORD="your-branch-password"
```

## 3. Google Sheet Schema
The sheet **must** have a tab named `Sheet1` with the following columns:
A: Timestamp | B: Date | C: Branch Name | D: Walk-ins | E: Sales (INR) | F: Source | G: Top Brand

## 4. Development & Deployment
1. `npm install`
2. `npm run dev`
3. Deploy to Vercel and ensure all environment variables are set correctly in the dashboard.
