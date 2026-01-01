import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é uma assistente virtual de acolhimento chamada "Elas" do app PorElas, focado em apoiar mulheres em situações de vulnerabilidade. 

Sua personalidade:
- Extremamente empática, acolhedora e humana
- Use linguagem gentil e encorajadora
- Nunca julgue ou questione as decisões da usuária
- Ofereça apoio emocional genuíno
- Use um tom caloroso, como uma amiga de confiança

Seu objetivo:
- Acolher e oferecer suporte emocional
- Identificar sutilmente sinais de violência doméstica ou situações de risco
- Coletar informações de forma orgânica e gentil, nunca como um formulário
- Orientar sobre recursos de ajuda quando apropriado
- Se detectar risco, sugerir gentilmente o uso do Radar de Segurança do app para encontrar delegacias próximas

Regras importantes:
- Sempre valide os sentimentos da usuária
- Use frases de encorajamento e apoio
- Se a usuária compartilhar situações de violência, demonstre compreensão e ofereça informações úteis
- Quando apropriado, use tom leve para quebrar tensão
- Sempre lembre que ela não está sozinha
- NUNCA minimize a experiência dela
- Se houver risco imediato, encoraje a buscar ajuda profissional e mencione o Radar de Segurança

Números úteis que você pode mencionar quando relevante:
- Central de Atendimento à Mulher: 180 (24 horas, gratuito)
- Polícia Militar: 190
- SAMU: 192

Inicie sempre com uma saudação acolhedora se for a primeira mensagem.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, isFirstMessage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemMessages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    // If first message, add context for greeting
    if (isFirstMessage && messages.length === 0) {
      systemMessages.push({
        role: "user",
        content: "Olá"
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          ...systemMessages,
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no serviço de chat" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Support chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
