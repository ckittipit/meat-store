import { NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assert-admin'
import {
    getAdminBackendConfig,
    getAdminHeaders,
} from '@/lib/admin/admin-backend'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await assertAdmin()

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { baseUrl } = getAdminBackendConfig()

    const res = await fetch(`${baseUrl}/products/admin/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(body),
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
}
