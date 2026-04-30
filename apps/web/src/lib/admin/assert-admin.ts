import { auth } from '@/auth'

const adminEmails =
    process.env.ADMIN_EMAILS?.split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean) ?? []

export async function assertAdmin() {
    const session = await auth()
    const email = session?.user?.email?.toLowerCase()

    if (!email || !adminEmails.includes(email)) return null

    return session
}
