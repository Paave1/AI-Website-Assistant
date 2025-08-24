import OpenAI from 'openai';

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function generateSummary(findings: any, lang: 'fi' | 'en') {
  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: 'You are a website audit assistant for small businesses in Scandinavia.'
      },
      {
        role: 'user',
        content: JSON.stringify({findings, lang})
      }
    ],
    response_format: {type: 'json_object'}
  });

  return JSON.parse((response as any).output_text || '{}');
}


