import { logout } from "@/lib/auth";

export async function POST() {
    return logout();
}
