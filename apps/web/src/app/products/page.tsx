import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/image-url'
import type { Product } from '@/types/product'

async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        cache: 'no-store',
    })

    if (!res.ok) throw new Error('Failed to fetch products')

    return res.json()
}

function getProductTypeLabel(type: Product['type']) {
    switch (type) {
        case 'READY_TO_EAT':
            return 'พร้อมทาน'
        case 'RAW_MARINATED':
            return 'เนื้อหมัก ไม่ทอด'
        case 'RAW_SUNDRIED':
            return 'เนื้อแดดเดียว ไม่ทอด'
        default:
            return 'สินค้า'
    }
}

export default async function ProductPage() {
    const products = await getProducts()

    return (
        <main className="min-h-screen bg-[#fffdf9]">
            <section className="mx-auto max-w-6xl px-4 py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <Link
                            href="/"
                            className="text-sm font-medium text-[#8b5E3c] hover:text-[#5a351d]"
                        >
                            ← กลับหน้าแรก
                        </Link>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2f2a25]">
                            รายการสินค้า
                        </h1>
                        <p className="mt-3 max-w-2xl text-[#6f6258]">
                            เลือกเนื้อทอดพร้อมทาน
                            หรือเนื้อแบบไม่ทอดสำหรับนำไปทำเองที่บ้าน
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-3 text-sm text-[#8b5e3c] shadow-sm">
                        ก่อน 10:00 ส่งรอบเช้า / ก่อน 14:00 ส่งรอบบ่าย
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-[#f1e4d6] bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-[#2f2a25]">
                            ยังไม่มีสินค้าเปิดขาย
                        </h2>
                        <p className="mt-2 text-[#6f6258]">
                            กรุณากลับมาใหม่ภายหลัง
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                className="group overflow-hidden rounded-3xlx border border-[#f1e4d6] bg-white shadow-sm transition hover:translate-y-1 hover:shadow-md"
                            >
                                <div className="relative aspect-square overflow-hidden bg-[#fff7e8]">
                                    {/* <Image
                                        src={getImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        fill
                                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                    /> */}
                                    <img
                                        src={getImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="inline-flex rounded-full bg-[#d9f2df] px-3 py-1 text-xs font-medium text-[#4e7b57]">
                                        {getProductTypeLabel(product.type)}
                                    </div>
                                    <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-[#2f2a25]">
                                        {product.name}
                                    </h2>
                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6258]">
                                        {product.description}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="tetx-xl font-bold text-[#8b5e3c]">
                                            เริ่มต้น{' '}
                                            {product.price.toLocaleString(
                                                'th-TH',
                                            )}{' '}
                                            บาท
                                        </p>
                                        <span className="text-sm font-medium text-[#b9784f]">
                                            เลือก →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
