const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function importNola2CSV() {
  const results = [];
  
  fs.createReadStream('nola2_past_5_years.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Processing ${results.length} rows...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of results) {
        try {
          const query = `
            INSERT INTO nola2_permits (
              address, owner, description, numstring, isclosed, type, code, division, m_s,
              filingdate, issuedate, currentstatus, nextstatus, currentstatusdate, nextstatusdate,
              landuse, landuseshort, unpaidfees, totalfees, bldgarea, constrval, bondamount,
              opencomments, applicant, totalinspections, contractors, pin, beds, baths,
              secondfloo, basementar, daysopen, daysissued, leadagency, subdivision,
              councildist, zoning, location_1, historicdistrict, exitreason, projectname, heattype
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
              $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
              $33, $34, $35, $36, $37, $38, $39, $40, $41, $42
            )
          `;
          
          const values = [
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
          ];
          
          await pool.query(query, values);
          successCount++;
          
          if (successCount % 1000 === 0) {
            console.log(`Processed ${successCount} rows successfully`);
          }
          
        } catch (error) {
          errorCount++;
          console.error(`Error inserting row ${successCount + errorCount}:`, error.message);
        }
      }
      
      console.log(`Import completed: ${successCount} successful, ${errorCount} errors`);
      await pool.end();
    });
}

importNola2CSV();