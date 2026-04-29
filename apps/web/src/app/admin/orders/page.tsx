'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Order, OrderStatus } from '@/types/order'

const orderStatuses: OrderStatus[] = [
    'NEW',
    'PREPARING',
    'DELIVERING',
    'DONE',
    'CANCELLED',
]

const statusLabels: Record<OrderStatus, string> = {
    NEW: 'ออร์เดอร์ใหม่',
    PREPARING: 'กำลังเตรียม',
    DELIVERING: 'กำลังจัดส่ง',
    DONE: 'จัดส่งแล้ว',
    CANCELLED: 'ยกเลิก',
}

const statusClassNames: Record<OrderStatus, string> = {
    NEW: 'bg-[#fff0b8] text-[#7a5b00]',
    PREPARING: 'bg-[#ffd8b5] text-[#8b4a1f]',
    DELIVERING: 'bg-[#d9f2df] text-[#3f7a4a]',
    DONE: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700',
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Bangkok',
    }).format(new Date(value))
}

function formatMoney(value: number) {
    return value.toLocaleString('th-TH')
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

    const summary = useMemo(() => {
        return {
            total: orders.length,
            newOrders: orders.filter((order) => order.status === 'NEW').length,
            preparing: orders.filter((order) => order.status === 'PREPARING')
                .length,
            delivering: orders.filter((order) => order.status === 'DELIVERING')
                .length,
        }
    }, [orders])

    async function loadOrders(options?: { showLoading?: boolean }) {
        const showLoading = options?.showLoading ?? true

        if (showLoading) setIsLoading(true)

        setLoadError('')

        try {
            const res = await api.get<Order[]>('/orders/admin')
            setOrders(res.data)
        } catch {
            setLoadError('โหลดรายการออร์เดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsLoading(false)
        }
    }

    async function updateOrderStatus(orderId: string, status: OrderStatus) {
        setUpdatingOrderId(orderId)

        try {
            const res = await api.patch<Order>(
                `/orders/admin/${orderId}/status`,
                {
                    status,
                },
            )

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? res.data : order,
                ),
            )
        } catch {
            alert('อัพเดทสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    useEffect(() => {
        let ignore = false

        async function loadInitialOrders() {
            try {
                const res = await api.get<Order[]>('/orders/admin')

                if (!ignore) setOrders(res.data)
            } catch {
                if (!ignore)
                    setLoadError(
                        'โหลดรายการออร์เดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
                    )
            }
        }

        loadInitialOrders()

        return () => {
            ignore = true
        }
    }, [])

    return (
        <main className="min-h-screen bg-[#fffdf9]">
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#8b5e3c]">
                            Admin / Orders
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#2f2a25]">
                            รายการที่ต้องจัดส่ง
                        </h1>

                        <p className="mt-3 max-w-2xl text-[#6f6258]">
                            ดูข้อมูลลูกค้า รายการสินค้า รอบจัดส่ง
                            และอัปเดตสถานะของแต่ละออเดอร์
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadOrders({ showLoading: true })}
                        disabled={isLoading}
                        className="rounded-2xl border border-[#f1e4d6] bg-white px-5 py-3 font-semibold text-[#8b5e3c] shadow-sm transition hover:bg-[#fff7e8] disabled:opacity-60"
                    >
                        {isLoading ? 'กำลังโหลด...' : 'Refresh'}
                    </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                    <div className="rounded-3xl border border-[#f1e4d6] bg-white p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">ทั้งหมด</p>
                        <p className="mt-2 text-3xl font-bold text-[#2f2a25]">
                            {summary.total}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-[#fff0b8]/50 p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">ออเดอร์ใหม่</p>
                        <p className="mt-2 text-3xl font-bold text-[#7a5b00]">
                            {summary.newOrders}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-[#ffd8b5]/50 p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">กำลังเตรียม</p>
                        <p className="mt-2 text-3xl font-bold text-[#8b4a1f]">
                            {summary.preparing}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#f1e4d6] bg-[#d9f2df]/70 p-5 shadow-sm">
                        <p className="text-sm text-[#6f6258]">กำลังจัดส่ง</p>
                        <p className="mt-2 text-3xl font-bold text-[#3f7a4a]">
                            {summary.delivering}
                        </p>
                    </div>
                </div>

                {loadError && (
                    <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {loadError}
                    </div>
                )}

                {isLoading ? (
                    <div className="mt-8 rounded-3xl border border-[#f1e4d6] bg-white p-10 text-center shadow-sm">
                        <p className="text-[#6f6258]">
                            กำลังโหลดรายการออเดอร์...
                        </p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-[#f1e4d6] bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-[#2f2a25]">
                            ยังไม่มีออเดอร์
                        </h2>
                        <p className="mt-2 text-[#6f6258]">
                            เมื่อลูกค้าสั่งซื้อ รายการจะแสดงที่หน้านี้
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-5">
                        {orders.map((order) => (
                            <article
                                key={order.id}
                                className="overflow-hidden rounded-3xl border border-[#f1e4d6] bg-white shadow-sm"
                            >
                                <div className="flex flex-col gap-4 border-b border-[#f1e4d6] bg-[#fff7e8]/60 p-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-xl font-bold text-[#2f2a25]">
                                                {order.customerName}
                                            </h2>

                                            <span
                                                className={[
                                                    'rounded-full px-3 py-1 text-xs font-semibold',
                                                    statusClassNames[
                                                        order.status
                                                    ],
                                                ].join(' ')}
                                            >
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-[#6f6258]">
                                            สั่งเมื่อ{' '}
                                            {formatDateTime(order.createdAt)}
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#8b5e3c]">
                                            {order.deliveryText}
                                        </p>
                                    </div>

                                    <div className="min-w-[220px]">
                                        <label className="text-sm font-medium text-[#2f2a25]">
                                            อัปเดตสถานะ
                                        </label>

                                        <select
                                            value={order.status}
                                            disabled={
                                                updatingOrderId === order.id
                                            }
                                            onChange={(event) =>
                                                updateOrderStatus(
                                                    order.id,
                                                    event.target
                                                        .value as OrderStatus,
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-[#f1e4d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ffd8b5] focus:ring-4 focus:ring-[#ffd8b5]/30 disabled:opacity-60"
                                        >
                                            {orderStatuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {statusLabels[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.4fr]">
                                    <div className="rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] p-4">
                                        <h3 className="font-semibold text-[#2f2a25]">
                                            ข้อมูลลูกค้า
                                        </h3>

                                        <div className="mt-3 space-y-2 text-sm text-[#6f6258]">
                                            <p>
                                                <span className="font-medium text-[#2f2a25]">
                                                    ชื่อ:
                                                </span>{' '}
                                                {order.customerName}
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#2f2a25]">
                                                    เบอร์:
                                                </span>{' '}
                                                <a
                                                    href={`tel:${order.customerPhone}`}
                                                    className="font-medium text-[#8b5e3c] hover:underline"
                                                >
                                                    {order.customerPhone}
                                                </a>
                                            </p>

                                            <p>
                                                <span className="font-medium text-[#2f2a25]">
                                                    ที่อยู่:
                                                </span>{' '}
                                                {order.customerAddress}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#f1e4d6] bg-[#fffdf9] p-4">
                                        <h3 className="font-semibold text-[#2f2a25]">
                                            รายการสินค้า
                                        </h3>

                                        <div className="mt-3 overflow-hidden rounded-2xl border border-[#f1e4d6] bg-white">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-[#fff7e8] text-[#6f6258]">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">
                                                            สินค้า
                                                        </th>
                                                        <th className="px-4 py-3 font-medium">
                                                            ขนาด
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-medium">
                                                            จำนวน
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-medium">
                                                            ราคา
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-medium">
                                                            รวม
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-[#f1e4d6]">
                                                    {order.items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-3 text-[#2f2a25]">
                                                                {
                                                                    item.productName
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-[#6f6258]">
                                                                {
                                                                    item.variantLabel
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-[#6f6258]">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-[#6f6258]">
                                                                {formatMoney(
                                                                    item.unitPrice,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-[#8b5e3c]">
                                                                {formatMoney(
                                                                    item.subtotal,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>

                                                <tfoot className="bg-[#fff7e8]">
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="px-4 py-3 text-right font-semibold text-[#2f2a25]"
                                                        >
                                                            ยอดรวม
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-lg font-bold text-[#8b5e3c]">
                                                            {formatMoney(
                                                                order.totalAmount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
