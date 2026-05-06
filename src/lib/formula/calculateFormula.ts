import { FormulaInput, FormulaResult, Intensity, ProfileType, IngredientRecommendation } from './types';
import { INGREDIENT_RULES } from './rules';
import { checkSafetyAlerts } from './safetyRules';

export function calculateFormula(input: FormulaInput): FormulaResult {
  // 1. Calcular IMC
  const heightM = input.height / 100;
  const bmi = input.weight / (heightM * heightM);
  
  let bmiCategory = "Normal";
  if (bmi < 18.5) bmiCategory = "Abaixo do peso";
  else if (bmi < 25) bmiCategory = "Normal";
  else if (bmi < 30) bmiCategory = "Sobrepeso";
  else if (bmi < 35) bmiCategory = "Obesidade Grau I";
  else if (bmi < 40) bmiCategory = "Obesidade Grau II";
  else bmiCategory = "Obesidade Grau III";

  // 2. Definir Intensidade
  let intensity: Intensity = 'moderada';
  if (input.age >= 60 || input.pregnancy || input.breastfeeding) {
    intensity = 'sensivel';
  } else if (bmi >= 30 && input.hungerLevel === 'alta') {
    intensity = 'alta';
  } else if (bmi < 25) {
    intensity = 'leve';
  }

  // 3. Definir Perfil Metabólico
  let profileType: ProfileType = 'metabolismo_lento';
  if (input.cravingsLevel === 'alta') profileType = 'compulsao_doces';
  else if (input.hungerLevel === 'alta') profileType = 'fome_alta';
  else if (input.bloatingLevel === 'alta') profileType = 'inchaco_alto';
  else if (input.routine === 'sedentaria') profileType = 'metabolismo_lento';

  // 4. Selecionar Ingredientes e Doses
  const ingredients: IngredientRecommendation[] = Object.keys(INGREDIENT_RULES).map(key => {
    const rule = INGREDIENT_RULES[key];
    const doseInfo = rule.doses[intensity];
    
    return {
      name: rule.name,
      dose: doseInfo.amount,
      unit: doseInfo.unit,
      timing: rule.timing,
      reason: rule.baseReason,
      warning: rule.specificWarnings
    };
  });

  // 5. Verificar Segurança
  const { warnings, contraindications } = checkSafetyAlerts(input);

  // 6. Texto Padrão (Template)
  const explanation = `Seu perfil foi classificado como ${profileType.replace('_', ' ')} com intensidade ${intensity}. Foram selecionados ingredientes que auxiliam no controle de ${profileType.split('_')[0]} e suporte metabólico geral.`;

  return {
    bmi,
    bmiCategory,
    profileType,
    intensity,
    ingredients,
    warnings,
    contraindications,
    explanation,
    dailyPlan: "Siga o horário sugerido para cada ingrediente. Mantenha hidratação constante e priorize alimentos naturais.",
    source: "local_formula_engine_v1",
    generatedAt: new Date().toISOString()
  };
}
