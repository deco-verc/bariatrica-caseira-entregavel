export interface IngredientRule {
  name: string;
  min: number | null;
  max: number | null;
  unit: string;
  note: string;
  status: 'revealed' | 'blocked';
  focus: string;
}

export const INGREDIENT_RULES: Record<string, IngredientRule> = {
  laranjaMoro: {
    name: "Laranja Moro",
    min: null,
    max: null,
    unit: "mg",
    note: "Definir faixa permitida antes de ativar em produção",
    status: 'revealed',
    focus: 'reduzir gordura abdominal e a pochete'
  },
  psyllium: {
    name: "Psyllium",
    min: null,
    max: null,
    unit: "g",
    note: "Definir faixa permitida antes de ativar em produção",
    status: 'revealed',
    focus: 'segurar a fome e desinchar o intestino'
  },
  cromo: {
    name: "Cromo",
    min: null,
    max: null,
    unit: "mcg",
    note: "Definir faixa permitida antes de ativar em produção",
    status: 'revealed',
    focus: 'tirar vontade de doces e equilibrar o sono'
  },
  'l-carnitina': {
    name: "L-Carnitina",
    min: null,
    max: null,
    unit: "mg",
    note: "Bloqueado na fase inicial",
    status: 'blocked',
    focus: 'transformação de gordura em energia'
  },
  quitosana: {
    name: "Quitosana",
    min: null,
    max: null,
    unit: "mg",
    note: "Bloqueado na fase inicial",
    status: 'blocked',
    focus: 'redução do acúmulo de gordura'
  }
};

export const REVEALED_INGREDIENTS = Object.values(INGREDIENT_RULES).filter(i => i.status === 'revealed');
export const BLOCKED_INGREDIENTS = Object.values(INGREDIENT_RULES).filter(i => i.status === 'blocked');
