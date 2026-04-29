'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import type { Product, ProductVariant } from '@/types/product'
import type { Order } from '@/types/order'

const orderSchema = z.object({
    productVariantId: z.string().min(1, 'กรุณาเลือกขนาดสินค้า'),
    quantity: z.coerce.number().int().min(1, 'จำนวนต้องมากกว่า 0'),
    customerName: z.string().min(2, 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร'),
    customerPhone: z
        .string()
        .min(9, 'กรุณากรอกเบอร์โทรให้ถูกต้อง')
        .max(11, 'เบอร์โทรยาวเกินไป'),
    customerAddress: z.string().min(3, 'กรุณากรอกที่อยู่ให้ครบถ้วน'),
})

type OrderFormValues = z.infer<typeof orderSchema>

type OrderFormProps = {
    product: Product
}

export function OrderForm({ product }: OrderFormProps) {
    const defaultVariant = product.variants[0]

    const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
    const [submitError, setSubmitError] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            productVariantId: defaultVariant?.id ?? '',
            quantity: 1,
            customerName: '',
            customerPhone: '',
            customerAddress: '',
        },
    })

    const selectedVariantId = watch('productVariantId')
    const quantity = watch('quantity') || 1

    const selectedVariant = useMemo<ProductVariant | undefined>(() => {
        return product.variants.find(
            (variant) => variant.id === selectedVariantId,
        )
    }, [product.variants, selectedVariantId])

    const totalAmount = useMemo(() => {
        return (selectedVariant?.price ?? 0) * Number(quantity || 0)
    }, [selectedVariant?.price, quantity])

    async function onSubmit(values: OrderFormValues) {
        setSubmitError('')
        setCreatedOrder(null)

        try {
            const res = await api.post<Order>('/orders', {
                productId: product.id,
                productVariantId: values.productVariantId,
                quantity: values.quantity,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                customerAddress: values.customerAddress,
            })

            setCreatedOrder(res.data)
            reset({
                productVariantId: defaultVariant?.id ?? '',
                quantity: 1,
                customerName: '',
                customerPhone: '',
                customerAddress: '',
            })
        } catch {
            setSubmitError(
                'ยังไม่สามารถสั่งซื้อได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง',
            )
        }
    }

    if (product.variants.length === 0) {
        return (
            <div className="mt-6 rounded-3xl border border-[#f1e4d6] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-[#2f2a25]">
                    สินค้านี้ยังไม่มีขนาดให้เลือก
                </h2>
                <p className="mt-2 text-sm text-[#6f6258]">
                    กรุณากลับมาใหม่ภายหลัง
                </p>
            </div>
        )
    }

    return (
        <div className="mt-6 rounded-3xl border border-[#f1e4d6] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#2f2a25]">
                กรอกข้อมูลสั่งซื้อ
            </h2>
            <p className="mt-2 text-sm text-[#6f6258]">
                ไม่ต้องสมัครสมาชิกก็สั่งซื้อได้ กรอกข้อมูลสำหรับจัดส่งสินค้า
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                    <label className="text-sm font-medium text-[#2f2a25]">
                        เลือกขนาด
                    </label>

                    <input type="hidden" {...register('productVariantId')} />

                    <div className="mt-2 grid grid-cols-3 gap-3">
                        {product.variants.map((variant) => {
                            const isSelected = selectedVariantId === variant.id

                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() =>
                                        setValue('productVariantId', variant.id)
                                    }
                                    className={[
                                        'rounded-2xl border px-4 py-3 text-left transition',
                                        isSelected
                                            ? 'border-[#ffd8b5] bg-[#fff7e8] ring-4 ring-[#ffd8b5]/30'
                                            : 'border-[#f1e4d6] bg-white hover:bg-[#fffdf9]',
                                    ].join(' ')}
                                >
                                    <p className="font-semibold text-[#2f2a25]">
                                        {variant.label}
                                    </p>
                                    <p className="mt-1 text-sm text-[#8b5e3c]">
                                        {variant.price.toLocaleString('th-TH')}{' '}
                                        บาท
                                    </p>
                                </button>
                            )
                        })}
                    </div>

                    {errors.productVariantId && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.productVariantId.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-[#2f2a25]">
                        จำนวน
                    </label>
                    <input
                        type="number"
                        min={1}
                        className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                        {...register('quantity')}
                    />
                    {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.quantity.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-[#2f2a25]">
                        ชื่อผู้รับ
                    </label>
                    <input
                        className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                        placeholder="เช่น คุณนัท"
                        {...register('customerName')}
                    />
                    {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.customerName.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-[#2f2a25]">
                        เบอร์โทรศัพท์
                    </label>
                    <input
                        className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                        placeholder="เช่น 0812345678"
                        {...register('customerPhone')}
                    />
                    {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.customerPhone.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-[#2f2a25]">
                        ที่อยู่จัดส่ง
                    </label>
                    <textarea
                        rows={4}
                        className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] px-4 py-3 outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30"
                        placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                        {...register('customerAddress')}
                    />
                    {errors.customerAddress && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.customerAddress.message}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl bg-[#fff7e8] px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-[#6f6258]">
                            {selectedVariant
                                ? `${selectedVariant.label} x ${quantity || 0}`
                                : 'ยอดรวม'}
                        </span>
                        <span className="text-xl font-bold text-[#8b5e3c]">
                            {totalAmount.toLocaleString('th-TH')} บาท
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-[#ffd8b5] px-6 py-3 font-semibold text-[#5a351d] shadow-sm transition hover:bg-[#ffc99c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'กำลังสั่งซื้อ...' : 'สั่งซื้อ'}
                </button>

                {submitError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                    </div>
                )}

                {createdOrder && (
                    <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-800">
                        <p className="font-semibold">สั่งซื้อสำเร็จ</p>

                        {createdOrder.items.map((item) => (
                            <p key={item.id} className="mt-1">
                                {item.productName} {item.variantLabel} x{' '}
                                {item.quantity}
                            </p>
                        ))}

                        <p className="mt-1">{createdOrder.deliveryText}</p>

                        <p className="mt-1">
                            ยอดรวม{' '}
                            {createdOrder.totalAmount.toLocaleString('th-TH')}{' '}
                            บาท
                        </p>
                    </div>
                )}
            </form>
        </div>
    )
}
