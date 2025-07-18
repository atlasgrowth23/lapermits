const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Remove these 4 codes
const removeCodes = ['DEMO', 'HVAC', 'SOLR', 'LOOP'];

async function trimDataset2Further() {
  try {
    console.log('Trimming dataset2 further by removing 4 codes...');
    
    // Show what we're removing
    console.log('\\nRemoving these codes:');
    for (const code of removeCodes) {
      const count = await pool.query(`
        SELECT COUNT(*) FROM nola_dataset2_trimmed 
        WHERE permittype = $1
      `, [code]);
      console.log(`${code}: ${count.rows[0].count} permits`);
    }
    
    // Create new trimmed table
    await pool.query('DROP TABLE IF EXISTS nola_dataset2_trimmed_v2');
    
    await pool.query(`
      CREATE TABLE nola_dataset2_trimmed_v2 AS
      SELECT * FROM nola_dataset2_trimmed
      WHERE permittype NOT IN (${removeCodes.map(code => `'${code}'`).join(', ')})
    `);
    
    // Get counts
    const originalCount = await pool.query('SELECT COUNT(*) FROM nola_dataset2_trimmed');
    const newCount = await pool.query('SELECT COUNT(*) FROM nola_dataset2_trimmed_v2');
    
    console.log('\\n=== TRIMMING RESULTS ===');
    console.log(`Before: ${originalCount.rows[0].count} permits`);
    console.log(`After: ${newCount.rows[0].count} permits`);
    console.log(`Removed: ${originalCount.rows[0].count - newCount.rows[0].count} permits`);
    
    // Show remaining permit codes
    const remainingCodes = await pool.query(`
      SELECT permittype, COUNT(*) as count 
      FROM nola_dataset2_trimmed_v2 
      GROUP BY permittype 
      ORDER BY count DESC
    `);
    
    console.log('\\nRemaining codes:');
    remainingCodes.rows.forEach(row => {
      console.log(`${row.permittype}: ${row.count}`);
    });
    
    // Replace the old table with the new one
    await pool.query('DROP TABLE nola_dataset2_trimmed');
    await pool.query('ALTER TABLE nola_dataset2_trimmed_v2 RENAME TO nola_dataset2_trimmed');
    
    console.log('\\n✅ Dataset2 trimmed further!');
    console.log(`Final count: ${newCount.rows[0].count} permits with ${remainingCodes.rows.length} codes`);
    
  } catch (error) {
    console.error('Error trimming dataset2:', error.message);
  } finally {
    await pool.end();
  }
}

trimDataset2Further();