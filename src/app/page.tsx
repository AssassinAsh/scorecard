import Link from 'next/link'
import { getTournaments } from './actions/tournaments'

export default async function Home() {
  const tournaments = await getTournaments()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Cricket Scorecard</h1>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Scorer Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold mb-4">Tournaments</h2>
        
        {tournaments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No tournaments available yet
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tournament.name}
                </h3>
                <p className="text-sm text-gray-600">
                  📍 {tournament.location}
                </p>
                <p className="text-sm text-gray-600">
                  📅 {new Date(tournament.start_date).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
