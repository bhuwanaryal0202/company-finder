# CompanyFinder - B2B Company Search Platform

CompanyFinder is a streamlined B2B company search platform that transforms Australian government company data into an intuitive search interface. Users can discover companies through multiple search criteria, view detailed company profiles, and export results for business development purposes.

## Core Features

1. **Smart Search Interface** - Search by company name with real-time results
2. **Advanced Filtering** - Filter by industry, state, and company status
3. **Company Profiles** - Detailed view of company information
4. **Data Export** - Export search results to CSV format
5. **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Lucide React icons

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/company-finder.git
cd company-finder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

Create a table called `companies` in your Supabase project with the following SQL:

```sql
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  abn VARCHAR(11) UNIQUE,
  company_name TEXT NOT NULL,
  business_type TEXT,
  industry TEXT,
  state TEXT,
  postcode TEXT,
  suburb TEXT,
  registration_status TEXT,
  registration_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_companies_name ON companies USING GIN (to_tsvector('english', company_name));
CREATE INDEX idx_companies_industry ON companies (industry);
CREATE INDEX idx_companies_state ON companies (state);
CREATE INDEX idx_companies_status ON companies (registration_status);
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── companies/
│   │   │   ├── route.ts          # Search companies API
│   │   │   └── [id]/route.ts     # Get single company API
│   │   └── export/route.ts       # Export CSV API
│   ├── company/
│   │   └── [id]/page.tsx         # Company detail page
│   ├── components/
│   │   ├── SearchBar.tsx         # Search input component
│   │   ├── CompanyCard.tsx       # Company display card
│   │   ├── FilterPanel.tsx       # Search filters
│   │   └── ExportButton.tsx      # CSV export button
│   ├── lib/
│   │   ├── supabase.ts          # Database client
│   │   └── types.ts             # TypeScript types
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
```

## License

MIT
