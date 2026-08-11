export const MOLAR_MASSES: Record<string, number> = {
  'H': 1.008, 'He': 4.0026, 'Li': 6.94, 'Be': 9.0122, 'B': 10.81, 'C': 12.011, 'N': 14.007, 'O': 15.999, 'F': 18.998, 'Ne': 20.180,
  'Na': 22.990, 'Mg': 24.305, 'Al': 26.982, 'Si': 28.085, 'P': 30.974, 'S': 32.06, 'Cl': 35.45, 'Ar': 39.948, 'K': 39.098, 'Ca': 40.078
  // Add more as needed or fetch from DB
};

export function parseChemicalFormula(formula: string): Record<string, number> {
  const result: Record<string, number> = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    if (element) {
      const count = parseInt(match[2] || "1");
      result[element] = (result[element] || 0) + count;
    }
  }
  return result;
}

export function calculateFormulaMolarMass(formula: Record<string, number>): number {
  let total = 0;
  for (const [element, count] of Object.entries(formula)) {
    const mass = MOLAR_MASSES[element] || 0;
    total += mass * count;
  }
  return total;
}
