import type { Metadata } from 'next'
import './globals.css'

export const metadat: Metadata = {
    title: 'Meat Store',
    description: 'ระบบสั่งเนื้อทอดและเนื้อหมักออนไลน์',
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
