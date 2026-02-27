# Abhivairavan RetailOS - Setup Guide

This application uses the Google Sheets API to store and retrieve data. Follow these steps to set it up:

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Abhivairavan-RetailOS`.
3. Enable the **Google Sheets API**.

## 2. Create a Service Account
1. In the Google Cloud Console, go to **Credentials**.
2. Click **Create Credentials** > **Service Account**.
3. Name it `sheets-service` and click **Create and Continue**.
4. Grant the role **Editor** to the service account (optional but recommended for simplicity).
5. Once created, click on the service account email.
6. Go to the **Keys** tab and click **Add Key** > **Create New Key**.
7. Select **JSON** and download the file.

## 3. Set Up the Google Sheet
1. Create a new Google Sheet.
2. Name the first tab `Sheet1`.
3. Add the following headers in the first row (A1 to G1):
   `Timestamp`, `Date`, `Branch Name`, `Walk-ins`, `Sales`, `Source`, `Top Brand`
4. **IMPORTANT**: Share the Google Sheet with the service account email (the one from step 2) and give it **Editor** access.
5. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0`

## 4. Configure Environment Variables
Create or update your `.env.local` file with the following:

```env
# From the downloaded JSON key file
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="---BEGIN PRIVATE KEY---\n...\n---END PRIVATE KEY---\n"

# From the URL of your Google Sheet
GOOGLE_SHEET_ID="your-spreadsheet-id-from-url"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-long-string"
```

## 5. Deployment
When deploying to Vercel:
1. Copy all values from `.env.local` to the Vercel Project Settings > Environment Variables.
2. Ensure the `GOOGLE_PRIVATE_KEY` includes the `\n` characters exactly as they appear in the JSON file (but wrapped in quotes).
