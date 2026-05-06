export type CalculationLevel = 'leve' | 'moderado' | 'intenso' | 'avancado';

export interface IngredientDose {
  amount: string;
  unit: string;
  timing: string;
  explanation: string;
}

export type LevelRules = Record<string, IngredientDose>;

export const FORMULA_RULES: Record<CalculationLevel, LevelRules> = {
  leve: {
    laranjaMoro: { amount: "400", unit: "mg", timing: "Antes da principal refeição", explanation: "Foco inicial em gordura abdominal." },
    psyllium: { amount: "3", unit: "g", timing: "20 min antes do almoço", explanation: "Auxílio na saciedade leve." },
    cromo: { amount: "200", unit: "mcg", timing: "Pela manhã", explanation: "Controle de vontade de doces." },
    lCarnitina: { amount: "250", unit: "mg", timing: "Pela manhã", explanation: "Suporte à energia." },
    quitosana: { amount: "250", unit: "mg", timing: "Antes do almoço", explanation: "Controle de absorção de gordura." }
  },
  moderado: {
    laranjaMoro: { amount: "500", unit: "mg", timing: "Antes da principal refeição", explanation: "Aceleração da queima abdominal." },
    psyllium: { amount: "5", unit: "g", timing: "20 min antes do almoço/jantar", explanation: "Controle de fome moderada." },
    cromo: { amount: "250", unit: "mcg", timing: "Pela manhã", explanation: "Equilíbrio da insulina e doces." },
    lCarnitina: { amount: "500", unit: "mg", timing: "Antes de uma caminhada ou pela manhã", explanation: "Transformação de gordura em energia." },
    quitosana: { amount: "500", unit: "mg", timing: "Antes das maiores refeições", explanation: "Redução do acúmulo de gordura." }
  },
  intenso: {
    laranjaMoro: { amount: "600", unit: "mg", timing: "30 min antes do almoço", explanation: "Protocolo intenso para gordura persistente." },
    psyllium: { amount: "8", unit: "g", timing: "20-30 min antes do almoço/jantar", explanation: "Foco alto em saciedade e intestino." },
    cromo: { amount: "300", unit: "mcg", timing: "Pela manhã", explanation: "Controle rigoroso de picos de ansiedade." },
    lCarnitina: { amount: "1000", unit: "mg", timing: "Antes de atividade física ou pela manhã", explanation: "Suporte energético avançado." },
    quitosana: { amount: "750", unit: "mg", timing: "Antes de refeições mais pesadas", explanation: "Bloqueio de gordura de alta intensidade." }
  },
  avancado: {
    laranjaMoro: { amount: "600", unit: "mg", timing: "30 min antes do almoço", explanation: "Máxima ativação para redução de medidas." },
    psyllium: { amount: "10", unit: "g", timing: "Fracionado antes das refeições", explanation: "Protocolo de saciedade máxima (Uso gradual)." },
    cromo: { amount: "400", unit: "mcg", timing: "Pela manhã ou fracionado", explanation: "Regulação metabólica para perfis avançados." },
    lCarnitina: { amount: "1500", unit: "mg", timing: "Pela manhã ou pré-treino", explanation: "Queima calórica otimizada." },
    quitosana: { amount: "1000", unit: "mg", timing: "Antes das refeições", explanation: "Absorção mínima de gorduras externas." }
  }
};

export const INGREDIENT_LABELS: Record<string, string> = {
  laranjaMoro: "Laranja Moro",
  psyllium: "Psyllium",
  cromo: "Cromo",
  lCarnitina: "L-Carnitina",
  quitosana: "Quitosana"
};

export const INGREDIENT_DESCRIPTIONS: Record<string, string> = {
  laranjaMoro: "Ajuda no foco principal da Bariátrica Caseira: gordura abdominal e pochete.",
  psyllium: "Ajuda a aumentar a sensação de saciedade e melhorar o funcionamento intestinal.",
  cromo: "Ajuda no controle da vontade de doces e no equilíbrio da rotina alimentar.",
  lCarnitina: "Ajuda no suporte à transformação de gordura em energia durante a rotina.",
  quitosana: "Ajuda no suporte ao controle do acúmulo de gordura dentro do protocolo."
};
