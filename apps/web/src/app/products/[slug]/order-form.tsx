'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import type { Product } from '@/types/product'
import type { Order } from '@/types/order'

const orderSchema = z.object({
    quantity: z.number().int().min(1, 'จำนวนต้องมากกว่า 0'),
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
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
    const [submitError, setSubmitError] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            quantity: 1,
            customerName: '',
            customerPhone: '',
            customerAddress: '',
        },
    })

    const quantity = watch('quantity') || 1

    const totalAmount = useMemo(() => {
        return product.price * Number(quantity || 0)
    }, [product.price, quantity])

    async function onSubmit(values: OrderFormValues) {
        setSubmitError('')
        setCreatedOrder(null)

        try {
            const res = await api.post<Order>('/orders', {
                productId: product.id,
                quantity: values.quantity,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                customerAddress: values.customerAddress,
            })

            setCreatedOrder(res.data)
            reset({
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
                        <span className="text-sm text-[#6f6258]">ยอดรวม</span>
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
