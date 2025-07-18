const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createNolaBLDSTable() {
  try {
    const { rowCount } = await pool.query(`
      CREATE TABLE IF NOT EXISTS nola_permits_72f9_bi28 (
        id SERIAL PRIMARY KEY,
        permitnum TEXT,
        description TEXT,
        applieddate TIMESTAMP,
        issuedate TIMESTAMP,
        completedate TIMESTAMP,
        statuscurrent TEXT,
        originaladdress1 TEXT,
        originalcity TEXT,
        originalstate TEXT,
        originalzip TEXT,
        permitclass TEXT,
        workclass TEXT,
        permittype TEXT,
        permittypedesc TEXT,
        statusdate TIMESTAMP,
        totalsqft DECIMAL(15,2),
        link TEXT,
        location TEXT,
        estprojectcost DECIMAL(15,2),
        pin TEXT,
        contractorcompanyname TEXT,
        contractortrade TEXT,
        contractortrademapped TEXT,
        contractorlicnum TEXT,
        contractorstatelic TEXT,
        expiresdate TIMESTAMP,
        coissueddate TIMESTAMP,
        publisher TEXT,
        fee DECIMAL(15,2),
        workclassmapped TEXT,
        permitclassmapped TEXT,
        permittypemapped TEXT,
        statuscurrentmapped TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('nola_permits_72f9_bi28 table created successfully');
  } catch (error) {
    console.error('Error creating nola_permits_72f9_bi28 table:', error.message);
  } finally {
    await pool.end();
  }
}

createNolaBLDSTable();