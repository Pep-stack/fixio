import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, description, image_urls } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'Missing name or description' }, { status: 400 });
    }

    // Bouw de prompt op
    let prompt = `Je bent een slimme klus-assistent. Maak een gestructureerd stappenplan, een lijst met benodigde materialen, en een realistische tijdsindicatie voor het volgende DIY-project:

Projectnaam: ${name}
Beschrijving: ${description}
`;
    if (image_urls && image_urls.length > 0) {
      prompt += `Gebruik de volgende afbeeldingen als extra context (indien relevant):\n`;
      image_urls.forEach((url, idx) => {
        prompt += `Afbeelding ${idx + 1}: ${url}\n`;
      });
    }
    prompt += `
Geef het antwoord als JSON object met de volgende structuur:
{
  "steps": ["stap 1", "stap 2", ...],
  "materials": ["materiaal 1", "materiaal 2", ...],
  "time_estimate": "tijdsindicatie in duidelijke taal"
}`;

    // OpenAI API call
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Je bent een behulpzame klus-assistent voor doe-het-zelvers.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...(image_urls && image_urls.length > 0
                ? image_urls.map(url => ({ type: 'image_url', image_url: { url } }))
                : [])
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI error', details: err }, { status: 500 });
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;
    let aiResult;
    let cleanContent = content?.trim();
    if (cleanContent?.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanContent?.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
    }
    try {
      aiResult = JSON.parse(cleanContent);
    } catch (e) {
      return NextResponse.json({ error: 'AI antwoord is geen geldig JSON', raw: content }, { status: 500 });
    }

    return NextResponse.json({
      steps: aiResult.steps || [],
      materials: aiResult.materials || [],
      time_estimate: aiResult.time_estimate || ''
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 