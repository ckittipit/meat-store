import { AdminHeader } from './admin-header'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="bg-[#fffdf9] px-4 pt-6">
                <div className="mx-auto max-w-7xl">
                    <AdminHeader />
                </div>
            </div>
            {children}
        </>
    )
}
