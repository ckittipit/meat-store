import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{
        callbackUrl?: string
    }>
}) {
    const session = await auth()
    const { callbackUrl } = await searchParams

    if (session?.user) {
        redirect(callbackUrl || '/admin/orders')
    }

    return (
        <main className="min-h-screen bg-[#fffdf9]">
            <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
                <div className="rounded-3xl border border-[#f1e4d6] bg-white p-6 shadow-sm">
                    <div className="text-center">
                        <p className="mx-auto inline-flex rounded-full bg-[#fff7e8] px-4 py-2 text-sm font-medium text-[#8b5e3c]">
                            Meat Store Admin
                        </p>

                        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#2f2a25]">
                            เข้าสู่ระบบ
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-[#6f6258]">
                            ใช้ Google Account ที่ได้รับสิทธิ์ admin
                            เพื่อเข้าหน้าจัดการร้าน
                        </p>
                    </div>

                    <form
                        className="mt-6"
                        action={async () => {
                            'use server'

                            await signIn('google', {
                                redirectTo: callbackUrl || '/admin/orders',
                            })
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-[#ffd8b5] px-6 py-3 font-semibold text-[#5a351d] shadow-sm transition hover:bg-[#ffc99c]"
                        >
                            Login with Google
                        </button>
                    </form>

                    <p className="mt-4 text-center text-xs leading-5 text-[#6f6258]">
                        ถ้า login แล้วเข้าไม่ได้ ให้เช็คว่า email อยู่ใน
                        ADMIN_EMAILS หรือไม่
                    </p>
                </div>
            </section>
        </main>
    )
}
