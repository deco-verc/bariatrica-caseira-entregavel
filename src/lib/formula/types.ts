export type Intensity = 'leve' | 'moderada' | 'alta' | 'sensivel';

export type ProfileType = 
  | 'metabolismo_lento' 
  | 'fome_alta' 
  | 'inchaco_alto' 
  | 'compulsao_doces' 
  | 'rotina_corrida' 
  | 'perfil_sensivel' 
  | 'manutencao';

export interface FormulaInput {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: string;
  hungerLevel: 'baixa' | 'media' | 'alta';
  bloatingLevel: 'baixa' | 'media' | 'alta';
  fatigueLevel: 'baixa' | 'media' | 'alta';
  cravingsLevel: 'baixa' | 'media' | 'alta';
  sleepQuality: 'boa' | 'regular' | 'ruim';
  routine: 'sedentaria' | 'ativa' | 'muito_ativa';
  activityLevel: string;
  restrictions: string[];
  medications: string;
  pregnancy: boolean;
  breastfeeding: boolean;
  healthConditions: string[];
}

export interface IngredientRecommendation {
  name: string;
  dose: string;
  unit: string;
  timing: string;
  reason: string;
  warning?: string;
}

export interface FormulaResult {
  bmi: number;
  bmiCategory: string;
  profileType: ProfileType;
  intensity: Intensity;
  ingredients: IngredientRecommendation[];
  warnings: string[];
  contraindications: string[];
  explanation: string;
  dailyPlan: string;
  source: string;
  generatedAt: string;
}
