import { GoogleGenerativeAI } from '@google/generative-ai';
import { INGREDIENT_RULES } from './formulaRules';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface UserProfileData {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  imc: number;
}

export async function generateFormulaPlan(profile: UserProfileData) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });

  const revealedIngredients = Object.values(INGREDIENT_RULES)
    .filter(i => i.status === 'revealed')
    .map(i => `- ${i.name}: ${i.focus}`);

  const prompt = `
    Você é um especialista em saúde e bem-estar do programa Bariátrica Caseira.
    Sua tarefa é gerar uma orientação personalizada de uso de ingredientes naturais para uma cliente.

    DADOS DA CLIENTE:
    Nome: ${profile.name}
    Idade: ${profile.age} anos
    Altura: ${profile.heightCm} cm
    Peso Atual: ${profile.weightKg} kg
    IMC: ${profile.imc.toFixed(1)}

    INGREDIENTES REVELADOS (Estes são os que ela pode usar agora):
    ${revealedIngredients.join('\n')}

    REGRAS IMPORTANTES:
    1. Responda em Português Brasileiro.
    2. Use um tom acolhedor, motivador e profissional, mas não clínico demais.
    3. NÃO defina doses exatas (mg/g/mcg) se não houver uma regra interna explícita passada. Diga que a dose ideal deve ser ajustada por um profissional ou farmácia de manipulação de acordo com o perfil.
    4. NÃO diagnostique doenças nem prometa cura.
    5. NÃO prometa emagrecimento garantido.
    6. Adicione avisos sobre gravidez, amamentação e doenças crônicas.
    7. Retorne APENAS um JSON estruturado seguindo o formato abaixo.

    FORMATO JSON:
    {
      "headline": "Título motivador curto",
      "profileSummary": "Breve análise do perfil baseada nos dados",
      "usagePlan": "Como ela deve começar a usar os ingredientes revelados na rotina",
      "ingredients": [
        {
          "name": "Nome do ingrediente",
          "status": "revealed",
          "focus": "Foco do ingrediente",
          "suggestedAmount": "Faixa sugerida de forma genérica (ex: moderada)",
          "howToUse": "Instrução simples de uso (ex: antes do almoço)",
          "simpleExplanation": "Por que este ingrediente é importante para ela especificamente"
        }
      ],
      "warnings": [
        "Avisos de segurança e restrições"
      ],
      "nextSteps": [
        "Passos práticos para os próximos 7 dias"
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', text);
      throw new Error('Falha ao processar os dados da fórmula. Por favor, tente novamente.');
    }
  } catch (error: any) {
    console.error('Error generating formula with Gemini:', error);
    
    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      throw new Error('O sistema está um pouco sobrecarregado agora. Por favor, aguarde alguns segundos e tente novamente.');
    }
    
    throw new Error(error.message || 'Erro inesperado ao gerar sua fórmula.');
  }
}

export async function chatWithAssistant(messages: { role: 'user' | 'assistant' | 'system', content: string }[]) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });

  const systemPrompt = {
    role: 'system',
    content: `
      Você é a Assistente da Bariátrica Caseira. 
      Seu objetivo é ajudar as usuárias com dúvidas sobre a plataforma, os bônus, o uso da fórmula e rotina saudável.
      
      BASE DE CONHECIMENTO:
      - Método Bariátrica Caseira: Foco em ingredientes naturais que auxiliam no emagrecimento e saúde intestinal.
      - Bônus: Guia Saúde Intestinal, Protocolo Anti-Compulsão, 100 Receitas Seca-Barriga, Acompanhador de Medidas.
      - Ingredientes principais: Laranja Moro (gordura abdominal), Psyllium (saciedade/intestino), Cromo (vontade de doces).
      
      REGRAS:
      - NÃO diagnostique doenças.
      - NÃO prescreva tratamentos médicos.
      - NÃO prometa cura.
      - NÃO mande parar remédios.
      - Se perguntarem sobre gravidez, amamentação, remédios controlados ou doenças graves (diabetes, pressão alta, problemas renais), diga OBRIGATORIAMENTE para consultar um médico antes.
      - Seja gentil, empática e motivadora.
      - Use Português Brasileiro.
    `
  };

  // Convert roles for Gemini (user -> user, assistant -> model)
  const history = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt.content }] },
        { role: 'model', parts: [{ text: "Entendido. Estou pronta para ajudar as usuárias da Bariátrica Caseira." }] },
        ...history.slice(0, -1) // All but last
      ]
    });

    const lastMessage = history[history.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
  } catch (error) {
    console.error('Error in chat assistant:', error);
    throw error;
  }
}
