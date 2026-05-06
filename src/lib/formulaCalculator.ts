import { FORMULA_RULES, INGREDIENT_LABELS, INGREDIENT_DESCRIPTIONS, CalculationLevel } from './formulaRules';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  imc: number;
}

export function calculateFormula(profile: UserProfile) {
  const imc = profile.imc;
  
  // 1. Definir Perfil por IMC
  let level: CalculationLevel = 'moderado';
  if (imc < 25) level = 'leve';
  else if (imc >= 25 && imc < 30) level = 'moderado';
  else if (imc >= 30 && imc < 35) level = 'intenso';
  else level = 'avancado';

  // 2. Definir Tom/Foco por Idade
  let ageFocus = "";
  if (profile.age >= 18 && profile.age <= 29) {
    ageFocus = "perfil jovem, com foco em rotina, constância e controle de fome.";
  } else if (profile.age >= 30 && profile.age <= 44) {
    ageFocus = "foco em metabolismo, ansiedade por doces e redução de gordura abdominal.";
  } else if (profile.age >= 45 && profile.age <= 59) {
    ageFocus = "foco em metabolismo mais lento, inchaço, controle de fome fora de hora e constância.";
  } else {
    ageFocus = "foco em segurança, adaptação gradual e orientação cuidadosa.";
  }

  // 3. Montar Lista de Ingredientes (Todos Liberados)
  const rules = FORMULA_RULES[level];
  const ingredients = Object.keys(rules).map(key => ({
    name: INGREDIENT_LABELS[key] || key,
    key: key,
    amount: rules[key].amount,
    unit: rules[key].unit,
    timing: rules[key].timing,
    focus: INGREDIENT_DESCRIPTIONS[key],
    simpleExplanation: rules[key].explanation
  }));

  // 4. Avisos de Segurança
  const warnings = [
    "Este conteúdo é educativo e não substitui acompanhamento médico ou nutricional.",
    "Se você está grávida, amamentando, usa remédios ou possui alguma condição de saúde, consulte um profissional antes de iniciar qualquer protocolo."
  ];

  if (rules.psyllium) {
    warnings.push("Use o Psyllium sempre com bastante água. Fibra sem água pode causar desconforto intestinal.");
  }

  return {
    level,
    levelLabel: level.charAt(0).toUpperCase() + level.slice(1),
    ageFocus,
    ingredients,
    warnings,
    profileSummary: `Com base no seu IMC de ${imc.toFixed(1)}, você se enquadra no Perfil ${level.toUpperCase()}. Sua orientação leva em conta sua idade (${profile.age} anos), sendo um ${ageFocus}`
  };
}
