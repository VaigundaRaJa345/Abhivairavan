import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "BRANCH";
    branchName?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "BRANCH";
      branchName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "BRANCH";
    branchName?: string;
  }
}
