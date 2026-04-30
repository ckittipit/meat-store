import Link from 'next/link'
import { auth, signOut } from '@/auth'

export async function AdminHeader() {
    const session = await auth()

    return (
        <div className="mb-6 rounded-3xl border border-[#f1e4d6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#8b5e3c]">
                        Meat Store Admin
                    </p>
                    <p className="mt-1 text-sm text-[#6f6258]">
                        Logged in as{' '}
                        <span className="font-semibold text-[#2f2a25]">
                            {session?.user?.email}
                        </span>
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <nav className="flex rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] p-1">
                        <Link
                            href="/admin/orders"
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#fff7e8]"
                        >
                            Orders
                        </Link>

                        <Link
                            href="/admin/products"
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#fff7e8]"
                        >
                            Products
                        </Link>
                    </nav>

                    <form
                        action={async () => {
                            'use server'

                            await signOut({
                                redirectTo: '/login',
                            })
                        }}
                    >
                        <button
                            type="submit"
                            className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-3 text-sm font-semibold text-[#8b5e3c] shadow-sm transition hover:bg-[#fff7e8]"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
