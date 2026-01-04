// PWA уведомления через Service Worker и Vercel API
export async function sendNotification(
  userIds: string[], 
  title: string, 
  message: string,
  data?: any
) {
  console.log('🔔 Sending notification:', title, message, 'to:', userIds)

  try {
    // Отправляем только через сервер (OneSignal)
    await sendServerNotification(userIds, title, message, data)
    console.log('✅ Server notification sent')
  } catch (error) {
    console.error('❌ Server notification failed:', error)
    // НЕ отправляем локальные уведомления как fallback
    // чтобы избежать дублирования
  }
}

// Отправка через Vercel API (OneSignal)
export async function sendServerNotification(
  userIds: string[],
  title: string,
  message: string,
  data?: any
) {
  try {
    const response = await fetch('https://rinok.vercel.app/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds,
        title,
        message,
        data
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        console.log('✅ Server: OneSignal notification sent:', result)
        return result
      } else {
        console.warn('⚠️ Server: OneSignal failed:', result)
        throw new Error(result.error || 'OneSignal failed')
      }
    } else {
      const error = await response.json()
      console.error('❌ Server: HTTP error:', response.status, error)
      throw new Error(error.error || 'HTTP error')
    }
  } catch (error) {
    console.error('❌ Server: Network error:', error)
    throw error
  }
}

// Локальное PWA уведомление
export async function sendLocalNotification(
  title: string,
  message: string,
  userId?: string
) {
  try {
    // Проверяем поддержку Service Worker и уведомлений
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready
      
      // Отправляем уведомление через Service Worker
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          tag: userId || 'notification',
          data: {
            userId,
            url: '/',
            timestamp: Date.now()
          },
          actions: [
            {
              action: 'open',
              title: 'Открыть',
              icon: '/icon-192x192.png'
            }
          ]
        })
        
        console.log('✅ PWA: Service Worker notification sent')
        return
      }
    }
    
    // Fallback - обычные браузерные уведомления
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon-192x192.png',
          tag: userId || 'notification'
        })
        console.log('✅ PWA: Browser notification sent')
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/icon-192x192.png',
            tag: userId || 'notification'
          })
          console.log('✅ PWA: Browser notification sent after permission')
        }
      }
    }
  } catch (error) {
    console.error('❌ PWA: Error sending local notification:', error)
  }
}