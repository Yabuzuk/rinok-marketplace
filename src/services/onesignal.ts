// Чистая инициализация OneSignal
export async function initOneSignal() {
  console.log('🔔 OneSignal: Clean initialization')
}

// Подписка пользователя
export async function subscribeUser(userId: string) {
  window.OneSignalDeferred?.push(async function(OneSignal: any) {
    try {
      await OneSignal.Notifications.requestPermission()
      await OneSignal.login(userId)
      console.log('✅ OneSignal: User subscribed:', userId)
    } catch (error) {
      console.warn('⚠️ OneSignal: Subscription failed:', error)
    }
  })
}

// Отправка уведомления через сервер
export async function sendNotification(
  userIds: string[], 
  title: string, 
  message: string
) {
  console.log('🔔 OneSignal: Sending via server:', title, message)

  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds,
        title,
        message
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ OneSignal: Notification sent via server')
      return data
    } else {
      console.error('❌ Server failed:', response.status)
    }
  } catch (error) {
    console.error('❌ Server error:', error)
  }
}

declare global {
  interface Window {
    OneSignalDeferred: any[]
    Capacitor?: any
    subscribeUserToNotifications?: (userId: string, userRole: string) => Promise<void>
  }
}