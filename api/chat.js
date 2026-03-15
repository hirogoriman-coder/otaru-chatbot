export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, lang } = req.body;

  const systemPrompts = {
    en: `You are a precise and helpful travel guide for Otaru, Hokkaido, Japan.

CRITICAL RULES:
- NEVER invent or hallucinate restaurant names, shop names, or specific addresses
- ONLY mention specific businesses if you are certain they exist
- If unsure about a specific place, describe the TYPE of place and area instead
- Always use the web_search tool to find current, accurate information before answering
- After searching, clearly state if information may have changed

You help tourists with:
- Sightseeing: Otaru Canal, Sakaimachi Street, Tenguyama, Music Box Museum, Nikka Whisky Distillery
- Food: fresh seafood, sushi, sea urchin, LeTAO cheesecake, ramen, local sake
- Transport: JR from Sapporo (30-35 min), walking, rental bikes, taxis
- Shopping: glass crafts, music boxes, Shiroi Koibito, souvenirs

Reply in English. Be honest when you don't know something.`,

    zh: `你是日本北海道小樽精确、可靠的旅行向导。

重要规则：
- 绝不捏造或虚构餐厅名称、商店名称或具体地址
- 只有确定存在的商家才能提及
- 如果不确定具体地点，描述该类型场所和区域
- 始终使用web_search工具查找当前准确信息后再回答
- 搜索后，明确说明信息可能已更改

用中文回答。不知道时请诚实说明。`,

    ko: `당신은 일본 홋카이도 오타루의 정확하고 신뢰할 수 있는 여행 가이드입니다.

중요 규칙:
- 레스토랑 이름, 상점 이름, 구체적인 주소를 절대 만들어내지 마세요
- 확실히 존재하는 업소만 언급하세요
- 특정 장소가 불확실하면 해당 유형의 장소와 지역을 설명하세요
- 답변 전에 반드시 web_search 도구로 최신 정확한 정보를 검색하세요
- 검색 후 정보가 변경되었을 수 있음을 명시하세요

한국어로 답변해 주세요. 모를 때는 솔직하게 말씀해 주세요.`
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompts[lang] || systemPrompts.en,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3
          }
        ],
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    // テキストブロックのみ抽出
    const textContent = data.content
      ?.filter(block => block.type === 'text')
      ?.map(block => block.text)
      ?.join('') || '';

    res.status(200).json({ text: textContent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
