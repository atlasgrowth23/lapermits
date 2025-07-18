import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get the permit details first to get the address
    const permitQuery = `
      SELECT originaladdress1, originalcity, originalstate, originalzip
      FROM nola_dataset2_trimmed
      WHERE id = $1
    `;
    
    const permitResult = await pool.query(permitQuery, [id]);
    
    if (permitResult.rows.length === 0) {
      return Response.json({ error: 'Permit not found' }, { status: 404 });
    }
    
    const permit = permitResult.rows[0];
    
    // Get all permits at the same address from the full dataset (not trimmed)
    const addressHistoryQuery = `
      SELECT 
        id,
        permitnum,
        description,
        applieddate,
        issuedate,
        completedate,
        statuscurrent,
        originaladdress1,
        originalcity,
        originalstate,
        originalzip,
        permitclass,
        workclass,
        permittype,
        totalsqft,
        contractorcompanyname,
        contractortrade,
        contractorlicnum,
        permitclassmapped,
        estprojectcost,
        fee,
        pin,
        CASE 
          WHEN LOWER(permitclassmapped) LIKE '%residential%' THEN 'Residential'
          ELSE 'Commercial-MF'
        END as property_type,
        CASE 
          WHEN LOWER(statuscurrent) LIKE '%void%' OR LOWER(statuscurrent) LIKE '%denied%' OR LOWER(statuscurrent) LIKE '%expired%' THEN 'Dead'
          WHEN LOWER(statuscurrent) LIKE '%complet%' OR LOWER(statuscurrent) LIKE '%final%' OR LOWER(statuscurrent) LIKE '%occupancy%' THEN 'Completed'
          WHEN issuedate IS NOT NULL THEN 'Issued'
          WHEN LOWER(statuscurrent) LIKE '%submit%' OR LOWER(statuscurrent) LIKE '%review%' OR LOWER(statuscurrent) LIKE '%approv%' THEN 'Pending'
          ELSE 'Other'
        END as main_status,
        CASE 
          WHEN LOWER(statuscurrent) LIKE '%void%' OR LOWER(statuscurrent) LIKE '%denied%' OR LOWER(statuscurrent) LIKE '%expired%' THEN 'red'
          WHEN LOWER(statuscurrent) LIKE '%complet%' OR LOWER(statuscurrent) LIKE '%final%' OR LOWER(statuscurrent) LIKE '%occupancy%' THEN 'blue'
          WHEN issuedate IS NOT NULL THEN 'green'
          ELSE 'yellow'
        END as status_color
      FROM nola_dataset2
      WHERE LOWER(originaladdress1) = LOWER($1)
        AND LOWER(originalcity) = LOWER($2)
        AND LOWER(originalstate) = LOWER($3)
        AND originalzip = $4
      ORDER BY applieddate DESC
    `;
    
    const historyResult = await pool.query(addressHistoryQuery, [
      permit.originaladdress1,
      permit.originalcity, 
      permit.originalstate,
      permit.originalzip
    ]);
    
    return Response.json(historyResult.rows);
    
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}