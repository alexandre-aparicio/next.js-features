export const validationRules = {
  min4: (value: string) => value.length >= 4 || 'Mínimo 4 caracteres',
  min6: (value: string) => value.length >= 6 || 'Mínimo 6 caracteres',
  min8: (value: string) => value.length >= 8 || 'Mínimo 8 caracteres',
  max8: (value: string) => value.length <= 8 || 'Máximo 8 caracteres',
  max12: (value: string) => value.length <= 12 || 'Máximo 12 caracteres',
  max20: (value: string) => value.length <= 20 || 'Máximo 20 caracteres',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email inválido',
  phone: (value: string) => /^[0-9]{9}$/.test(value) || 'Teléfono inválido (9 dígitos)',
  regexPass: (value: string) => /^(?=.*[0-9])/.test(value) || 'Debe contener al menos un número',
  onlyLetters: (value: string) => /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value) || 'Solo se permiten letras',
  required: (value: string) => value.trim().length > 0 || 'Este campo es requerido',
  noSpaces: (value: string) => !/\s/.test(value) || 'No se permiten espacios',
};

export type ValidationRuleName = keyof typeof validationRules;
export type ValidationConfig = {
  [K in ValidationRuleName]?: boolean;
};

export const validateField = (value: string, config?: ValidationConfig): string => {
  if (!config) return '';

  for (const [ruleName, ruleValue] of Object.entries(config)) {
    if (ruleValue) {
      const rule = validationRules[ruleName as ValidationRuleName];
      if (rule) {
        const result = rule(value);
        if (typeof result === 'string') return result;
      }
    }
  }

  return '';
};