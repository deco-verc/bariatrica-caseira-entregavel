import { z } from 'zod';
import { FormulaInput } from './types';
import { calculateFormula } from './calculateFormula';
import { generatePlanText } from './generatePlanText';

export * from './types';
export * from './rules';
export * from './calculateFormula';
export * from './generatePlanText';

export const formulaInputSchema = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.string(),
  weight: z.number(),
  height: z.number(),
  goal: z.string(),
  hungerLevel: z.enum(['baixa', 'media', 'alta']),
  bloatingLevel: z.enum(['baixa', 'media', 'alta']),
  fatigueLevel: z.enum(['baixa', 'media', 'alta']),
  cravingsLevel: z.enum(['baixa', 'media', 'alta']),
  sleepQuality: z.enum(['boa', 'regular', 'ruim']),
  routine: z.enum(['sedentaria', 'ativa', 'muito_ativa']),
  activityLevel: z.string().optional(),
  restrictions: z.array(z.string()).default([]),
  medications: z.string().default(''),
  pregnancy: z.boolean().default(false),
  breastfeeding: z.boolean().default(false),
  healthConditions: z.array(z.string()).default([])
});

export function processLocalFormula(inputRaw: any) {
  const input = formulaInputSchema.parse(inputRaw) as FormulaInput;
  const result = calculateFormula(input);
  const textInfo = generatePlanText(result, input.name);

  return {
    ...result,
    ...textInfo,
    source: 'local_engine_v1',
    isAIGenerated: false
  };
}
