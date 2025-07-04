import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Klus-specifieke system prompt
const getSystemPrompt = (userType) => {
  const basePrompt = `Je bent een professionele klusassistent voor Fixio, een platform voor doe-het-zelvers en professionals. Je expertise ligt in:

🔨 Klus-gerelateerde onderwerpen:
- Stappenplannen en werkwijzen
- Materiaal- en gereedschapsadvies
- Veiligheidsrichtlijnen
- Tijdsinschattingen
- Technische uitleg
- Probleemoplossing bij klussen

⚠️ Belangrijke regels:
1. Beantwoord ALLEEN vragen over klussen, DIY, verbouwingen, reparaties en gerelateerde onderwerpen
2. Als een vraag NIET klus-gerelateerd is, verwijs beleefd naar klus-onderwerpen
3. Geef praktisch, stap-voor-stap advies
4. Benadruk veiligheid waar relevant
5. Gebruik Nederlandse terminologie
6. Wees vriendelijk en behulpzaam
7. Geef concrete, uitvoerbare antwoorden

🎯 Doelgroep: ${userType === 'pro' ? 'Professionals en zzp\'ers' : 'Doe-het-zelvers en hobbyklussers'}

Antwoord altijd in het Nederlands en houd je antwoorden praktisch en toepasbaar.`;

  return basePrompt;
};

// Functie om te controleren of een vraag klus-gerelateerd is
const isKlusRelated = (message) => {
  const klusKeywords = [
    'klus', 'verbouwen', 'repareren', 'maken', 'bouwen', 'installeren', 'schilderen',
    'tegelen', 'loodgieterswerk', 'elektriciteit', 'houtbewerking', 'metaalbewerking',
    'metselen', 'beton', 'isolatie', 'dak', 'muur', 'vloer', 'plafond', 'keuken',
    'badkamer', 'tuin', 'terras', 'schutting', 'garage', 'kelder', 'zolder',
    'gereedschap', 'materiaal', 'tool', 'machine', 'veiligheid', 'bescherming',
    'stappenplan', 'werkwijze', 'techniek', 'methode', 'aanpak', 'planning',
    'tijdsduur', 'kosten', 'budget', 'offerte', 'factuur', 'werkbon'
  ];

  const messageLower = message.toLowerCase();
  return klusKeywords.some(keyword => messageLower.includes(keyword));
};

export async function POST(request) {
  try {
    const { message, userType = 'diy' } = await request.json();

    // Controleer of de vraag klus-gerelateerd is
    if (!isKlusRelated(message)) {
      return NextResponse.json({
        response: `Hallo! Ik ben specifiek ontworpen om je te helpen met klus-gerelateerde vragen. 

Kun je me een vraag stellen over:
🔨 Verbouwingen of reparaties
🛠️ Gereedschap of materialen
📋 Stappenplannen of werkwijzen
⏱️ Tijdsinschattingen
⚠️ Veiligheidsadvies
🏠 Specifieke klussen (keuken, badkamer, tuin, etc.)

Ik help je graag verder met je klusvraag!`
      });
    }

    const systemPrompt = getSystemPrompt(userType);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, ik kon geen antwoord genereren.';

    return NextResponse.json({ response });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    return NextResponse.json(
      { 
        response: 'Sorry, er is een technische fout opgetreden. Probeer het later opnieuw of neem contact op met de support.' 
      },
      { status: 500 }
    );
  }
} 