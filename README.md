# LA Permits - Sales Intelligence Platform

A Next.js web application for analyzing permit data to identify sales opportunities for Orleans Steel's construction materials business.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase)
- Environment variables configured

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/atlasgrowth23/lapermits.git
cd lapermits
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_CONNECTION_STRING=your_connection_string
SUPABASE_ANON_KEY=your_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Setup

### 1. Create Database Tables
Run the database setup scripts in order:

```bash
# Create main tables
node scripts/database/create-br-permits-table.js
node scripts/database/create-nola-permits-table.js
node scripts/database/create-nola2-permits-table.js
```

### 2. Import Data
```bash
# Import CSV data
node scripts/import/bulk-import-br-csv.js
node scripts/import/bulk-import-nola2-csv.js

# Or fetch from API
node scripts/import/fetch-nola-blds-api.js
```

### 3. Clean and Filter Data
```bash
# Rename tables to simple names
node fix-table-names.js

# Filter to Orleans Steel relevant codes
node trim-dataset2-further.js
```

## 🏗️ Architecture

### Frontend Components
- **PermitsTable.jsx** - Main data table with search, sorting, and filtering
- **PermitModal.jsx** - Dynamic tabbed modal for permit details
- **Layout.tsx** - Root layout with Tailwind CSS

### API Routes
- **GET /api/permits** - Paginated permit data with filtering
- **GET /api/permits/[id]/address-history** - All permits at same address

### Database Schema
- **nola_dataset2_trimmed** - 9 relevant permit codes (50K permits)
- **nola_dataset2** - Full dataset for address/contractor history
- **baton_rouge_permits** - Baton Rouge permit data
- **nola_dataset1** - Original New Orleans format

## 🎯 Key Features

### Smart Filtering
- Focuses on 9 permit codes most relevant to Orleans Steel
- Removes irrelevant permits (DEMO, HVAC, SOLR, LOOP)
- Prioritizes structural work and new construction

### Dynamic Modal System
- **Overview Tab** - Complete permit details
- **Address History Tab** - All permits at same address  
- **Dynamic Permit Tabs** - Click permits to open detailed views
- **Closeable Tabs** - Multiple permits can be viewed simultaneously

### Status Color Coding
- 🟢 **Green (Issued)** - Construction happening
- 🟡 **Yellow (Pending)** - Applied but not issued
- 🔵 **Blue (Completed)** - Project finished
- 🔴 **Red (Dead)** - Voided/expired/denied

### Search & Filtering
- Full-text search across descriptions, addresses, contractors
- Filter by permit type, status, property type
- Sortable columns with smart date logic

## 🛠️ Development

### Project Structure
```
app/
├── api/permits/           # API routes
├── components/            # React components
├── layout.tsx             # Root layout
└── page.js               # Main page

scripts/
├── database/             # Database setup
└── import/               # Data import utilities

Root files:
├── fix-table-names.js    # Rename tables
└── trim-dataset2-further.js  # Filter data
```

### Key Scripts
- **fix-table-names.js** - Renames tables to simple names
- **trim-dataset2-further.js** - Filters to 9 relevant permit codes
- **scripts/database/** - Database table creation
- **scripts/import/** - Data import utilities

## 📈 Orleans Steel Business Logic

### Permit Code Priorities

**Top Priority (⭐)**
- **NEWC** - New Construction (highest value for structural steel)
- **RNVS** - Renovation (Structural) (major renovations)

**High Priority**
- **RNVN** - Renovation (Non-Structural)
- **SERV** - Service/Electrical
- **ACCS** - Accessory Structure (fences, gates)
- **ROOF** - Roofing (R-panel sales)

**Medium Priority**
- **POOL** - Pool construction (fencing requirements)
- **DEMI** - Demolition Interior
- **SAPP** - Special Application

### Product Mapping
- **Gates & Fencing** - Residential and commercial security
- **R-Panels** - Metal roofing and siding
- **Structural Components** - Steel studs, beams, supports
- **Accessories** - Hardware, fasteners, trim

## 🔮 Future Enhancements

- **Contractor History Tab** - Show all permits by contractor
- **Financial Analysis** - Project value trends and insights
- **Geographic Mapping** - Visual permit distribution
- **Lead Scoring** - Rank permits by sales potential
- **Export Functionality** - CSV/PDF export for sales team
- **Email Alerts** - Notify about new relevant permits

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is private and proprietary to Orleans Steel.

## 🤝 Support

For questions or support, contact the development team or create an issue in the repository.

---

**Built with ❤️ for Orleans Steel's sales intelligence needs**