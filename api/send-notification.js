// Serverless функция для отправки OneSignal уведомлений
export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { userIds, title, message, data } = req.body
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  // Используем переменные окружения
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY
  
  console.log('Environment check:', {
    hasAppId: !!ONESIGNAL_APP_ID,
    hasApiKey: !!ONESIGNAL_REST_API_KEY,
    appIdLength: ONESIGNAL_APP_ID?.length,
    apiKeyLength: ONESIGNAL_REST_API_KEY?.length
  })
  
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    return res.status(200).json({
      success: true,
      data: { id: `env_fallback_${Date.now()}`, recipients: 0 },
      warning: 'Environment variables not configured'
    })
  }
  
  try {
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, ru: title },
      contents: { en: message, ru: message },
      web_url: 'https://asia-sib.web.app'
    }
    
    // Если указаны конкретные пользователи, отправляем им
    if (userIds && userIds.length > 0) {
      notificationData.include_external_user_ids = userIds
      console.log('Sending to specific users:', userIds)
    } else {
      // Иначе отправляем всем подписанным
      notificationData.included_segments = ['Subscribed Users']
      console.log('Sending to all subscribed users')
    }
    
    if (data) {
      notificationData.data = data
    }
    
    console.log('Sending to OneSignal:', { app_id: ONESIGNAL_APP_ID, title })
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(notificationData)
    })
    
    const responseText = await response.text()
    console.log('OneSignal response:', response.status, responseText)
    
    if (response.ok) {
      const responseData = JSON.parse(responseText)
      console.log('✅ OneSignal success:', responseData.id)
      return res.status(200).json({ success: true, data: responseData })
    } else {
      console.warn('⚠️ OneSignal error:', response.status, responseText)
      return res.status(200).json({ 
        success: true, 
        data: { id: `api_fallback_${Date.now()}`, recipients: 0 },
        warning: 'OneSignal API error',
        details: responseText
      })
    }
  } catch (error) {
    console.error('❌ Server error:', error)
    return res.status(200).json({ 
      success: true,
      data: { id: `error_fallback_${Date.now()}`, recipients: 0 },
      warning: 'Server error',
      details: error.message
    })
  }
}