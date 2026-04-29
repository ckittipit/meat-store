export type ProductType = 'READY_TO_EAT' | 'RAW_MARINATED' | 'RAW_SUNDRIED'

export type ProductSize = 'SIZE_100G' | 'SIZE_500G' | 'SIZE_1KG'

export type ProductVariant = {
    id: string
    productId: string
    size: ProductSize
    label: string
    grams: number
    price: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type Product = {
    id: string
    name: string
    slug: string
    description: string
    imageUrl: string
    price: number
    type: ProductType
    isActive: boolean
    createdAt: string
    updatedAt: string
    variants: ProductVariant[]
}
