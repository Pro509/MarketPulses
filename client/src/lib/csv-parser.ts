export interface CSVRow {
  instrument: string;
  quantity: string;
  avgCost: string;
  ltp: string;
  invested: string;
  currentValue: string;
  pnl: string;
  netChange: string;
  dayChange: string;
}

export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const rows: CSVRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Split by comma and clean quotes
    const values = line.split(',').map(value => value.replace(/"/g, '').trim());
    
    // Ensure we have enough columns and the first column (instrument) is not empty
    if (values.length >= 9 && values[0]) {
      rows.push({
        instrument: values[0],
        quantity: values[1] || '0',
        avgCost: values[2] || '0',
        ltp: values[3] || '0',
        invested: values[4] || '0',
        currentValue: values[5] || '0',
        pnl: values[6] || '0',
        netChange: values[7] || '0',
        dayChange: values[8] || '0'
      });
    }
  }

  if (rows.length === 0) {
    throw new Error('No valid data rows found in CSV file');
  }

  return rows;
}

export function validateCSVFormat(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      reject(new Error('File must be a CSV file'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error('File size must be less than 10MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must contain at least a header and one data row'));
          return;
        }

        // Check if first line looks like a header
        const header = lines[0].toLowerCase();
        const requiredColumns = ['instrument', 'qty', 'ltp', 'invested', 'cur. val', 'p&l'];
        const hasRequiredColumns = requiredColumns.some(col => header.includes(col));
        
        if (!hasRequiredColumns) {
          reject(new Error('CSV file does not appear to contain the required columns'));
          return;
        }

        resolve(true);
      } catch (error) {
        reject(new Error('Failed to read CSV file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
