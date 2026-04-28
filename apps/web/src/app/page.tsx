import Link from 'next/link'

export default function HomePage() {
    return (
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 text-center">
            <p className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
                Meat Store
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
                เนื้อทอดและเนื้อหมัก ส่งตามรอบ พร้อมรับออเดอร์ออนไลน์
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-600">
                ลูกค้าสามารถเลือกสินค้า กรอกข้อมูลจัดส่ง
                และระบบจะแจ้งรอบส่งให้อัตโนมัติ
            </p>
            <Link
                href="/products"
                className="mt-8 rounded-2xl bg-black px-6 py-3 font-semibold text-white"
            >
                ดูสินค้า
            </Link>
        </main>
    )
}
