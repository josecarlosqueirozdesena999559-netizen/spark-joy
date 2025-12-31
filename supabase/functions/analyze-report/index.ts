import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, content, reason, reportedUserId } = await req.json();
    
    console.log("Analyzing report:", { reportId, reason, contentLength: content?.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // AI Analysis prompt - be strict as requested
    const systemPrompt = `Você é um moderador rigoroso de uma comunidade feminina de apoio emocional. Seu trabalho é analisar denúncias de conteúdo e tomar decisões firmes para proteger as usuárias.

REGRAS DE ANÁLISE:
- Seja MUITO rigoroso com qualquer forma de agressão, ódio ou assédio
- Xingamentos diretos = penalidade máxima
- Conteúdo impróprio ou ofensivo = penalidade média a alta
- Spam ou conteúdo irrelevante = penalidade leve
- Na dúvida, penalize - a segurança da comunidade vem primeiro

NÍVEIS DE PENALIDADE:
1 = Suspensão de 1 dia (conteúdo inadequado leve)
2 = Exclusão do post + 15 dias de bloqueio (conteúdo ofensivo/agressivo)
3 = Exclusão da conta (xingamentos graves, ameaças, assédio repetido)

Responda APENAS com um JSON válido no formato:
{
  "decision": 1 | 2 | 3 | 0,
  "reason": "explicação breve da decisão",
  "deleteContent": true | false,
  "daysBlocked": número de dias
}

Use decision 0 apenas se o conteúdo for claramente inofensivo.`;

    const userPrompt = `Analise esta denúncia:

MOTIVO DA DENÚNCIA: ${reason}

CONTEÚDO DENUNCIADO:
"${content}"

Tome uma decisão rigorosa baseada nas regras.`;

    console.log("Calling AI for analysis...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI raw response:", aiMessage);

    // Parse AI response
    let decision;
    try {
      // Extract JSON from response
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        decision = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Default to moderate penalty if parsing fails
      decision = {
        decision: 1,
        reason: "Análise automática aplicada por precaução",
        deleteContent: false,
        daysBlocked: 1,
      };
    }

    console.log("Parsed decision:", decision);

    // Update report with AI analysis
    await supabase
      .from("reports")
      .update({
        ai_analysis: aiMessage,
        ai_decision: JSON.stringify(decision),
        processed_at: new Date().toISOString(),
        status: "processed",
      })
      .eq("id", reportId);

    // Apply penalty if decision > 0
    if (decision.decision > 0 && reportedUserId) {
      const expiresAt = decision.daysBlocked > 0 
        ? new Date(Date.now() + decision.daysBlocked * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Insert penalty
      await supabase.from("user_penalties").insert({
        user_id: reportedUserId,
        penalty_level: decision.decision,
        reason: decision.reason,
        report_id: reportId,
        expires_at: expiresAt,
      });

      console.log("Penalty applied:", { level: decision.decision, expiresAt });

      // If decision is to delete content
      if (decision.deleteContent) {
        // Get the report to find post_id or comment_id
        const { data: report } = await supabase
          .from("reports")
          .select("post_id, comment_id")
          .eq("id", reportId)
          .single();

        if (report?.post_id) {
          await supabase.from("posts").delete().eq("id", report.post_id);
          console.log("Post deleted:", report.post_id);
        }
        if (report?.comment_id) {
          await supabase.from("comments").delete().eq("id", report.comment_id);
          console.log("Comment deleted:", report.comment_id);
        }
      }

      // If level 3, soft delete the account
      if (decision.decision === 3) {
        await supabase
          .from("profiles")
          .update({ 
            deleted_at: new Date().toISOString(),
            username: `deleted_${Date.now()}`
          })
          .eq("id", reportedUserId);
        console.log("Account soft deleted:", reportedUserId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        decision: decision.decision,
        reason: decision.reason,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
