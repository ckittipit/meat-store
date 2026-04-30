import { auth, signOut } from '@/auth'

export async function AdminHeader() {
    const session = await auth()

    return (
        <div className="mb-6 rounded-3xl border border-[#f1e4d6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#8b5e3c]">
                        Logged in as
                    </p>
                    <p className="mt-1 font-semibold text-[#2f2a25]">
                        {session?.user?.email}
                    </p>
                </div>

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
                        className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-3 font-semibold text-[#8b5e3c] shadow-sm transition hover:bg-[#fff7e8]"
                    >
                        Logout
                    </button>
                </form>
            </div>
        </div>
    )
}
