const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixTableNames() {
  try {
    console.log('Fixing table names to be simple...');
    
    // Rename to simple, clear names
    await pool.query('ALTER TABLE baton_rouge_permits_all RENAME TO baton_rouge_permits');
    console.log('✓ baton_rouge_permits_all → baton_rouge_permits');
    
    await pool.query('ALTER TABLE new_orleans_permits_all RENAME TO nola_dataset1');
    console.log('✓ new_orleans_permits_all → nola_dataset1');
    
    await pool.query('ALTER TABLE new_orleans_permits_blds_all RENAME TO nola_dataset2');
    console.log('✓ new_orleans_permits_blds_all → nola_dataset2');
    
    await pool.query('ALTER TABLE new_orleans_permits_orleans_steel RENAME TO nola_dataset2_trimmed');
    console.log('✓ new_orleans_permits_orleans_steel → nola_dataset2_trimmed');
    
    // Show final table names and counts
    console.log('\\n=== FINAL SIMPLE TABLE NAMES ===');
    
    const tables = [
      'baton_rouge_permits',
      'nola_dataset1', 
      'nola_dataset2',
      'nola_dataset2_trimmed'
    ];
    
    for (const table of tables) {
      const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${count.rows[0].count} permits`);
    }
    
    console.log('\\n✅ Table names are now simple and clear!');
    console.log('Working dataset: nola_dataset2_trimmed (13 codes for Orleans Steel)');
    
  } catch (error) {
    console.error('Error fixing table names:', error.message);
  } finally {
    await pool.end();
  }
}

fixTableNames();