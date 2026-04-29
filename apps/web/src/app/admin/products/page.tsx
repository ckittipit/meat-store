'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { getImageUrl } from '@/lib/image-url'
import type { Product, ProductSize, ProductType } from '@/types/product'

type ProductFormState = {
    id?: string
    name: string
    slug: string
    description: string
    imageUrl: string
    type: ProductType
    isActive: boolean
    price100g: number
    price500g: number
    price1kg: number
}

const emptyForm: ProductFormState = {
    name: '',
    slug: '',
    description: '',
    imageUrl: '/placeholder-product.svg',
    type: 'READY_TO_EAT',
    isActive: true,
    price100g: 0,
    price500g: 0,
    price1kg: 0,
}

const productTypeLabels: Record<ProductType, string> = {
    READY_TO_EAT: 'พร้อมทาน',
    RAW_MARINATED: 'เนื้อหมัก ไม่ทอด',
    RAW_SUNDRIED: 'เนื้อแดดเดียว ไม่ทอด',
}

const productSizes: {
    size: ProductSize
    label: string
    grams: number
    formKey: keyof Pick<
        ProductFormState,
        'price100g' | 'price500g' | 'price1kg'
    >
}[] = [
    {
        size: 'SIZE_100G',
        label: '100g',
        grams: 100,
        formKey: 'price100g',
    },
    {
        size: 'SIZE_500G',
        label: '500g',
        grams: 500,
        formKey: 'price500g',
    },
    {
        size: 'SIZE_1KG',
        label: '1kg',
        grams: 1000,
        formKey: 'price1kg',
    },
]

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

function getVariantPrice(product: Product, size: ProductSize) {
    return product.variants.find((variant) => variant.size === size)?.price ?? 0
}

