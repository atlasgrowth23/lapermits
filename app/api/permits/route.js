import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'applieddate';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const permitType = searchParams.get('permitType') || '';
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;
    
    // Search filter
    if (search) {
      whereClause += ` AND (
        LOWER(description) LIKE LOWER($${paramIndex}) OR 
        LOWER(originaladdress1) LIKE LOWER($${paramIndex}) OR 
        LOWER(contractorcompanyname) LIKE LOWER($${paramIndex}) OR
        LOWER(permittype) LIKE LOWER($${paramIndex})
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Permit type filter
    if (permitType) {
      whereClause += ` AND permittype = $${paramIndex}`;
      queryParams.push(permitType);
      paramIndex++;
    }
    
    // Status filter
    if (status) {
      whereClause += ` AND statuscurrent = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    // Main query with smart date logic
    const query = `
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
        permitclassmapped,
        estprojectcost,
        fee,
        CASE 
          WHEN LOWER(statuscurrent) LIKE '%void%' OR LOWER(statuscurrent) LIKE '%denied%' OR LOWER(statuscurrent) LIKE '%expired%' THEN applieddate
          WHEN LOWER(statuscurrent) LIKE '%complet%' OR LOWER(statuscurrent) LIKE '%final%' OR LOWER(statuscurrent) LIKE '%occupancy%' THEN completedate
          WHEN issuedate IS NOT NULL THEN issuedate
          ELSE applieddate
        END as smart_date,
        CASE 
          WHEN LOWER(statuscurrent) LIKE '%void%' OR LOWER(statuscurrent) LIKE '%denied%' OR LOWER(statuscurrent) LIKE '%expired%' THEN 'Applied'
          WHEN LOWER(statuscurrent) LIKE '%complet%' OR LOWER(statuscurrent) LIKE '%final%' OR LOWER(statuscurrent) LIKE '%occupancy%' THEN 'Completed'
          WHEN issuedate IS NOT NULL THEN 'Issued'
          ELSE 'Applied'
        END as date_type,
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
          WHEN LOWER(statuscurrent) LIKE '%sub%permit%issued%' THEN 'Sub-Permits Issued'
          WHEN LOWER(statuscurrent) LIKE '%sub%permit%final%' THEN 'Sub-Permits Finaled'
          ELSE NULL
        END as sub_status,
        CASE 
          WHEN LOWER(statuscurrent) LIKE '%void%' OR LOWER(statuscurrent) LIKE '%denied%' OR LOWER(statuscurrent) LIKE '%expired%' THEN 'red'
          WHEN LOWER(statuscurrent) LIKE '%complet%' OR LOWER(statuscurrent) LIKE '%final%' OR LOWER(statuscurrent) LIKE '%occupancy%' THEN 'blue'
          WHEN issuedate IS NOT NULL THEN 'green'
          ELSE 'yellow'
        END as status_color
      FROM nola_dataset2_trimmed
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nola_dataset2_trimmed
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    
    return Response.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}