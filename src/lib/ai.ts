import OpenAI from 'openai';

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

type Findings = Record<string, unknown>;

export async function generateSummary(findings: Findings, lang: 'fi' | 'en') {
  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    response_format: {type: 'json_object'},
    messages: [
      {role: 'system', content: 'You are a website audit assistant for small businesses in Scandinavia.'},
      {role: 'user', content: JSON.stringify({findings, lang})}
    ]
  });
  const content = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}


