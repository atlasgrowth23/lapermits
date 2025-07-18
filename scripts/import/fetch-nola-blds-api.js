const { Pool } = require('pg');
const https = require('https');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fetchNolaBLDSData() {
  try {
    console.log('Fetching NOLA BLDS permits data for past 5 years...');
    
    // Calculate date 5 years ago
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const startDate = fiveYearsAgo.toISOString().split('T')[0];
    
    console.log(`Fetching data from ${startDate} to present`);
    
    let offset = 0;
    let limit = 1000;
    let totalProcessed = 0;
    let hasMoreData = true;
    
    while (hasMoreData) {
      const url = `https://data.nola.gov/resource/72f9-bi28.json?$limit=${limit}&$offset=${offset}&$where=applieddate >= '${startDate}T00:00:00.000'&$order=applieddate ASC`;
      
      console.log(`Fetching batch ${Math.floor(offset / limit) + 1} (offset: ${offset})...`);
      
      try {
        const data = await fetchData(url);
        
        if (data.length === 0) {
          console.log('No more data to fetch');
          hasMoreData = false;
          break;
        }
        
        console.log(`Received ${data.length} records`);
        
        // Process data in bulk insert
        try {
          const values = [];
          const placeholders = [];
          
          data.forEach((record, index) => {
            const baseIndex = index * 33;
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12}, $${baseIndex + 13}, $${baseIndex + 14}, $${baseIndex + 15}, $${baseIndex + 16}, $${baseIndex + 17}, $${baseIndex + 18}, $${baseIndex + 19}, $${baseIndex + 20}, $${baseIndex + 21}, $${baseIndex + 22}, $${baseIndex + 23}, $${baseIndex + 24}, $${baseIndex + 25}, $${baseIndex + 26}, $${baseIndex + 27}, $${baseIndex + 28}, $${baseIndex + 29}, $${baseIndex + 30}, $${baseIndex + 31}, $${baseIndex + 32}, $${baseIndex + 33})`);
            
            values.push(
              record.permitnum || null,
              record.description || null,
              record.applieddate ? new Date(record.applieddate) : null,
              record.issuedate ? new Date(record.issuedate) : null,
              record.completedate ? new Date(record.completedate) : null,
              record.statuscurrent || null,
              record.originaladdress1 || null,
              record.originalcity || null,
              record.originalstate || null,
              record.originalzip || null,
              record.permitclass || null,
              record.workclass || null,
              record.permittype || null,
              record.permittypedesc || null,
              record.statusdate ? new Date(record.statusdate) : null,
              record.totalsqft ? parseFloat(record.totalsqft) : null,
              record.link || null,
              record.location ? JSON.stringify(record.location) : null,
              record.estprojectcost ? parseFloat(record.estprojectcost) : null,
              record.pin || null,
              record.contractorcompanyname || null,
              record.contractortrade || null,
              record.contractortrademapped || null,
              record.contractorlicnum || null,
              record.contractorstatelic || null,
              record.expiresdate ? new Date(record.expiresdate) : null,
              record.coissueddate ? new Date(record.coissueddate) : null,
              record.publisher || null,
              record.fee ? parseFloat(record.fee) : null,
              record.workclassmapped || null,
              record.permitclassmapped || null,
              record.permittypemapped || null,
              record.statuscurrentmapped || null
            );
          });
          
          const query = `
            INSERT INTO nola_permits_72f9_bi28 (
              permitnum, description, applieddate, issuedate, completedate, statuscurrent,
              originaladdress1, originalcity, originalstate, originalzip, permitclass, workclass,
              permittype, permittypedesc, statusdate, totalsqft, link, location, estprojectcost,
              pin, contractorcompanyname, contractortrade, contractortrademapped, contractorlicnum,
              contractorstatelic, expiresdate, coissueddate, publisher, fee, workclassmapped,
              permitclassmapped, permittypemapped, statuscurrentmapped
            ) VALUES ${placeholders.join(', ')}
          `;
          
          await pool.query(query, values);
          totalProcessed += data.length;
          console.log(`Processed ${totalProcessed} records so far...`);
          
        } catch (error) {
          console.error(`Error inserting batch:`, error.message);
        }
        
        offset += limit;
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching batch at offset ${offset}:`, error.message);
        break;
      }
    }
    
    console.log(`\nImport completed: ${totalProcessed} records processed`);
    
    // Get final count
    const result = await pool.query('SELECT COUNT(*) FROM nola_permits_72f9_bi28');
    console.log(`Total rows in table: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('Error in fetchNolaBLDSData:', error.message);
  } finally {
    await pool.end();
  }
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse JSON: ' + error.message));
        }
      });
      
    }).on('error', (error) => {
      reject(error);
    });
  });
}

fetchNolaBLDSData();