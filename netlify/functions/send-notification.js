exports.handler = async (event, context) => {
  // Разрешаем CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { title, message, userIds } = JSON.parse(event.body);

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic os_v2_app_c2yethytcraqxkodrps4jrnqytezm2d2kbkue7espzfysbnacvdpxc64asntat7t4z5aaqawgj67k4dvfmg4mzcgrpxyxcoemndbhgq'
      },
      body: JSON.stringify({
        app_id: '16b0499f-1314-410b-a9c3-8be5c4c5b0c4',
        headings: { ru: title, en: title },
        contents: { ru: message, en: message },
        include_external_user_ids: userIds,
        url: 'https://xn--80aabz6agll.xn--p1ai/',
        chrome_web_icon: 'https://xn--80aabz6agll.xn--p1ai/icon-192x192.png'
      })
    });

    const result = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, result })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};