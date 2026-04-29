export type ProductType = 'READY_TO_EAT' | 'RAW_MARINATED' | 'RAW_SUNDRIED'

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
}
