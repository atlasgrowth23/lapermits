const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function bulkImportCSV() {
  const results = [];
  
  // Read CSV file
  fs.createReadStream('nola1_past_5_years (1).csv')
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
          const baseIndex = index * 42;
          placeholders.push(`(${Array.from({length: 42}, (_, i) => `$${baseIndex + i + 1}`).join(', ')})`);
          
          values.push(
            row.address || null,
            row.owner || null,
            row.description || null,
            row.numstring || null,
            row.isclosed === 'True',
            row.type || null,
            row.code || null,
            row.division || null,
            row.m_s || null,
            row.filingdate ? new Date(row.filingdate) : null,
            row.issuedate ? new Date(row.issuedate) : null,
            row.currentstatus || null,
            row.nextstatus || null,
            row.currentstatusdate ? new Date(row.currentstatusdate) : null,
            row.nextstatusdate ? new Date(row.nextstatusdate) : null,
            row.landuse || null,
            row.landuseshort || null,
            row.unpaidfees ? parseFloat(row.unpaidfees) : null,
            row.totalfees ? parseFloat(row.totalfees) : null,
            row.bldgarea ? parseFloat(row.bldgarea) : null,
            row.constrval ? parseFloat(row.constrval) : null,
            row.bondamount ? parseFloat(row.bondamount) : null,
            row.opencomments ? parseFloat(row.opencomments) : null,
            row.applicant || null,
            row.totalinspections ? parseFloat(row.totalinspections) : null,
            row.contractors || null,
            row.pin || null,
            row.beds ? parseFloat(row.beds) : null,
            row.baths ? parseFloat(row.baths) : null,
            row.secondfloo ? parseFloat(row.secondfloo) : null,
            row.basementar ? parseFloat(row.basementar) : null,
            row.daysopen ? parseFloat(row.daysopen) : null,
            row.daysissued ? parseFloat(row.daysissued) : null,
            row.leadagency || null,
            row.subdivision || null,
            row.councildist || null,
            row.zoning || null,
            row.location_1 || null,
            row.historicdistrict || null,
            row.exitreason || null,
            row.projectname || null,
            row.heattype || null
          );
        });
        
        try {
          await pool.query(`
            INSERT INTO nola_permits (
              address, owner, description, numstring, isclosed, type, code, division, m_s,
              filingdate, issuedate, currentstatus, nextstatus, currentstatusdate, nextstatusdate,
              landuse, landuseshort, unpaidfees, totalfees, bldgarea, constrval, bondamount,
              opencomments, applicant, totalinspections, contractors, pin, beds, baths,
              secondfloo, basementar, daysopen, daysissued, leadagency, subdivision,
              councildist, zoning, location_1, historicdistrict, exitreason, projectname, heattype
            ) VALUES ${placeholders.join(', ')}
          `, values);
          
          imported += batch.length;
          console.log(`Imported ${imported}/${results.length} rows (${Math.round(imported/results.length*100)}%)`);
        } catch (error) {
          console.error(`Error importing batch starting at row ${i}:`, error.message);
        }
      }
      
      console.log(`Import complete: ${imported} rows imported`);
      await pool.end();
    });
}

bulkImportCSV();