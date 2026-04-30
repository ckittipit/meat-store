import { NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assert-admin'
import {
    getAdminBackendConfig,
    getAdminHeaders,
} from '@/lib/admin/admin-backend'

export async function POST(request: Request) {
    const session = await assertAdmin()

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const { baseUrl } = getAdminBackendConfig()

    const res = await fetch(`${baseUrl}/products/admin/upload-image`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: formData,
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
}
