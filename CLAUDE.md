# Database Connection Guide

## Connecting to Supabase Database in Replit

### Getting Secrets
In Replit, Supabase secrets are available as environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` 
- `SUPABASE_CONNECTION_STRING`
- `SUPABASE_ANON_KEY`

### Database Connection Code
```javascript
const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } // Handles Supabase's SSL cert
});

// Example: Create a table
async function createTable() {
  try {
    const { rowCount } = await pool.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table created successfully', rowCount);
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await pool.end();
  }
}
```

### Required Package
```bash
npm install pg
```