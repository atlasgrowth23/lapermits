const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function bulkImportBRCSV() {
  const results = [];
  
  // Read CSV file
  fs.createReadStream('br_past_5_years.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} rows to import`);
      
      // Process in batches of 1000
      const batchSize = 1000;
      let imported = 0;
      
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        
        // Build bulk insert query
        const values = [];
        const placeholders = [];
        
        batch.forEach((row, index) => {
          const baseIndex = index * 25;
          placeholders.push(`(${Array.from({length: 25}, (_, i) => `$${baseIndex + i + 1}`).join(', ')})`);
          
          values.push(
            row.permitid || null,
            row.permitnumber || null,
            row.permittype || null,
            row.designation || null,
            row.projectdescription || null,
            row.squarefootage ? parseFloat(row.squarefootage) : null,
            row.projectvalue ? parseFloat(row.projectvalue) : null,
            row.permitfee ? parseFloat(row.permitfee) : null,
            row.creationdate ? new Date(row.creationdate) : null,
            row.issueddate ? new Date(row.issueddate) : null,
            row.address || null,
            row.streetaddress || null,
            row.city1 || null,
            row.state1 || null,
            row.zip || null,
            row.parishname || null,
            row.ownername || null,
            row.applicantname || null,
            row.contractorname || null,
            row.contractoraddress || null,
            row.lat ? parseFloat(row.lat) : null,
            row.long ? parseFloat(row.long) : null,
            row.geolocation || null,
            row.lotnumber || null,
            row.subdivision || null
          );
        });
        
        try {
          await pool.query(`
            INSERT INTO br_permits (
              permitid, permitnumber, permittype, designation, projectdescription,
              squarefootage, projectvalue, permitfee, creationdate, issueddate,
              address, streetaddress, city1, state1, zip, parishname,
              ownername, applicantname, contractorname, contractoraddress,
              lat, long, geolocation, lotnumber, subdivision
            ) VALUES ${placeholders.join(', ')}
          `, values);
          
          imported += batch.length;
          console.log(`Imported ${imported}/${results.length} rows (${Math.round(imported/results.length*100)}%)`);
        } catch (error) {
          console.error(`Error importing batch starting at row ${i}:`, error.message);
        }
      }
      
      console.log(`Import complete: ${imported} rows imported`);
      
      // Check total count
      const result = await pool.query('SELECT COUNT(*) FROM br_permits');
      console.log(`Total rows in br_permits table: ${result.rows[0].count}`);
      
      await pool.end();
    });
}

bulkImportBRCSV();