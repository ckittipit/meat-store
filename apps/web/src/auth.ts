import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const adminEmails =
    process.env.ADMIN_EMAILS?.split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean) ?? []

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        authorized({ auth: session, request }) {
            const pathname = request.nextUrl.pathname

            if (pathname.startsWith('/admin')) {
                const email = session?.user?.email?.toLowerCase()
                return Boolean(email && adminEmails.includes(email))
            }

            return true
        },

        session({ session }) {
            const email = session.user?.email?.toLowerCase()

            return {
                ...session,
                user: {
                    ...session.user,
                    role:
                        email && adminEmails.includes(email)
                            ? 'ADMIN'
                            : 'CUSTOMER',
                },
            }
        },
    },
    pages: {
        signIn: '/login',
    },
})