function mapProductToForm(product: Product): ProductFormState {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.imageUrl,
        type: product.type,
        isActive: product.isActive,
        price100g: getVariantPrice(product, 'SIZE_100G'),
        price500g: getVariantPrice(product, 'SIZE_500G'),
        price1kg: getVariantPrice(product, 'SIZE_1KG'),
    }
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [form, setForm] = useState<ProductFormState>(emptyForm)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [saveError, setSaveError] = useState('')

    const isEditing = Boolean(form.id)

    const activeCount = useMemo(
        () => products.filter((product) => product.isActive).length,
        [products],
    )

    async function loadProducts(options?: { showLoading?: boolean }) {
        const showLoading = options?.showLoading ?? true

        if (showLoading) {
            setIsLoading(true)
        }

        setLoadError('')

        try {
            const res = await api.get<Product[]>('/products/admin/all')
            setProducts(res.data)
        } catch {
            setLoadError('โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        } finally {
            if (showLoading) {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        let ignore = false

        async function loadInitialProducts() {
            try {
                const res = await api.get<Product[]>('/products/admin/all')

                if (!ignore) {
                    setProducts(res.data)
                }
            } catch {
                if (!ignore) {
                    setLoadError('โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
                }
            }
        }

        loadInitialProducts()

        return () => {
            ignore = true
        }
    }, [])

    function updateForm<K extends keyof ProductFormState>(
        key: K,
        value: ProductFormState[K],
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    function startCreate() {
        setForm(emptyForm)
        setSaveError('')
    }

    function startEdit(product: Product) {
        setForm(mapProductToForm(product))
        setSaveError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function uploadImage(file: File) {
        setIsUploading(true)
        setSaveError('')

        try {
            const data = new FormData()
            data.append('file', file)

            const res = await api.post<{ imageUrl: string }>(
                '/products/admin/upload-image',
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            )

            updateForm('imageUrl', res.data.imageUrl)
        } catch {
            setSaveError(
                'อัปโหลดรูปไม่สำเร็จ รองรับเฉพาะ jpg, png, webp และไฟล์ไม่เกิน 2MB',
            )
        } finally {
            setIsUploading(false)
        }
    }

    async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setIsSaving(true)
        setSaveError('')

        const startingPrice = Number(form.price100g)

        const basePayload = {
            name: form.name,
            slug: form.slug,
            description: form.description,
            imageUrl: form.imageUrl,
            type: form.type,
            isActive: form.isActive,
            price: startingPrice,
        }

        const createPayload = {
            ...basePayload,
            variants: productSizes.map((item) => ({
                size: item.size,
                label: item.label,
                grams: item.grams,
                price: Number(form[item.formKey]),
                isActive: true,
            })),
        }

        const updatePayload = {
            ...basePayload,
            variants: productSizes.map((item) => ({
                size: item.size,
                price: Number(form[item.formKey]),
                isActive: true,
            })),
        }

        try {
            if (isEditing && form.id) {
                const res = await api.patch<Product>(
                    `/products/admin/${form.id}`,
                    updatePayload,
                )

                setProducts((prev) =>
                    prev.map((product) =>
                        product.id === form.id ? res.data : product,
                    ),
                )
            } else {
                const res = await api.post<Product>(
                    '/products/admin',
                    createPayload,
                )
                setProducts((prev) => [...prev, res.data])
                setForm(emptyForm)
            }
        } catch {
            setSaveError(
                'บันทึกสินค้าไม่สำเร็จ กรุณาเช็ค slug ซ้ำ หรือข้อมูลไม่ครบ',
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function toggleProductActive(product: Product) {
        try {
            const res = await api.patch<Product>(
                `/products/admin/${product.id}`,
                {
                    isActive: !product.isActive,
                },
            )

            setProducts((prev) =>
                prev.map((item) => (item.id === product.id ? res.data : item)),
            )
        } catch {
            alert('เปลี่ยนสถานะสินค้าไม่สำเร็จ')
        }
    }

    return (
        <main className="min-h-screen bg-[#fffdf9]">
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#8b5e3c]">
                            Admin / Products
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#2f2a25]">
                            จัดการสินค้า
                        </h1>

                        <p className="mt-3 max-w-2xl text-[#6f6258]">
                            เพิ่มสินค้าใหม่ แก้ไขข้อมูลสินค้า อัปโหลดรูป
                            และแก้ราคาตามขนาด
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadProducts({ showLoading: true })}
                        disabled={isLoading}
                        className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-3 font-semibold text-[#8b5e3c] shadow-sm transition hover:bg-[#fff7e8] disabled:opacity-60"
                    >
                        {isLoading ? 'กำลังโหลด...' : 'Refresh'}
                    </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-[#f1e4d6] bg-white p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">สินค้าทั้งหมด</p>
                        <p className="mt-2 text-3xl font-bold text-[#2f2a25]">
                            {products.length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-[#d9f2df]/70 p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">เปิดขาย</p>
                        <p className="mt-2 text-3xl font-bold text-[#3f7a4a]">
                            {activeCount}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-[#ffd8b5]/50 p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">ปิดขาย</p>
                        <p className="mt-2 text-3xl font-bold text-[#8b4a1f]">
                            {products.length - activeCount}
                        </p>
                    </div>
                </div>

                {loadError && (
                    <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {loadError}
                    </div>
                )}

                <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
                    <form
                        onSubmit={saveProduct}
                        className="h-fit rounded-3xl border border-[#f1e4d6] bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-[#2f2a25]">
                                {isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                            </h2>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={startCreate}
                                    className="text-sm font-medium text-[#8b5e3c] hover:underline"
                                >
                                    เพิ่มใหม่
                                </button>
                            )}
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#2f2a25]">
                                    รูปสินค้า
                                </label>

                                <div className="mt-2 overflow-hidden rounded-2xl border border-[#f1e4d6] bg-[#fff7e8]">
                                    <div className="relative aspect-video">
                                        {/* <Image
                                            src={getImageUrl(form.imageUrl)}
                                            alt={form.name || 'Product image'}
                                            fill
                                            className="object-cover"
                                        /> */}
                                        <img
                                            src={getImageUrl(form.imageUrl)}
                                            alt={form.name || 'Product image'}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    disabled={isUploading}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0]

                                        if (file) {
                                            uploadImage(file)
                                        }
                                    }}
                                    className="mt-3 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 text-sm"
                                />

                                <p className="mt-1 text-xs text-[#6f6258]">
                                    รองรับ jpg, png, webp ขนาดไม่เกิน 2MB
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[#2f2a25]">
                                    ชื่อสินค้า
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(event) => {
                                        const name = event.target.value
                                        updateForm('name', name)

                                        if (!isEditing) {
                                            updateForm('slug', slugify(name))
                                        }
                                    }}
                                    className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[#2f2a25]">
                                    Slug
                                </label>
                                <input
                                    value={form.slug}
                                    onChange={(event) =>
                                        updateForm('slug', event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                                    required
                                />
                                <p className="mt-1 text-xs text-[#6f6258]">
                                    ใช้ใน URL เช่น /products/fried-beef-ready
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[#2f2a25]">
                                    รายละเอียดสินค้า
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        updateForm(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                    className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[#2f2a25]">
                                    ประเภทสินค้า
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(event) =>
                                        updateForm(
                                            'type',
                                            event.target.value as ProductType,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                                >
                                    {Object.entries(productTypeLabels).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div className="rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] p-4">
                                <h3 className="font-semibold text-[#2f2a25]">
                                    ราคาตามขนาด
                                </h3>

                                <div className="mt-4 grid gap-3">
                                    {productSizes.map((item) => (
                                        <div key={item.size}>
                                            <label className="text-sm font-medium text-[#2f2a25]">
                                                {item.label}
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={form[item.formKey]}
                                                onChange={(event) =>
                                                    updateForm(
                                                        item.formKey,
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-white px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(event) =>
                                        updateForm(
                                            'isActive',
                                            event.target.checked,
                                        )
                                    }
                                />
                                <span className="text-sm font-medium text-[#2f2a25]">
                                    เปิดขายสินค้า
                                </span>
                            </label>

                            {saveError && (
                                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {saveError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="w-full rounded-2xl bg-[#ffd8b5] px-6 py-3 font-semibold text-[#5a351d] shadow-sm transition hover:bg-[#ffc99c] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving
                                    ? 'กำลังบันทึก...'
                                    : isEditing
                                      ? 'บันทึกการแก้ไข'
                                      : 'เพิ่มสินค้า'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        {products.length === 0 ? (
                            <div className="rounded-3xl border border-[#f1e4d6] bg-white p-10 text-center shadow-sm">
                                <h2 className="text-xl font-semibold text-[#2f2a25]">
                                    ยังไม่มีสินค้า
                                </h2>
                                <p className="mt-2 text-[#6f6258]">
                                    เพิ่มสินค้าใหม่จากฟอร์มด้านซ้าย
                                </p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <article
                                    key={product.id}
                                    className="overflow-hidden rounded-3xl border border-[#f1e4d6] bg-white shadow-sm"
                                >
                                    <div className="grid gap-4 p-4 md:grid-cols-[180px_1fr]">
                                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#fff7e8]">
                                            {/* {console.log(
                                                'product image src:',
                                                product.imageUrl,
                                                getImageUrl(product.imageUrl),
                                            )} */}
                                            {/* <Image
                                                src={getImageUrl(
                                                    product.imageUrl,
                                                )}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            /> */}
                                            <img
                                                src={getImageUrl(
                                                    product.imageUrl,
                                                )}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="text-xl font-bold text-[#2f2a25]">
                                                            {product.name}
                                                        </h2>

                                                        <span
                                                            className={[
                                                                'rounded-full px-3 py-1 text-xs font-semibold',
                                                                product.isActive
                                                                    ? 'bg-[#d9f2df] text-[#3f7a4a]'
                                                                    : 'bg-red-50 text-red-700',
                                                            ].join(' ')}
                                                        >
                                                            {product.isActive
                                                                ? 'เปิดขาย'
                                                                : 'ปิดขาย'}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-sm text-[#8b5e3c]">
                                                        {
                                                            productTypeLabels[
                                                                product.type
                                                            ]
                                                        }
                                                    </p>

                                                    <p className="mt-2 text-sm leading-6 text-[#6f6258]">
                                                        {product.description}
                                                    </p>

                                                    {/* <p className="mt-2 text-xs text-[#6f6258]">
                                                        /products/{product.slug}
                                                    </p> */}
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEdit(product)
                                                        }
                                                        className="rounded-2xl border border-[#f1e4d6] bg-white px-4 py-2 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#fff7e8]"
                                                    >
                                                        แก้ไข
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleProductActive(
                                                                product,
                                                            )
                                                        }
                                                        className="rounded-2xl border border-[#f1e4d6] bg-white px-4 py-2 text-sm font-semibold text-[#6f6258] transition hover:bg-[#fff7e8]"
                                                    >
                                                        {product.isActive
                                                            ? 'ปิดขาย'
                                                            : 'เปิดขาย'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                {product.variants.map(
                                                    (variant) => (
                                                        <div
                                                            key={variant.id}
                                                            className="rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3"
                                                        >
                                                            <p className="text-sm font-semibold text-[#2f2a25]">
                                                                {variant.label}
                                                            </p>
                                                            <p className="mt-1 text-lg font-bold text-[#8b5e3c]">
                                                                {variant.price.toLocaleString(
                                                                    'th-TH',
                                                                )}{' '}
                                                                บาท
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}
