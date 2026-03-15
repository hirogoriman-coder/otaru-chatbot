export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages, lang } = req.body;
  const systemPrompts = {
    en: `You are a friendly, knowledgeable travel guide for Otaru, Hokkaido, Japan. Help tourists with sightseeing (Otaru Canal, Sakaimachi Street, Tenguyama, Music Box Museum, Nikka Whisky Distillery), food (sushi, sea urchin, herring, LeTAO cheesecake, ramen, local sake), transport (JR from Sapporo 30-35min, walking, rental bike, taxi), and shopping (glass crafts, music boxes, Shiroi Koibito). Keep answers warm, concise, practical. Reply in English.`,
    zh: `你是日本北海道小樽友好专业的旅行向导。帮助游客了解景点（小樽运河、堺町通、天狗山、音乐盒博物馆、余市威士忌酒厂）、美食（寿司、海胆、鲱鱼、LeTAO奶酪蛋糕、拉面）、交通（从札幌JR约30-35分钟）、购物（玻璃工艺品、音乐盒、白色恋人）。回答温暖简洁实用。请用中文回答。`,
    ko: `당신은 일본 홋카이도 오타루의 친절하고 전문적인 여행 가이드입니다. 관광명소(오타루 운하, 사카이마치 거리, 텐구야마, 오르골당, 닛카 위스키), 음식(스시, 성게, 르타오 치즈케이크, 라멘), 교통(삿포로에서 JR 30-35분), 쇼핑(유리공예, 오르골, 시로이 코이비토)을 안내하세요. 따뜻하고 간결하게. 한국어로 답변해 주세요.`
  };
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompts[lang] || systemPrompts.en,
        messages: messages
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }
    res.status(200).json({ text: data.content?.[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
