export function getImageUrl(imageUrl: string) {
    if (!imageUrl) return '/placeholder-product.svg'

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
        return imageUrl

    if (imageUrl.startsWith('/uploads'))
        return `${process.env.NEXT_PUBLIC_URL}${imageUrl}`

    return imageUrl
}
