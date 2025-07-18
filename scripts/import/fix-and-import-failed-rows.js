const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixAndImportFailedRows() {
  // First, alter the table to handle larger values
  console.log('Updating table schema to handle larger values...');
  
  await pool.query(`
    ALTER TABLE nola_permits 
    ALTER COLUMN constrval TYPE DECIMAL(12,2),
    ALTER COLUMN bldgarea TYPE DECIMAL(12,2),
    ALTER COLUMN bondamount TYPE DECIMAL(12,2);
  `);
  
  console.log('Schema updated successfully');
  
  const results = [];
  const problemBatches = [23000, 40000, 49000, 56000, 58000, 61000, 64000, 65000, 85000, 95000];
  
  // Read CSV file
  fs.createReadStream('nola1_past_5_years (1).csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log('Importing failed batches...');
      
      const batchSize = 1000;
      let imported = 0;
      
      for (const startRow of problemBatches) {
        const batch = results.slice(startRow, startRow + batchSize);
        
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
            ON CONFLICT DO NOTHING
          `, values);
          
          imported += batch.length;
          console.log(`Imported batch starting at row ${startRow}`);
        } catch (error) {
          console.error(`Error importing batch starting at row ${startRow}:`, error.message);
        }
      }
      
      console.log(`Import complete: ${imported} rows from failed batches imported`);
      
      // Check total count
      const result = await pool.query('SELECT COUNT(*) FROM nola_permits');
      console.log(`Total rows in table: ${result.rows[0].count}`);
      
      await pool.end();
    });
}

fixAndImportFailedRows();