export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'ANTHROPIC_API_KEY not set'
      });
    }

    // Use native fetch instead of SDK
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say "API working" in 2 words' }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'API error',
        type: data.error?.type,
        status: response.status,
        keyLength: apiKey.length
      });
    }

    const text = data.content?.[0]?.text || 'No response';

    return res.json({
      success: true,
      apiResponse: text,
      model: 'claude-3-5-sonnet-20241022',
      keyLength: apiKey.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      type: error.constructor.name
    });
  }
}
