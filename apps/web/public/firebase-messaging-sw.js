importScripts(
    'https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js',
)
importScripts(
    'https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js',
)

firebase.initializeApp({
    apiKey: 'AIzaSyCkMkxSE8v7w0pI8577VwkbmIF5fwkfFVk',
    authDomain: 'meat-store-62202.firebaseapp.com',
    projectId: 'meat-store-62202',
    messagingSenderId: '839991209957',
    appId: '1:839991209957:web:fc47bbb914321945e0490c',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'Meat Store'
    const options = {
        body: payload.notification?.body || 'มีการแจ้งเตือนใหม่',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        data: payload.data || {},
    }

    self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const url = event.notification.data?.url || '/admin/orders'

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus()
                        client.navigate(url)
                        return
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(url)
                }
            }),
    )
})
