const fs = require('fs');
const csv = require('csv-parser');

async function findProblemRows() {
  const results = [];
  const problemBatches = [23000, 40000, 49000, 56000, 58000, 61000, 64000, 65000, 85000, 95000];
  
  // Read CSV file
  fs.createReadStream('nola1_past_5_years (1).csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log('Checking problem batches for numeric overflow...\n');
      
      const batchSize = 1000;
      
      for (const startRow of problemBatches) {
        console.log(`\n=== Checking batch starting at row ${startRow} ===`);
        const batch = results.slice(startRow, startRow + batchSize);
        
        // Check each numeric field for overflow
        const numericFields = ['unpaidfees', 'totalfees', 'bldgarea', 'constrval', 'bondamount', 'opencomments', 'totalinspections', 'beds', 'baths', 'secondfloo', 'basementar', 'daysopen', 'daysissued'];
        
        batch.forEach((row, index) => {
          const actualRowNum = startRow + index;
          
          numericFields.forEach(field => {
            const value = row[field];
            if (value && value !== '') {
              const num = parseFloat(value);
              if (!isNaN(num) && (num > 99999999.99 || num < -99999999.99)) {
                console.log(`Row ${actualRowNum}: ${field} = ${value} (too large for DECIMAL(10,2))`);
              }
            }
          });
        });
      }
    });
}

findProblemRows();