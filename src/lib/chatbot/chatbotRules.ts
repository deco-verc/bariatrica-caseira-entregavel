export interface ChatbotRule {
  keywords: string[];
  response: string;
  category: 'modo_uso' | 'seguranca' | 'resultados' | 'geral';
}

export const CHATBOT_RULES: ChatbotRule[] = [
  {
    keywords: ['horário', 'como tomar', 'quando tomar', 'uso', 'instruções', 'tomar'],
    response: "Para ter o melhor resultado, siga os horários indicados em 'Minha Fórmula'. Geralmente as fibras como Psyllium devem ser tomadas antes das refeições principais.",
    category: 'modo_uso'
  },
  {
    keywords: ['jejum', 'acordar', 'cedo', 'manhã'],
    response: "Sim, muitos de nossos ingredientes como a Laranja Moro e a L-Carnitina podem ser usados pela manhã. Mas se você tem o estômago sensível, prefira tomar após um pequeno café da manhã.",
    category: 'modo_uso'
  },
  {
    keywords: ['contraindicação', 'perigo', 'remédio', 'doença', 'diabetes', 'pressão', 'grávida', 'amamentando'],
    response: "Sua segurança é nossa prioridade! Se você tem alguma condição de saúde ou está gestante/lactante, deve mostrar a lista de ingredientes ao seu médico antes de iniciar o protocolo.",
    category: 'seguranca'
  },
  {
    keywords: ['esqueci', 'perdi', 'dose', 'pular'],
    response: "Não tem problema! Se esquecer uma dose, apenas continue com a próxima normalmente. Não tente dobrar a dose para compensar o esquecimento.",
    category: 'geral'
  },
  {
    keywords: ['resultado', 'tempo', 'demora', 'diferença', 'emagrecer', 'perder'],
    response: "Os primeiros sinais (como melhora no inchaço e intestino) aparecem geralmente nos primeiros 7 a 10 dias. O emagrecimento visual depende da constância no uso dos ingredientes.",
    category: 'resultados'
  },
  {
    keywords: ['café', 'cafeína', 'bebida', 'água'],
    response: "A água é o combustível das fibras! Beba pelo menos 2 a 3 litros. O café pode ser consumido normalmente, mas evite adoçantes artificiais em excesso.",
    category: 'modo_uso'
  }
];

export const SUGGESTED_QUESTIONS = [
  "Como eu devo tomar minha fórmula?",
  "Qual o melhor horário para cada ingrediente?",
  "Posso tomar em jejum?",
  "Tenho contraindicação?",
  "Quando começo a sentir diferença?",
  "Esqueci de tomar, o que eu faço?"
];
