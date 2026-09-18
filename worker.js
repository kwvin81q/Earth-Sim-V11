const SYSTEM = `You are Earth-Sim AI, an analytical assistant embedded in a civilization simulator. Answer the user's question using the supplied simulated world snapshot. Distinguish simulated values from real-world facts. Do not pretend simulated discoveries are established science. Explain causal links, tradeoffs, uncertainties, and useful next experiments. Respect the user's configured constraints but you may identify tensions or weaknesses. Be concise unless the user asks for depth.`;

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-store'
    }
  });
}

async function handleAsk(request, env) {
  try {
    if (!env.OPENAI_API_KEY) {
      return json({ error: 'OPENAI_API_KEY is not configured as a Worker runtime secret.' }, 500);
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    const body = await request.json();
    const question = String(body?.question || '').trim().slice(0, 4000);
    if (!question) return json({ error: 'Question is required.' }, 400);

    const world = body?.world || {};
    const conversation = Array.isArray(body?.conversation) ? body.conversation.slice(-8) : [];
    const input = [
      { role: 'system', content: [{ type: 'input_text', text: SYSTEM }] },
      {
        role: 'user',
        content: [{
          type: 'input_text',
          text: `CURRENT EARTH-SIM SNAPSHOT\n${JSON.stringify(world)}\n\nRECENT CHAT\n${JSON.stringify(conversation)}\n\nQUESTION\n${question}`
        }]
      }
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-5.6',
        input,
        max_output_tokens: 1200
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json({ error: data?.error?.message || `OpenAI request failed (${response.status}).` }, response.status);
    }

    let answer = data.output_text;
    if (!answer && Array.isArray(data.output)) {
      answer = data.output
        .flatMap(item => item.content || [])
        .filter(item => item.type === 'output_text')
        .map(item => item.text)
        .join('\n');
    }

    return json({ answer: answer || 'The model returned no text.' }, 200);
  } catch (error) {
    return json({ error: error?.message || 'Unexpected server error.' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/ask') {
      return handleAsk(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
