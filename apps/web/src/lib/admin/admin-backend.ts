export function getAdminBackendConfig() {
    const baseUrl = process.env.ADMIN_BACKEND_API_URL
    const apiKey = process.env.ADMIN_BACKEND_API_KEY

    if (!baseUrl) throw new Error('ADMIN_BACKEND_API_URL is not configured')
    if (!apiKey) throw new Error('ADMIN_BACKEND_API_KEY is not configured')

    return {
        baseUrl,
        apiKey,
    }
}

export function getAdminHeaders(extraHeaders?: HeadersInit) {
    const { apiKey } = getAdminBackendConfig()

    return {
        ...extraHeaders,
        'x-admin-api-key': apiKey,
    }
}
