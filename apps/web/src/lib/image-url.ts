export function getImageUrl(imageUrl?: string | null) {
    if (!imageUrl) {
        return '/placeholder-product.svg'
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
    }

    if (imageUrl.startsWith('/uploads')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        if (!apiUrl) {
            return '/placeholder-product.svg'
        }

        return `${apiUrl}${imageUrl}`
    }

    if (imageUrl.startsWith('/')) {
        return imageUrl
    }

    return '/placeholder-product.svg'
}
