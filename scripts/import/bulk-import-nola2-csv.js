const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function bulkImportNola2CSV() {
  const results = [];
  
  fs.createReadStream('nola2_past_5_years.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Processing ${results.length} rows in batches of 1000...`);
      
      let successCount = 0;
      let errorCount = 0;
      const batchSize = 1000;
      
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        
        try {
          const values = [];
          const placeholders = [];
          
          batch.forEach((row, index) => {
            const baseIndex = index * 42;
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12}, $${baseIndex + 13}, $${baseIndex + 14}, $${baseIndex + 15}, $${baseIndex + 16}, $${baseIndex + 17}, $${baseIndex + 18}, $${baseIndex + 19}, $${baseIndex + 20}, $${baseIndex + 21}, $${baseIndex + 22}, $${baseIndex + 23}, $${baseIndex + 24}, $${baseIndex + 25}, $${baseIndex + 26}, $${baseIndex + 27}, $${baseIndex + 28}, $${baseIndex + 29}, $${baseIndex + 30}, $${baseIndex + 31}, $${baseIndex + 32}, $${baseIndex + 33}, $${baseIndex + 34}, $${baseIndex + 35}, $${baseIndex + 36}, $${baseIndex + 37}, $${baseIndex + 38}, $${baseIndex + 39}, $${baseIndex + 40}, $${baseIndex + 41}, $${baseIndex + 42})`);
            
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
          
          const query = `
            INSERT INTO nola2_permits (
              address, owner, description, numstring, isclosed, type, code, division, m_s,
              filingdate, issuedate, currentstatus, nextstatus, currentstatusdate, nextstatusdate,
              landuse, landuseshort, unpaidfees, totalfees, bldgarea, constrval, bondamount,
              opencomments, applicant, totalinspections, contractors, pin, beds, baths,
              secondfloo, basementar, daysopen, daysissued, leadagency, subdivision,
              councildist, zoning, location_1, historicdistrict, exitreason, projectname, heattype
            ) VALUES ${placeholders.join(', ')}
          `;
          
          await pool.query(query, values);
          successCount += batch.length;
          console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${successCount} total rows imported`);
          
        } catch (error) {
          errorCount += batch.length;
          console.error(`Error importing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        }
      }
      
      console.log(`Import completed: ${successCount} successful, ${errorCount} errors`);
      await pool.end();
    });
}

bulkImportNola2CSV();