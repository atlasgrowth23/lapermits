const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createNola2PermitsTable() {
  try {
    const { rowCount } = await pool.query(`
      CREATE TABLE IF NOT EXISTS nola2_permits (
        id SERIAL PRIMARY KEY,
        address TEXT,
        owner TEXT,
        description TEXT,
        numstring TEXT,
        isclosed BOOLEAN,
        type TEXT,
        code TEXT,
        division TEXT,
        m_s TEXT,
        filingdate TIMESTAMP,
        issuedate TIMESTAMP,
        currentstatus TEXT,
        nextstatus TEXT,
        currentstatusdate TIMESTAMP,
        nextstatusdate TIMESTAMP,
        landuse TEXT,
        landuseshort TEXT,
        unpaidfees DECIMAL(10,2),
        totalfees DECIMAL(10,2),
        bldgarea DECIMAL(10,2),
        constrval DECIMAL(10,2),
        bondamount DECIMAL(10,2),
        opencomments DECIMAL(10,2),
        applicant TEXT,
        totalinspections DECIMAL(10,2),
        contractors TEXT,
        pin TEXT,
        beds DECIMAL(10,2),
        baths DECIMAL(10,2),
        secondfloo DECIMAL(10,2),
        basementar DECIMAL(10,2),
        daysopen DECIMAL(10,2),
        daysissued DECIMAL(10,2),
        leadagency TEXT,
        subdivision TEXT,
        councildist TEXT,
        zoning TEXT,
        location_1 TEXT,
        historicdistrict TEXT,
        exitreason TEXT,
        projectname TEXT,
        heattype TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('nola2_permits table created successfully');
  } catch (error) {
    console.error('Error creating nola2_permits table:', error.message);
  } finally {
    await pool.end();
  }
}

createNola2PermitsTable();