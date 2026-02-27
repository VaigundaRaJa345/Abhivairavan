import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import BranchPortal from "@/components/BranchPortal";
import { getRetailEntries } from "@/lib/google-sheets";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Admin View
  if (session.user.role === "ADMIN") {
    let data = [];
    try {
      data = await getRetailEntries();
    } catch (e) {
      console.error("Sheets API not configured yet:", e);
      // Fallback data for demonstration if API keys are missing
      data = [
        { timestamp: new Date().toISOString(), date: "2024-03-20", branchName: "Kolathur", walkins: 15, revenue: 45000, source: "Google Ads", topBrand: "Jaquar" },
        { timestamp: new Date().toISOString(), date: "2024-03-21", branchName: "Velacherry", walkins: 22, revenue: 120000, source: "Walk-by", topBrand: "Kohler" },
        { timestamp: new Date().toISOString(), date: "2024-03-22", branchName: "Kodambakkam", walkins: 18, revenue: 85000, source: "JustDial", topBrand: "Grohe" },
      ];
    }
    return <AdminDashboard data={data} />;
  }

  // Branch View
  return <BranchPortal branchName={session.user.branchName || "Unknown"} />;
}
