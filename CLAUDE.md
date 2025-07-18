# LA Permits - Sales Intelligence Platform

## Project Overview

LA Permits is a sales intelligence web application built for Orleans Steel, a New Orleans-based steel and metal building materials company. The application analyzes permit data to identify construction projects that would need Orleans Steel's products (fencing, gates, R-panels, structural studs, roofing materials, etc.).

## Architecture

### Tech Stack
- **Frontend**: Next.js 13 with React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Database**: PostgreSQL (Supabase)
- **API**: Next.js API routes
- **Deployment**: Replit

### Database Schema

The application uses 4 main tables:
1. **`baton_rouge_permits`** - Baton Rouge permit data (47,421 permits)
2. **`nola_dataset1`** - Original New Orleans format (96,229 permits)
3. **`nola_dataset2`** - BLDS format New Orleans data (146,003 permits)
4. **`nola_dataset2_trimmed`** - Filtered to 9 relevant permit codes (50,060 permits)

### Key Features

#### 1. Smart Filtering
- Filters permits to 9 codes most relevant to Orleans Steel's business
- Removes irrelevant permits (DEMO, HVAC, SOLR, LOOP, etc.)
- Focuses on structural work, new construction, and renovations

#### 2. Dynamic Permit Modal
- **Overview Tab**: Complete permit details with status, financials, contractor info
- **Address History Tab**: Shows all permits at the same address from full dataset
- **Dynamic Permit Tabs**: Click any permit to open detailed view in new closeable tab
- **Multiple Tabs**: Support for multiple permit tabs open simultaneously

#### 3. Smart Status Logic
- **Green (Issued)**: Construction happening - permits with issue date
- **Yellow (Pending)**: Applied but not yet issued
- **Blue (Completed)**: Project finished
- **Red (Dead)**: Voided, expired, or denied permits

#### 4. Advanced Search & Filtering
- Full-text search across descriptions, addresses, contractors
- Filter by permit type, status, and other criteria
- Sortable columns with smart date logic

### Database Connection

#### Environment Variables
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_CONNECTION_STRING=your_connection_string
SUPABASE_ANON_KEY=your_anon_key
```

#### Connection Code
```javascript
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});
```

### API Endpoints

#### GET /api/permits
- Fetches filtered permit data with pagination
- Supports search, sorting, and filtering
- Returns permits from `nola_dataset2_trimmed` table

#### GET /api/permits/[id]/address-history
- Fetches all permits at the same address
- Uses full `nola_dataset2` dataset (not trimmed)
- Returns comprehensive permit history for address

### File Structure

```
app/
├── api/permits/
│   ├── route.js                    # Main permits API
│   └── [id]/address-history/
│       └── route.js                # Address history API
├── components/
│   ├── PermitModal.jsx            # Dynamic tabbed modal
│   └── PermitsTable.jsx           # Main data table
├── layout.tsx                     # Root layout
└── page.js                        # Main page

scripts/
├── database/                      # Database setup scripts
│   ├── create-br-permits-table.js
│   ├── create-nola-blds-table.js
│   └── create-nola2-permits-table.js
└── import/                        # Data import scripts
    ├── bulk-import-br-csv.js
    ├── bulk-import-nola2-csv.js
    └── fetch-nola-blds-api.js

Essential Scripts:
├── fix-table-names.js             # Rename tables to simple names
└── trim-dataset2-further.js       # Filter to 9 relevant codes
```

### Orleans Steel Product Mapping

The application filters permits based on relevance to Orleans Steel's catalog:
- **Gates & Fencing**: Residential and commercial security
- **R-Panels**: Metal roofing and siding
- **Structural Components**: Steel studs, beams, supports
- **Accessories**: Hardware, fasteners, trim

### Permit Code Priority

**Top Priority (⭐):**
- **NEWC**: New Construction - Highest value for structural steel
- **RNVS**: Renovation (Structural) - Major renovations needing materials

**High Priority:**
- **RNVN**: Renovation (Non-Structural) - Interior work, may need materials  
- **SERV**: Service/Electrical - Often requires structural work
- **ACCS**: Accessory Structure - Fences, gates, outbuildings
- **ROOF**: Roofing - Direct R-panel sales opportunity

**Medium Priority:**
- **POOL**: Pool construction - Fencing requirements
- **DEMI**: Demolition Interior - Prep work for renovations
- **SAPP**: Special Application - Case-by-case evaluation

### Development Notes

#### Status Logic
The application uses smart date logic to determine permit status:
- Checks issue date, completion date, and status text
- Prioritizes actual dates over status text when available
- Handles edge cases like voided/expired permits

#### Future Enhancements
- **Contractor History Tab**: Show all permits by contractor
- **Financial Analysis**: Project value trends and insights
- **Geographic Mapping**: Visual permit distribution
- **Lead Scoring**: Rank permits by sales potential

### Important Instructions
- Always use the trimmed dataset for main views
- Use full dataset only for address/contractor history
- Maintain color-coded status system for user clarity
- Keep permit codes focused on Orleans Steel's business needs