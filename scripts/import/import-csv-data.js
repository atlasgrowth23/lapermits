const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function importCSVData() {
  const results = [];
  
  // Read CSV file
  fs.createReadStream('nola1_past_5_years (1).csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} rows to import`);
      
      let imported = 0;
      let errors = 0;
      
      for (const row of results) {
        try {
          // Convert string values to appropriate types
          const processedRow = {
            address: row.address || null,
            owner: row.owner || null,
            description: row.description || null,
            numstring: row.numstring || null,
            isclosed: row.isclosed === 'True',
            type: row.type || null,
            code: row.code || null,
            division: row.division || null,
            m_s: row.m_s || null,
            filingdate: row.filingdate ? new Date(row.filingdate) : null,
            issuedate: row.issuedate ? new Date(row.issuedate) : null,
            currentstatus: row.currentstatus || null,
            nextstatus: row.nextstatus || null,
            currentstatusdate: row.currentstatusdate ? new Date(row.currentstatusdate) : null,
            nextstatusdate: row.nextstatusdate ? new Date(row.nextstatusdate) : null,
            landuse: row.landuse || null,
            landuseshort: row.landuseshort || null,
            unpaidfees: row.unpaidfees ? parseFloat(row.unpaidfees) : null,
            totalfees: row.totalfees ? parseFloat(row.totalfees) : null,
            bldgarea: row.bldgarea ? parseFloat(row.bldgarea) : null,
            constrval: row.constrval ? parseFloat(row.constrval) : null,
            bondamount: row.bondamount ? parseFloat(row.bondamount) : null,
            opencomments: row.opencomments ? parseFloat(row.opencomments) : null,
            applicant: row.applicant || null,
            totalinspections: row.totalinspections ? parseFloat(row.totalinspections) : null,
            contractors: row.contractors || null,
            pin: row.pin || null,
            beds: row.beds ? parseFloat(row.beds) : null,
            baths: row.baths ? parseFloat(row.baths) : null,
            secondfloo: row.secondfloo ? parseFloat(row.secondfloo) : null,
            basementar: row.basementar ? parseFloat(row.basementar) : null,
            daysopen: row.daysopen ? parseFloat(row.daysopen) : null,
            daysissued: row.daysissued ? parseFloat(row.daysissued) : null,
            leadagency: row.leadagency || null,
            subdivision: row.subdivision || null,
            councildist: row.councildist || null,
            zoning: row.zoning || null,
            location_1: row.location_1 || null,
            historicdistrict: row.historicdistrict || null,
            exitreason: row.exitreason || null,
            projectname: row.projectname || null,
            heattype: row.heattype || null
          };
          
          await pool.query(`
            INSERT INTO nola_permits (
              address, owner, description, numstring, isclosed, type, code, division, m_s,
              filingdate, issuedate, currentstatus, nextstatus, currentstatusdate, nextstatusdate,
              landuse, landuseshort, unpaidfees, totalfees, bldgarea, constrval, bondamount,
              opencomments, applicant, totalinspections, contractors, pin, beds, baths,
              secondfloo, basementar, daysopen, daysissued, leadagency, subdivision,
              councildist, zoning, location_1, historicdistrict, exitreason, projectname, heattype
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
              $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
              $35, $36, $37, $38, $39, $40, $41, $42
            )
          `, Object.values(processedRow));
          
          imported++;
          if (imported % 100 === 0) {
            console.log(`Imported ${imported} rows...`);
          }
        } catch (error) {
          errors++;
          console.error(`Error importing row ${imported + errors}:`, error.message);
        }
      }
      
      console.log(`Import complete: ${imported} rows imported, ${errors} errors`);
      await pool.end();
    });
}

importCSVData();