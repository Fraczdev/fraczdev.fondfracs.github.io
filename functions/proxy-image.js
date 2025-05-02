const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const url = event.queryStringParameters.url;
  if (!url || !/^https:\/\/i\.scdn\.co\//.test(url)) {
    return {
      statusCode: 400,
      body: 'Invalid or missing URL'
    };
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Image fetch failed');
    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: 'Proxy error'
    };
  }
};
