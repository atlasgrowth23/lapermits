const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createBRPermitsTable() {
  try {
    const { rowCount } = await pool.query(`
      CREATE TABLE IF NOT EXISTS br_permits (
        id SERIAL PRIMARY KEY,
        permitid TEXT,
        permitnumber TEXT,
        permittype TEXT,
        designation TEXT,
        projectdescription TEXT,
        squarefootage DECIMAL(12,2),
        projectvalue DECIMAL(12,2),
        permitfee DECIMAL(12,2),
        creationdate TIMESTAMP,
        issueddate TIMESTAMP,
        address TEXT,
        streetaddress TEXT,
        city1 TEXT,
        state1 TEXT,
        zip TEXT,
        parishname TEXT,
        ownername TEXT,
        applicantname TEXT,
        contractorname TEXT,
        contractoraddress TEXT,
        lat DECIMAL(15,10),
        long DECIMAL(15,10),
        geolocation TEXT,
        lotnumber TEXT,
        subdivision TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('BR permits table created successfully');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await pool.end();
  }
}

createBRPermitsTable();