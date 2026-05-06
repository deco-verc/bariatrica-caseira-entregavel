import { Intensity } from './types';

export interface IngredientRule {
  name: string;
  doses: Record<Intensity, { amount: string; unit: string }>;
  timing: string;
  baseReason: string;
  specificWarnings?: string;
}

export const INGREDIENT_RULES: Record<string, IngredientRule> = {
  psyllium: {
    name: "Psyllium",
    doses: {
      leve: { amount: "3", unit: "g" },
      moderada: { amount: "5", unit: "g" },
      alta: { amount: "8", unit: "g" },
      sensivel: { amount: "3", unit: "g" }
    },
    timing: "20-30 minutos antes das principais refeições com 300ml de água.",
    baseReason: "Fibra natural que expande no estômago, promovendo saciedade prolongada e auxílio intestinal.",
    specificWarnings: "Beber pelo menos 2,5L de água por dia para evitar constipação."
  },
  chromium: {
    name: "Cromo (Picolinato)",
    doses: {
      leve: { amount: "100", unit: "mcg" },
      moderada: { amount: "200", unit: "mcg" },
      alta: { amount: "300", unit: "mcg" },
      sensivel: { amount: "100", unit: "mcg" }
    },
    timing: "Pela manhã ou junto com a refeição mais calórica do dia.",
    baseReason: "Otimiza a ação da insulina e reduz drasticamente a compulsão por doces e carboidratos.",
  },
  moroOrange: {
    name: "Laranja Moro",
    doses: {
      leve: { amount: "400", unit: "mg" },
      moderada: { amount: "500", unit: "mg" },
      alta: { amount: "700", unit: "mg" },
      sensivel: { amount: "400", unit: "mg" }
    },
    timing: "30 minutos antes do almoço ou pela manhã em jejum.",
    baseReason: "Antocianinas que auxiliam na redução de gordura abdominal (pochete) e adipócitos.",
  },
  lCarnitina: {
    name: "L-Carnitina",
    doses: {
      leve: { amount: "250", unit: "mg" },
      moderada: { amount: "500", unit: "mg" },
      alta: { amount: "1000", unit: "mg" },
      sensivel: { amount: "250", unit: "mg" }
    },
    timing: "Pela manhã ou antes de atividade física/caminhada.",
    baseReason: "Facilita o transporte de ácidos graxos para serem queimados como fonte de energia.",
  },
  quitosana: {
    name: "Quitosana",
    doses: {
      leve: { amount: "500", unit: "mg" },
      moderada: { amount: "750", unit: "mg" },
      alta: { amount: "1000", unit: "mg" },
      sensivel: { amount: "500", unit: "mg" }
    },
    timing: "Exatamente 15 minutos antes de refeições que contenham gordura.",
    baseReason: "Fibra de origem marinha que ajuda a 'capturar' parte da gordura ingerida antes da digestão.",
    specificWarnings: "Alérgicos a crustáceos e frutos do mar NÃO devem consumir este ingrediente."
  }
};
