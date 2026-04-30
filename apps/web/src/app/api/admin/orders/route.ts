import { NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assert-admin'
import {
    getAdminBackendConfig,
    getAdminHeaders,
} from '@/lib/admin/admin-backend'

export async function GET() {
    const session = await assertAdmin()

    if (!session)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { baseUrl } = getAdminBackendConfig()

    const res = await fetch(`${baseUrl}/orders/admin`, {
        headers: getAdminHeaders(),
        cache: 'no-store',
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
}
