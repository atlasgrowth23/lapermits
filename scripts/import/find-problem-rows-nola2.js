const fs = require('fs');
const csv = require('csv-parser');

const results = [];
const problemRows = [];

fs.createReadStream('nola2_past_5_years.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(`Analyzing ${results.length} rows for problems...`);
    
    results.forEach((row, index) => {
      const problems = [];
      
      // Check date fields
      const dateFields = ['filingdate', 'issuedate', 'currentstatusdate', 'nextstatusdate'];
      dateFields.forEach(field => {
        if (row[field] && row[field].trim() !== '') {
          const date = new Date(row[field]);
          if (isNaN(date.getTime())) {
            problems.push(`Invalid ${field}: ${row[field]}`);
          }
        }
      });
      
      // Check numeric fields
      const numericFields = ['unpaidfees', 'totalfees', 'bldgarea', 'constrval', 'bondamount', 
                           'opencomments', 'totalinspections', 'beds', 'baths', 'secondfloo', 
                           'basementar', 'daysopen', 'daysissued'];
      numericFields.forEach(field => {
        if (row[field] && row[field].trim() !== '') {
          const num = parseFloat(row[field]);
          if (isNaN(num)) {
            problems.push(`Invalid ${field}: ${row[field]}`);
          }
        }
      });
      
      // Check boolean field
      if (row.isclosed && !['True', 'False', 'true', 'false', ''].includes(row.isclosed)) {
        problems.push(`Invalid isclosed: ${row.isclosed}`);
      }
      
      // Check for extremely long text fields
      const textFields = ['address', 'owner', 'description', 'applicant', 'contractors'];
      textFields.forEach(field => {
        if (row[field] && row[field].length > 1000) {
          problems.push(`${field} too long: ${row[field].length} characters`);
        }
      });
      
      if (problems.length > 0) {
        problemRows.push({
          rowNumber: index + 2, // +2 because CSV starts at row 2 (header is row 1)
          numstring: row.numstring || 'N/A',
          address: row.address || 'N/A',
          problems: problems
        });
      }
    });
    
    console.log(`Found ${problemRows.length} problem rows out of ${results.length} total rows`);
    
    if (problemRows.length > 0) {
      console.log('\nProblem rows:');
      problemRows.forEach(row => {
        console.log(`Row ${row.rowNumber} (${row.numstring}): ${row.address}`);
        row.problems.forEach(problem => console.log(`  - ${problem}`));
        console.log('');
      });
      
      // Write problem rows to file
      fs.writeFileSync('nola2-problem-rows.json', JSON.stringify(problemRows, null, 2));
      console.log('Problem rows saved to nola2-problem-rows.json');
    } else {
      console.log('No problem rows found!');
    }
  });