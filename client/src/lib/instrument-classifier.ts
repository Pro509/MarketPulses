export type InstrumentType = 'stock' | 'etf' | 'bond';

export function classifyInstrument(instrumentName: string): InstrumentType {
  const name = instrumentName.toUpperCase();
  
  // ETF patterns - Common ETF naming conventions in India
  const etfPatterns = [
    'ETF',
    'BEES',      // Gold BeES, etc.
    'IETF',      // Index ETFs
    'NV20',      // Nifty Next 50
    'MOM100',    // Momentum 100
    'MON100',    // Similar momentum funds
    'MIDCAP',    // Midcap ETFs
    'NIFTY',     // Nifty ETFs
    'SENSEX',    // Sensex ETFs
    'CPSE',      // CPSE ETF
    'BHARAT'     // Bharat Bond ETF
  ];
  
  // Check for ETF patterns
  for (const pattern of etfPatterns) {
    if (name.includes(pattern)) {
      return 'etf';
    }
  }
  
  // Bond patterns - Corporate bonds, government securities
  const bondPatterns = [
    /^\d+[A-Z]+\d+$/,    // Pattern like 109ESPL26, 115MFL26
    /^\d+[A-Z]+FL\d+$/,  // Fixed rate bonds with FL
    /^\d+[A-Z]+SL\d+$/,  // Step up bonds with SL
    /GSEC/,              // Government Securities
    /TBILL/,             // Treasury Bills
    /PSU/,               // PSU Bonds
  ];
  
  // Check for bond patterns
  for (const pattern of bondPatterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(name)) {
        return 'bond';
      }
    } else {
      if (name.includes(pattern)) {
        return 'bond';
      }
    }
  }
  
  // Additional bond checks
  if (/^\d+/.test(name) && /\d+$/.test(name) && name.length > 6) {
    return 'bond';
  }
  
  // Default to stock for everything else
  return 'stock';
}

export function getInstrumentDisplayName(type: InstrumentType): string {
  switch (type) {
    case 'stock':
      return 'Stock';
    case 'etf':
      return 'ETF';
    case 'bond':
      return 'Bond';
    default:
      return 'Unknown';
  }
}

export function getInstrumentColor(type: InstrumentType): string {
  switch (type) {
    case 'stock':
      return 'bg-blue-100 text-blue-800';
    case 'etf':
      return 'bg-green-100 text-green-800';
    case 'bond':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
