import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET!,
        }),
        AppleProvider({
            clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_APPLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET || process.env.JWT_SECRET,
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    },
                };
            }
            return token;
        },
        async session({ session, token }) {
            
            session.user = token.user as any;
            (session as any).accessToken = token.accessToken;
            return session;
        },
        async signIn({ user, account, profile }) {
            
            return true;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
