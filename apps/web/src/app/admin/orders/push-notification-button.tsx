'use client'

import { getToken, onMessage } from 'firebase/messaging'
import { useEffect, useState } from 'react'
// import { api } from '@/lib/api'
import { adminApi } from '@/lib/admin-api'
import { getFirebaseMessaging } from '@/lib/firebase'

type PushStatus =
    | 'idle'
    | 'unsupported'
    | 'permission-denied'
    | 'enabled'
    | 'error'

export function PushNotificationButton() {
    const [status, setStatus] = useState<PushStatus>('idle')
    const [message, setMessage] = useState('')

    useEffect(() => {
        let unsubscribe: () => void | undefined

        async function setupForegroundListener() {
            const messaging = await getFirebaseMessaging()

            if (!messaging) return

            unsubscribe = onMessage(messaging, (payload) => {
                const title = payload.notification?.title || 'Meat Store'
                const body = payload.notification?.body || 'มีการแจ้งเตือนใหม่'

                if (Notification.permission === 'granted') {
                    new Notification(title, {
                        body,
                        icon: '/icons/icon-192.svg',
                    })
                }
            })
        }

        setupForegroundListener()

        return () => {
            unsubscribe?.()
        }
    }, [])

    async function enablePushNotification() {
        setMessage('')

        try {
            const messaging = await getFirebaseMessaging()

            if (!messaging) {
                setStatus('unsupported')
                setMessage(
                    'Browser นี้ยังไม่รองรับ push notification หรือยังไม่ได้เปิดแบบ PWA',
                )

                return
            }

            const permission = await Notification.requestPermission()

            if (permission !== 'granted') {
                setStatus('permission-denied')
                setMessage('ยังไม่ได้อณุญาต Notification')

                return
            }

            const registration = await navigator.serviceWorker.register(
                '/firebase-messaging-sw.js',
            )

            // รอให้ service worker ติดตั้งและ active จริงก่อน
            await navigator.serviceWorker.ready

            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            })

            if (!token) {
                setStatus('error')
                setMessage('ไม่สามารถสร้าง push token ได้')

                return
            }

            await adminApi.post('/notifications/admin-token', {
                token,
            })

            setStatus('enabled')
            setMessage('เปิด Push Notification แล้ว')
        } catch (error) {
            console.error(error)
            setStatus('error')
            setMessage('เปิด Push Notification ไม่สำเร็จ')
        }
    }

    return (
        <div className="rounded-2xl border border-[#f1e4d6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-semibold text-[#2f2a25]">
                        Push Notification
                    </p>
                    <p className="mt-1 text-sm text-[#6f6258]">
                        เปิดเพื่อรับแจ้งเตือนเมื่อมีออเดอร์ใหม่
                    </p>
                </div>

                <button
                    type="button"
                    onClick={enablePushNotification}
                    className="rounded-2xl bg-[#ffd8b5] px-5 py-3 font-semibold text-[#5a351d] shadow-sm transition hover:bg-[#ffc99c]"
                >
                    Enable Push
                </button>
            </div>

            {message && (
                <p
                    className={[
                        'mt-3 rounded-xl px-3 py-2 text-sm',
                        status === 'enabled'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700',
                    ].join(' ')}
                >
                    {message}
                </p>
            )}

            <p className="mt-3 text-xs leading-5 text-[#6f6258]">
                สำหรับ iPhone: เปิดเว็บด้วย Safari แล้ว Add to Home Screen
                จากนั้นเปิดแอปจาก Home Screen แล้วค่อยกด Enable Push
            </p>
        </div>
    )
}
