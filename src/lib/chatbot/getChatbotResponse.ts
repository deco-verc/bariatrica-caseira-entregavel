import { CHATBOT_RULES } from './chatbotRules';

export function getChatbotResponse(userMessage: string, planData?: any) {
  const normalizedMessage = userMessage.toLowerCase();
  
  // 1. Procurar por match de palavras-chave
  const match = CHATBOT_RULES.find(rule => 
    rule.keywords.some(keyword => normalizedMessage.includes(keyword))
  );

  if (match) {
    let response = match.response;
    
    // Injetar dados do plano se for sobre horários
    if (normalizedMessage.includes('horário') && planData?.ingredients) {
      const schedule = planData.ingredients
        .map((i: any) => `- ${i.name}: ${i.timing}`)
        .join('\n');
      response = `Aqui estão seus horários personalizados:\n${schedule}\n\n${match.response}`;
    }

    return response;
  }

  // 2. Resposta padrão para quando não entende
  return "Puxa, ainda não aprendi sobre esse assunto específico. Mas posso te ajudar com: Horários, Como Tomar, Jejum, Contraindicações e Resultados Esperados. Qual desses você quer saber mais? 😊";
}
