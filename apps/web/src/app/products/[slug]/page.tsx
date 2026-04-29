import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getImageUrl } from '@/lib/image-url'
import type { Product } from '@/types/product'
import { OrderForm } from './order-form'

async function getProduct(slug: string): Promise<Product | null> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
        {
            cache: 'no-store',
        },
    )

    if (res.status === 404) return null

    if (!res.ok) throw new Error('Failed to fetch product')

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

type ProductDetailPageProps = {
    params: Promise<{
        slug: string
    }>
}

export default async function ProductDetailPage({
    params,
}: ProductDetailPageProps) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) notFound()

    return (
        <main className="min-h-screen bg-[#fffdf9]">
            <section className="mx-auto max-w-6xl px-4 py-10">
                <Link
                    href="/products"
                    className="text-sm font-medium text-[#8b5e3c] hover:text-[#5a351d]"
                >
                    ← กลับไปดูสินค้า
                </Link>
                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl border border-[#f1e4d6] bg-white p-4 shadow-sm">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#fff7e8]">
                            <Image
                                src={getImageUrl(product.imageUrl)}
                                alt={product.name}
                                fill
                                priority
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="inline-flex rounded-full bg-[#d9f2df] px-4 py-2 text-sm font-medium text-[#4e7b57]">
                            {getProductTypeLabel(product.type)}
                        </div>
                        <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#2f2a25]">
                            {product.name}
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-[#6f6258]">
                            {product.description}
                        </p>
                        <p className="mt-6 text-3xl font-bold text-[#8b5e3c]">
                            เริ่มต้น {product.price.toLocaleString('th-TH')} บาท
                        </p>
                        <div className="mt-6 rounded-3xl border border-[#f1e4d6] bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-[#2f2a25]">
                                รอบจัดส่ง
                            </h2>
                            <div className="mt-3 grid gap-3 text-sm text-[#6f6258]">
                                <div className="rounded-2xl bg-[#fff7e8] px-4 py-3">
                                    สั่งก่อน 10:00 → ส่งภายใน 11:00 วันนี้
                                </div>
                                <div className="rounded-2xl bg-[#ffd6e7]/60 px-4 py-3">
                                    สั่งก่อน 14:00 → ส่งภายใน 15:00 วันนี้
                                </div>
                                <div className="rounded-2xl bg-[#d9f2df]/70 px-4 py-3">
                                    หลังจากนั้น → ส่งวันถัดไป
                                </div>
                            </div>
                        </div>
                        <OrderForm product={product} />
                    </div>
                </div>
            </section>
        </main>
    )
}
