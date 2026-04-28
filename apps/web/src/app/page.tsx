import Link from 'next/link'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#fffdf9]">
            <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
                <div className="rounded-full border border-[#f1e4d6] bg-white px-5 py-2 text-sm font-medium text-[#8b5e3c] shadow-sm">
                    Meat Store
                </div>

                <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-[#2f2a25] md:text-6xl">
                    เนื้อทอดและเนื้อหมัก
                    <span className="block text-[#b9784f]">
                        ส่งไวตามรอบ พร้อมทานที่บ้าน
                    </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f6258]">
                    เลือกสินค้า กรอกข้อมูลจัดส่ง
                    แล้วระบบจะแจ้งรอบส่งให้อัตโนมัติ เหมาะทั้งมื้อเช้า
                    มื้อกลางวัน และเก็บไว้ทอดเองที่บ้าน
                </p>

                <div className="mt-8">
                    <Link
                        href="/products"
                        className="rounded-2xl bg-[#ffd8b5] px-7 py-3 font-semibold text-[#5a351d] shadow-sm transition hover:bg-[#ffc99c]"
                    >
                        ดูสินค้า
                    </Link>
                </div>

                <div className="mt-14 grid w-full gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-[#f1e4d6] bg-white p-6 text-left shadow-sm">
                        <div className="mb-4 h-12 w-12 rounded-2xl bg-[#ffd8b5]" />
                        <h2 className="font-semibold text-[#2f2a25]">
                            พร้อมทาน
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#6f6258]">
                            เนื้อทอดและเนื้อแดดเดียวทอด พร้อมเสิร์ฟทันที
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-white p-6 text-left shadow-sm">
                        <div className="mb-4 h-12 w-12 rounded-2xl bg-[#ffd6e7]" />
                        <h2 className="font-semibold text-[#2f2a25]">
                            ทอดเองที่บ้าน
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#6f6258]">
                            เนื้อหมักและเนื้อแดดเดียวแบบไม่ทอด เก็บง่าย
                            ทำทานเองได้
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-white p-6 text-left shadow-sm">
                        <div className="mb-4 h-12 w-12 rounded-2xl bg-[#d9f2df]" />
                        <h2 className="font-semibold text-[#2f2a25]">
                            ส่งตามรอบ
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#6f6258]">
                            ก่อน 10:00 ส่งรอบเช้า ก่อน 14:00 ส่งรอบบ่าย
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
