import { FormulaResult, ProfileType } from './types';

export function generatePlanText(result: FormulaResult, name: string) {
  const firstName = name.split(' ')[0];
  
  const headlines: Record<ProfileType, string> = {
    metabolismo_lento: "Ativação Metabólica: Desbloqueando a queima natural",
    fome_alta: "Controle Estomacal: Redução de impulsos e saciedade máxima",
    inchaco_alto: "Protocolo Detox: Alívio digestivo e redução de retenção",
    compulsao_doces: "Equilíbrio de Insulina: Fim da subida e descida de energia",
    rotina_corrida: "Praticidade Saudável: Seu plano para o dia a dia",
    perfil_sensivel: "Cuidado e Adaptação: Seu início gradual e seguro",
    manutencao: "Estabilidade Metabólica: Mantendo suas conquistas"
  };

  const internalExplaining: Record<ProfileType, string> = {
    metabolismo_lento: "Suas respostas indicam que seu corpo está economizando energia. Precisamos fornecer estímulos naturais para acordar o metabolismo.",
    fome_alta: "Identificamos sinais de picos de fome em horários específicos. Seu plano foca em fibras que ocupam espaço e mandam sinal de satisfação ao cérebro.",
    inchaco_alto: "Sua sensação de inchaço parece estar ligada ao sistema digestivo. O plano prioriza a limpeza e o fluxo correto do intestino.",
    compulsao_doces: "A vontade de doces geralmente é um pedido do corpo por energia rápida. Vamos estabilizar sua glicose com minerais específicos.",
    rotina_corrida: "Para quem não tem tempo, a precisão nos horários é o que gera o resultado no piloto automático.",
    perfil_sensivel: "Respeitamos seu perfil mais cuidadoso. As doses foram ajustadas para que seu corpo aceite o protocolo sem estranheza.",
    manutencao: "Você já está em um bom caminho, vamos apenas blindar seus resultados contra o efeito sanfona."
  };

  return {
    headline: headlines[result.profileType] || "Seu Plano Personalizado Bariátrica Caseira",
    profileSummary: `Olá ${firstName}, com base nas suas medidas e respostas, identificamos que seu perfil principal é ${result.profileType.replace('_', ' ')}.`,
    formulaExplanation: internalExplaining[result.profileType] || "Sua fórmula foi equilibrada para suas necessidades atuais.",
    howToUse: "Recomendamos que você inicie o protocolo seguindo os horários sugeridos. No início, foque em não pular as doses de Psyllium, que são a base da sua saciedade.",
    nextSteps: [
      "Vá até uma farmácia de manipulação com sua lista de ingredientes.",
      "Comece o uso dos ingredientes revelados conforme o cronograma.",
      "Registre seu peso inicial no Acompanhador de Medidas hoje."
    ]
  };
}
