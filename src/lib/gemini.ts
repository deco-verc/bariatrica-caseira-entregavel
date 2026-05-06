import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateFormula, UserProfile } from './formulaCalculator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiResponse {
  success: boolean;
  data?: any;
  errorType?: "quota_exceeded" | "rate_limit" | "timeout" | "server_error" | "invalid_key" | "unknown";
  usedFallback: boolean;
  source: "gemini" | "local_fallback";
}

export async function generateFormulaPlanWithAI(profile: UserProfile): Promise<GeminiResponse> {
  const isGeminiEnabled = process.env.GEMINI_ENABLE === 'true';
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  // 1. Cálculo Local (Obrigatório e sempre pronto como Fallback)
  const localCalculatedData = calculateFormula(profile);

  // 2. Se Gemini estiver desativado ou sem chave, usa fallback direto
  if (!isGeminiEnabled || !apiKey) {
    console.warn('[Gemini] IA desativada ou sem API Key. Usando cálculo local.');
    return {
      success: true,
      data: formatLocalAsGemini(localCalculatedData),
      usedFallback: true,
      source: "local_fallback"
    };
  }

  // 3. Tentativa com Gemini
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `
      Atue como o Guia Especialista da Bariátrica Caseira. 
      Explique este plano de forma humana e motivadora.
      
      DADOS CALCULADOS (NÃO ALTERE AS DOSES):
      Nome: ${profile.name}
      Perfil: ${localCalculatedData.levelLabel}
      Foco por Idade: ${localCalculatedData.ageFocus}
      Ingredientes: ${localCalculatedData.ingredients.map(i => `${i.name} (${i.amount}${i.unit})`).join(', ')}

      Retorne APENAS um JSON:
      {
        "headline": "Título curto",
        "profileSummary": "Resumo do perfil",
        "formulaExplanation": "Por que essa combinação",
        "ingredients": [...mesmos dados passados...],
        "howToUse": "Resumo da rotina",
        "safetyNotes": ["Avisos"],
        "nextSteps": ["Passos"]
      }
    `;

    // Timeout de 15 segundos para não travar o usuário
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000))
    ]) as any;

    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return {
      success: true,
      data,
      usedFallback: false,
      source: "gemini"
    };

  } catch (error: any) {
    let errorType: GeminiResponse['errorType'] = "unknown";
    
    if (error.message?.includes('429') || error.message?.includes('quota')) errorType = "quota_exceeded";
    else if (error.message === 'TIMEOUT') errorType = "timeout";
    
    console.warn(`[Gemini] Falha (${errorType}). Ativando fallback local.`, error.message);

    return {
      success: true,
      data: formatLocalAsGemini(localCalculatedData),
      errorType,
      usedFallback: true,
      source: "local_fallback"
    };
  }
}

// Helper para padronizar o objeto local no formato que o front espera
function formatLocalAsGemini(calculated: any) {
  return {
    headline: `Sua Fórmula Bariátrica: Nível ${calculated.levelLabel}`,
    profileSummary: calculated.profileSummary,
    formulaExplanation: "Sua fórmula exclusiva baseada no seu IMC e metabolismo.",
    ingredients: calculated.ingredients,
    howToUse: "Siga rigorosamente as doses e horários para máxima eficácia.",
    safetyNotes: calculated.warnings,
    nextSteps: [
      "Salve sua fórmula no celular",
      "Inicie o uso dos ingredientes",
      "Registre seu peso inicial no dashboard"
    ]
  };
}
