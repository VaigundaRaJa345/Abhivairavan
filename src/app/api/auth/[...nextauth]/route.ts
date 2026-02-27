import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const users = [
    {
        id: "1",
        email: "admin@abhivairavan.com",
        password: "admin123",
        name: "Master Admin",
        role: "ADMIN" as const,
    },
    {
        id: "2",
        email: "kolathur@abhivairavan.com",
        password: "kolathur123",
        name: "Kolathur Branch",
        role: "BRANCH" as const,
        branchName: "Kolathur",
    },
    {
        id: "3",
        email: "velacherry@abhivairavan.com",
        password: "velacherry123",
        name: "Velacherry Branch",
        role: "BRANCH" as const,
        branchName: "Velacherry",
    },
    {
        id: "4",
        email: "kodambakkam@abhivairavan.com",
        password: "kodambakkam123",
        name: "Kodambakkam Branch",
        role: "BRANCH" as const,
        branchName: "Kodambakkam",
    },
];

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = users.find((u) => u.email === credentials.email);

                if (user && user.password === credentials.password) {
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        branchName: user.branchName,
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.branchName = user.branchName;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.branchName = token.branchName;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
