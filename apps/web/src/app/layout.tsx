import type { Metadata } from 'next'
import './globals.css'

export const metadat: Metadata = {
    title: 'Meat Store',
    description: 'ระบบสั่งเนื้อทอดและเนื้อหมักออนไลน์',
    manifest: '/manifest.webmanifest',
    themeColor: '#ffd8b5',
    appleWebApp: {
        capable: true,
        title: 'Meat Admin',
        statusBarStyle: 'default',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="th">
            <body>{children}</body>
        </html>
    )
}
