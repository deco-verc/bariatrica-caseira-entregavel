import { FormulaInput } from './types';

export function checkSafetyAlerts(input: FormulaInput): { warnings: string[]; contraindications: string[] } {
  const warnings: string[] = [
    "Este informativo é educativo e não substitui consulta médica ou nutricional.",
    "Beba pelo menos 2 a 3 litros de água por dia para garantir a eficácia das fibras."
  ];
  const contraindications: string[] = [];

  if (input.pregnancy || input.breastfeeding) {
    contraindications.push("GESTANTES/LACTANTES: O uso de suplementos emagrecedores é contraindicado. Consulte seu médico pré-natal.");
  }

  if (input.age < 18) {
    contraindications.push("IDADE: Protocolo não indicado para menores de 18 anos sem supervisão médica.");
  }

  if (input.healthConditions.some(c => c.toLowerCase().includes('renal') || c.toLowerCase().includes('fígado'))) {
    contraindications.push("CONDIÇÃO CRÔNICA: Problemas renais ou hepáticos exigem liberação médica para suplementação.");
  }

  if (input.medications.length > 5) {
    warnings.push("USO DE MEDICAMENTOS: Pela sua lista de remédios, sugerimos mostrar esta fórmula ao seu médico para evitar interações.");
  }

  return { warnings, contraindications };
}
