import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateFormula, UserProfile } from './formulaCalculator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateFormulaPlanWithAI(profile: UserProfile) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });

  // 1. Calcula os dados reais de forma determinística primeiro
  const calculatedData = calculateFormula(profile);

  // 2. Cria um prompt que passa os dados já calculados para o Gemini
  const prompt = `
    Você é o Guia Especialista da Bariátrica Caseira. Sua função é explicar o plano abaixo de forma humana, acolhedora e motivadora.

    DADOS JÁ CALCULADOS PELO SISTEMA (NÃO ALTERE AS DOSES):
    Nome: ${profile.name}
    Idade: ${profile.age}
    IMC: ${profile.imc.toFixed(1)}
    Perfil: ${calculatedData.levelLabel}
    Foco por Idade: ${calculatedData.ageFocus}

    INGREDIENTES E DOSES DEFINIDAS:
    ${calculatedData.ingredients.map(i => `- ${i.name}: ${i.amount}${i.unit} (${i.timing}) - ${i.focus}`).join('\n')}

    REGRAS PARA A RESPOSTA:
    1. Retorne APENAS um JSON estruturado.
    2. Use um tom feminino, simples e popular.
    3. NÃO invente novos ingredientes ou mude as quantidades passadas.
    4. Explique cada ingrediente de forma que conecte com o perfil da usuária.
    5. No campo 'howToUse', resuma a rotina de forma prática.

    FORMATO JSON ESPERADO:
    {
      "headline": "Título curto e impactante",
      "profileSummary": "Sua explicação humana sobre o perfil dela",
      "formulaExplanation": "Por que essa combinação de 5 ingredientes foi escolhida",
      "ingredients": [
        { "name": "...", "amount": "...", "unit": "...", "timing": "...", "simpleExplanation": "Explicação conectada ao perfil" }
      ],
      "howToUse": "Resumo da rotina diária",
      "safetyNotes": ["Avisos de segurança importantes"],
      "nextSteps": ["Passos práticos para os próximos 7 dias"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini error, falling back to local calculation:', error);
    // FALLBACK: Se a IA falhar, retornamos o cálculo local formatado em JSON
    return {
      headline: `Sua Fórmula Bariátrica Caseira: Nível ${calculatedData.levelLabel}`,
      profileSummary: calculatedData.profileSummary,
      formulaExplanation: "Sua fórmula exclusiva foi calculada com base no seu IMC e metabolismo.",
      ingredients: calculatedData.ingredients,
      howToUse: "Siga os horários sugeridos para cada ingrediente para obter o máximo de aproveitamento.",
      safetyNotes: calculatedData.warnings,
      nextSteps: [
        "Inicie o uso dos ingredientes revelados.",
        "Mantenha o acompanhamento das suas medidas semanalmente.",
        "Beba bastante água."
      ]
    };
  }
}
