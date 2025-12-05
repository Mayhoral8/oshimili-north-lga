import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/login/`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // console.log(credentials);
          const user = await response.json();

          // const decoded
          // console.log(credentials);

          if (response.ok && user) {
            console.log(user);
            return user;
          } else {
            // console.log(user);
            throw new Error(
              user?.error || "Invalid login credentials"
            );
          }
        } catch (error) {
          console.error("error", response);
          console.error(error.message);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt", // Storing session as a JWT
    maxAge: 6 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to token
      if (user) {
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Make token data available in session
      session.user = {
        ...session.user,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        role: token.role,
      };
      return session;
    },
  },
});
