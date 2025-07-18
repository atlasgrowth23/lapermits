import PermitsTable from './components/PermitsTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orleans Steel - Sales Intelligence</h1>
          <p className="mt-2 text-gray-600">
            New Orleans permit data to identify construction projects and sales opportunities
          </p>
        </div>
        
        <PermitsTable />
      </div>
    </main>
  );
}