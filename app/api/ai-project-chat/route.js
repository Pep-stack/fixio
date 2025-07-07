import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { project, history, prompt } = await req.json();
    if (!project || !prompt) {
      return NextResponse.json({ error: 'Missing project or prompt' }, { status: 400 });
    }

    // Bouw de context op
    let context = `Je bent een AI-assistent die alleen vragen over het volgende project mag beantwoorden. Geef geen antwoorden over andere onderwerpen.\n\n`;
    context += `Projectnaam: ${project.name}\nBeschrijving: ${project.description}\n`;
    if (Array.isArray(project.ai_steps) && project.ai_steps.length > 0) {
      context += `Stappenplan:\n- ${project.ai_steps.join('\n- ')}\n`;
    }
    if (Array.isArray(project.ai_materials) && project.ai_materials.length > 0) {
      context += `Benodigdheden:\n- ${project.ai_materials.join('\n- ')}\n`;
    }
    if (project.ai_time_estimate) {
      context += `Tijdsindicatie: ${project.ai_time_estimate}\n`;
    }
    if (project.notes) {
      context += `Notities: ${project.notes}\n`;
    }
    context += `\nBeantwoord alleen vragen die direct over dit project gaan. Geef geen advies over andere projecten of algemene onderwerpen.`;

    // Bouw het messages array op
    const messages = [
      { role: 'system', content: context },
    ];
    if (Array.isArray(history)) {
      history.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }
    messages.push({ role: 'user', content: prompt });

    // OpenAI API call
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 500,
        temperature: 0.5,
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI error', details: err }, { status: 500 });
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;

    return NextResponse.json({ answer: content });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 