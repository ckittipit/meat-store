export type DeliveryRound = 'MORNING' | 'AFTERNOON' | 'NEXT_DAY'

export type OrderStatus =
    | 'NEW'
    | 'PREPARING'
    | 'DELIVERING'
    | 'DONE'
    | 'CANCELLED'

export type OrderItem = {
    id: string
    orderId: string
    productId: string
    productVariantId: string
    productName: string
    variantLabel: string
    variantGrams: number
    quantity: number
    unitPrice: number
    subtotal: number
}

export type Order = {
    id: string
    customerName: string
    customerPhone: string
    customerAddress: string
    deliveryRound: DeliveryRound
    deliveryDate: string
    deliveryText: string
    status: OrderStatus
    totalAmount: number
    createdAt: string
    updatedAt: string
    items: OrderItem[]
}
