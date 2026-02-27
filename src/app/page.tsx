import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import BranchPortal from "@/components/BranchPortal";
import { getRetailEntriesRaw } from "@/lib/google-sheets";

export default async function Home() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Admin View
  if (user.role === "admin") {
    let data = [];
    try {
      const rawRows = await getRetailEntriesRaw();
      data = rawRows.map((row) => ({
        timestamp: row[0] || "",
        date: row[1] || "",
        branch: row[2] || "",
        walkins: parseInt(row[3]) || 0,
        sales: parseFloat(row[4]) || 0,
        source: row[5] || "",
        brand: row[6] || "",
      }));
    } catch (e) {
      console.error("Sheets API fetch error:", e);
      // Minimal fallback if needed
      data = [];
    }
    return <AdminDashboard data={data} />;
  }

  // Branch View
  if (user.role === "branch") {
    return <BranchPortal branchName={user.branchName || "Unknown"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <p className="text-slate-500">Access Denied: Unrecognized Role</p>
    </div>
  );
}
